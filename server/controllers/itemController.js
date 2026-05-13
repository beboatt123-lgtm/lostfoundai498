const asyncHandler = require('express-async-handler');
const Item = require('../models/Item');
const { analyzeItemImage } = require('../utils/aiService');

// @desc    Create new item (Lost/Found)
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
    const { 
        title, description, type, category, locationMain, 
        locationDetail, date, reporterIdCard, reporterPhone, storagePosition 
    } = req.body;

    let images = req.files ? req.files.map(file => file.path) : [];
    
    // Add AI generated image if exists
    if (req.body.aiGeneratedImage) {
        images.push(req.body.aiGeneratedImage);
    }

    if (images.length === 0) {
        res.status(400);
        throw new Error('Please upload at least one image or generate one with AI');
    }

    const item = await Item.create({
        user: req.user.id,
        title,
        description,
        type,
        category,
        locationMain,
        locationDetail,
        location: `${locationMain} ${locationDetail}`, // Compatibility for old fields if any
        date,
        reporterIdCard,
        reporterPhone,
        storagePosition: storagePosition || '',
        images,
        status: 'open'
    });

    // Run AI analysis
    if (images.length > 0) {
        try {
            const aiResult = await analyzeItemImage(images[0]);
            if (aiResult) {
                item.aiTags = aiResult.tags;
                item.aiDescription = aiResult.description;
                await item.save();
            }
        } catch (err) {
            console.error("Delayed AI analysis failed:", err);
        }
    }

    // Requirement 13: AI Matching Logic
    // Search for items of the opposite type that might match
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    let matches = [];
    
    try {
        // Simple keyword matching for now (Requirement 13)
        // In a real system, we'd use vector search or Gemini to compare
        const keywords = title.split(' ').filter(k => k.length > 2);
        
        const potentialMatches = await Item.find({
            type: oppositeType,
            status: 'open',
            $or: [
                { category: category },
                { title: { $regex: keywords.join('|'), $options: 'i' } },
                { aiTags: { $in: item.aiTags || [] } } // Compare with AI generated tags
            ]
        }).limit(5);

        matches = potentialMatches;
    } catch (err) {
        console.error("AI Matching failed:", err);
    }

    res.status(201).json({
        item,
        matches, // Requirement 13
        message: matches.length > 0 ? 'ตรวจพบของที่คล้ายคลึงกันในระบบ!' : 'สร้างประกาศสำเร็จ'
    });
});

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = asyncHandler(async (req, res) => {
    const { type, category, search, user, status } = req.query;
    let query = {};

    // Filter by user:
    // 1. If requester is admin/staff, they can see everything or filter by a specific user if provided in query.
    // 2. If requester is a regular user, they only see THEIR OWN items.
    // 3. If guest (not logged in), they see NOTHING (or we could show all, but user requested 'only see own').
    
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        if (user) {
            query.user = user;
        }
    } else if (req.user) {
        query.user = req.user._id;
    } else {
        // Guest - return empty list as they aren't a user
        return res.status(200).json([]);
    }

    // Default status to 'open' unless specified (e.g. 'all' or 'closed')
    if (status) {
        if (status !== 'all') {
            query.status = status;
        }
    } else {
        query.status = 'open';
    }

    if (type) {
        query.type = type;
    }
    if (category) {
        query.category = category;
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { locationMain: { $regex: search, $options: 'i' } },
            { locationDetail: { $regex: search, $options: 'i' } },
            { customId: { $regex: search, $options: 'i' } } // Also allow searching by Unique ID
        ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    res.status(200).json(items);
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id).populate('user', 'firstname lastname avatar email');

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    res.status(200).json(item);
});

