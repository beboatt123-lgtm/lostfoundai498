const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../config/storage');
const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem,
    aiSearch,
    exportItems,
    generateAIImage
} = require('../controllers/itemController');

const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.get('/export', protect, admin, exportItems);
router.post('/ai-search', optionalProtect, aiSearch);
router.post('/generate-image', protect, generateAIImage);

router.route('/')
    .get(optionalProtect, getItems)
    .post(protect, upload.array('images', 5), createItem);

router.route('/:id')
    .get(getItem)
    .put(protect, updateItem)
    .patch(protect, upload.single('receiverImage'), updateItem)
    .delete(protect, deleteItem);

module.exports = router;
