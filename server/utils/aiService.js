const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const axios = require('axios');

// Configure Gemini (Need GEMINI_API_KEY in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const nativeAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Download image from URL and convert to base64
 */
async function urlToGenerativePart(url, mimeType) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return {
            inlineData: {
                data: Buffer.from(response.data).toString("base64"),
                mimeType
            },
        };
    } catch (error) {
        console.error("Error downloading image for AI:", error.message);
        return null;
    }
}

/**
 * AI Service to analyze image content
 */
const analyzeItemImage = async (imageUrl) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not defined. AI analysis skipped.");
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this image for a Lost & Found application.
        Please provide:
        1. A list of 5-8 short, descriptive English tags (e.g., iPhone, Black, Cracked Screen, Wallet, Car Key).
        2. A very detailed description of the item in Thai (ลักษณะของสิ่งของ, สี, ตำหนิ, ยี่ห้อ).
        Format the output as a valid JSON object:
        { "tags": ["tag1", "tag2"], "description": "รายละเอียดภาษาไทย..." }`;

        // We assume JPG for simplicity, or we can get it from the URL
        const imagePart = await urlToGenerativePart(imageUrl, "image/jpeg");

        if (!imagePart) return null;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (sometimes AI adds markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return null;
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return null;
    }
};

/**
 * AI Service to generate image prompt from text
 */
const generateImagePrompt = async (title, description) => {
    if (!process.env.GEMINI_API_KEY) return `A professional product photo of ${title}`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are an expert at creating prompts for AI image generators. 
        I have a lost or found item described as:
        Title: ${title}
        Description: ${description}
        
        Please create a highly detailed English prompt for an AI image generator (like Stable Diffusion) to create a clear, realistic, single-item product photo of this object. 
        Focus on physical characteristics, materials, colors, and textures. 
        The photo should be on a plain, neutral studio background.
        Return ONLY the final English prompt text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI Prompt Generation Error:", error);
        return `A clear product photo of ${title}, ${description}`;
    }
};

/**
 * Native Image Generation using Gemini 3.1 Flash
 */
const generateNativeImage = async (title, description) => {
    try {
        // 1. Get a good prompt using Gemini 1.5 Flash (since it's better at text reasoning)
        const aiPrompt = await generateImagePrompt(title, description);
        
        console.log("Generating Native Image with prompt:", aiPrompt);

        // 2. Use Gemini 3.1 Flash for image generation
        const response = await nativeAI.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [{ text: aiPrompt }],
            config: {
                responseModalities: ['IMAGE'],
                imageConfig: {
                    aspectRatio: '1:1',
                    imageSize: '1K',
                },
            },
        });

        // 3. Extract image data
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    base64: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                    prompt: aiPrompt
                };
            }
        }
        throw new Error("No image data returned from Gemini");
    } catch (error) {
        console.error("Native Image Generation Error:", error);
        throw error;
    }
};

module.exports = { analyzeItemImage, generateImagePrompt, generateNativeImage };