// @desc    Update item status
// @route   PUT /api/items/:id
// @access  Private
const updateItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Ensure logged in user matches the item user or is admin
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updateData = { ...req.body };
    
    if (req.file) {
        updateData.receiverImage = req.file.path;
    }

    if (updateData.status === 'resolved') {
        updateData.resolvedAt = new Date();
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
    });

    res.status(200).json(updatedItem);
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    // Ensure logged in user matches the item user or is admin
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    await item.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    AI-powered search for items
// @route   POST /api/items/ai-search
// @access  Public
const aiSearch = asyncHandler(async (req, res) => {
    const { query } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Please provide a search query');
    }

    // Filter items based on user role
    let itemQuery = { status: 'open' };
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        // Admin sees all open items
    } else if (req.user) {
        // User only searches their own open items
        itemQuery.user = req.user._id;
    } else {
        // Guest sees nothing
        return res.status(200).json({
            answer: "กรุณาเข้าสู่ระบบเพื่อใช้งานระบบค้นหาอัจฉริยะครับ",
            matches: []
        });
    }

    const items = await Item.find(itemQuery)
        .populate('user', 'firstname lastname avatar')
        .sort({ createdAt: -1 });

    if (items.length === 0) {
        return res.status(200).json({
            answer: "ขออภัยครับ ตอนนี้ยังไม่มีรายการสิ่งของในระบบเลยครับ",
            matches: []
        });
    }

    try {
        console.log("AI Search Triggered with query:", query);
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const itemsContext = items.map(item => ({
            id: item._id,
            title: item.title,
            description: item.description,
            type: item.type,
            category: item.category,
            location: item.location,
            aiTags: item.aiTags?.join(', ')
        }));

        const prompt = `You are a helpful Lost & Found AI Assistant named "L&F AI Helper". 
        User Question: "${query}"
        
        Available Items in Database: ${JSON.stringify(itemsContext)}
        
        Task:
        1. Identify which items from the database might match the user's query. Better to include multiple possible matches if they are relevant.
        2. Respond in a friendly Thai language.
        3. If there are matches, list them and explain why they match briefly. Use a polite tone ("ครับ/ค่ะ").
        4. If no obvious matches, suggest what the user should do next (e.g., "ลองพิมพ์รายละเอียดให้ชัดเจนขึ้น หรือสร้างประกาศของหายไว้ในระบบนะครับ").
        5. Return ONLY a valid JSON object. DO NOT add any markdown formatting or extra text.
        
        JSON Structure:
        {
          "answer": "Your friendly Thai response here...",
          "matchIds": ["list", "of", "matching", "item", "ids"]
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
            return res.status(200).json({
                answer: "ขออภัยครับ ผมไม่สามารถให้ข้อมูลเกี่ยวกับเรื่องนี้ได้เนื่องจากข้อจำกัดด้านความปลอดภัยของระบบครับ",
                matches: []
            });
        }

        let aiText = response.text();
        console.log("Raw AI Response:", aiText);

        // Remove markdown formatting if present
        aiText = aiText.replace(/```json|```/g, "").trim();

        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let aiResponse;
            try {
                aiResponse = JSON.parse(jsonMatch[0]);
            } catch (pErr) {
                console.error("JSON Parse Error:", pErr, "Raw text:", jsonMatch[0]);
                return res.status(200).json({
                    answer: "ขออภัยครับ ผมประมวลผลข้อมูลผิดพลาดเล็กน้อย ลองถามใหม่อีกครั้งนะครับ",
                    matches: []
                });
            }

            // Filter the actual item objects for the frontend
            const matchedItems = items.filter(item =>
                aiResponse.matchIds && Array.isArray(aiResponse.matchIds) &&
                aiResponse.matchIds.includes(item._id.toString())
            );

            res.status(200).json({
                answer: aiResponse.answer || "นี่คือรายการที่ผมหาพบครับ",
                matches: matchedItems
            });
        } else {
            res.status(200).json({
                answer: "ขออภัยครับ ผมไม่สามารถประมวลผลคำค้นหาได้ในขณะนี้ ลองใหม่อีกครั้งนะครับ",
                matches: []
            });
        }
    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการค้นหาด้วย AI",
            details: error.message
        });
    }
});

// @desc    Export all items to Excel
// @route   GET /api/items/export
// @access  Private (Admin)
const exportItems = asyncHandler(async (req, res) => {
    const XLSX = require('xlsx');
    const items = await Item.find({}).populate('user', 'firstname lastname email');

    const data = items.map(item => ({
        'Unique ID': item.customId,
        'Title': item.title,
        'Type': item.type === 'lost' ? 'แจ้งหาย' : 'พบสิ่งของ',
        'Category': item.category,
        'Location (Main)': item.locationMain,
        'Location (Detail)': item.locationDetail,
        'Storage Position': item.storagePosition,
        'Reporter Name': `${item.user?.firstname} ${item.user?.lastname}`,
        'Reporter ID Card': item.reporterIdCard,
        'Reporter Phone': item.reporterPhone,
        'Date': new Date(item.date).toLocaleDateString(),
        'Status': item.status,
        'Created At': item.createdAt.toLocaleDateString()
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LostFound Items');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=lostfound_report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

const cloudinary = require('../config/cloudinary');

// @desc    Generate AI Image for an item
// @route   POST /api/items/generate-image
// @access  Private
const generateAIImage = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please provide a title');
    }

    try {
        const { generateImagePrompt } = require('../utils/aiService');
        const aiPrompt = await generateImagePrompt(title, description);
        
        // Use Pollinations AI (Free and no API Key required)
        const encodedPrompt = encodeURIComponent(aiPrompt);
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true&model=flux`;

        // To make it persistent and comply with my app structure, 
        // let's upload this generated image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
            folder: 'lostfound_ai',
        });

        res.status(200).json({
            imageUrl: uploadResponse.secure_url,
            prompt: aiPrompt
        });
    } catch (error) {
        console.error("AI Image Generation failed:", error);
        res.status(500);
        throw new Error('Failed to generate image');
    }
});

module.exports = {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    aiSearch,
    exportItems,
    generateAIImage
};
