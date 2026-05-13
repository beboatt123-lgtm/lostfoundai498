const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

async function testImageGen() {
    console.log("Testing Gemini 3.1 Flash Native Image Gen...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const prompt = "A professional product photo of a blue water bottle on a white background";
        console.log("Using prompt:", prompt);

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: prompt,
            config: {
                responseModalities: ["IMAGE"]
            }
        });

        console.log("Response received successfully!");
        console.log("Parts count:", response.candidates[0].content.parts.length);
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                console.log("Image data found! (Base64 length:", part.inlineData.data.length, ")");
            } else if (part.text) {
                console.log("Text found:", part.text);
            }
        }
    } catch (error) {
        console.error("TEST FAILED!");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
    }
}

testImageGen();
