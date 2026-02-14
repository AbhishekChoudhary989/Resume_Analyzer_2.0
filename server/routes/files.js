const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// ✅ FIX: Use upload.array('files') to match Frontend
router.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Upload failed" });
    }

    // Return the URL exactly as Frontend expects
    const files = req.files.map(f => ({
        url: `http://localhost:5000/uploads/${f.filename}`
    }));

    res.json(files);
});

module.exports = router;