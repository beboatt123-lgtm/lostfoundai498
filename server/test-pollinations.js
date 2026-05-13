require('dotenv').config();
const axios = require('axios');
const cloudinary = require('./config/cloudinary');

async function testPollinationsGen() {
    console.log("Testing Pollinations AI + Cloudinary...");
    
    try {
        const title = "Blue Water Bottle";
        const description = "A simple blue plastic water bottle on a white table";
        
        // 1. Generate Prompt (simulated simple prompt)
        const aiPrompt = `A clear product photo of ${title}`;
        const encodedPrompt = encodeURIComponent(aiPrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
        
        console.log("Image URL created:", imageUrl);
        console.log("Fetching image buffer from Pollinations...");

        // 2. Fetch image buffer
        const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageRes.data);
        console.log("Image fetched! Buffer size:", buffer.length);
        console.log("Buffer start (string):", buffer.toString('utf8').substring(0, 100));

        if (buffer.toString('utf8').includes('<!DOCTYPE html>') || buffer.toString('utf8').includes('<html')) {
            throw new Error("Received HTML instead of image. Pollinations AI might be busy or redirected.");
        }

        // 3. Upload buffer to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: 'test_ai_generation',
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(buffer);
        });

        console.log("SUCCESS!");
        console.log("Cloudinary URL:", uploadResponse.secure_url);
        console.log("Public ID:", uploadResponse.public_id);

    } catch (error) {
        console.error("TEST FAILED!");
        console.log("Full Error Object:", error);
    }
}

testPollinationsGen();
