const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { analyzeResume, generateCodeQuestReview, generateAIContent } = require('../services/ai.service');

// Helper to extract text from PDF
async function extractText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (e) {
        console.error("PDF Parsing Error:", e);
        return "";
    }
}

// ✅ MATCHES FRONTEND: /api/ai/chat
router.post('/chat', async (req, res) => {
    try {
        const { prompt, fileUrl } = req.body;

        // 1. Locate the file on the server
        let resumeText = "";
        if (fileUrl && fileUrl.includes('/uploads/')) {
            const filename = fileUrl.split('/uploads/')[1];
            const filePath = path.resolve(__dirname, '..', 'uploads', filename);

            if (fs.existsSync(filePath)) {
                resumeText = await extractText(filePath);
            }
        }

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({ error: "Could not read resume file." });
        }

        // 2. Extract Job Title from your prompt "Target Role: X"
        const jobTitle = prompt.replace("Target Role:", "").split('.')[0].trim();

        // 3. Call Gemini AI
        const analysis = await analyzeResume(resumeText, jobTitle);

        // 4. Send response in the EXACT format Frontend expects
        // Frontend expects: data.message.content
        res.json({
            message: {
                content: JSON.stringify(analysis)
            }
        });

    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ error: "AI Analysis Failed" });
    }
});

// ROUTE 2: CODEQUEST
router.post('/get-review', async (req, res) => {
    try {
        const { code } = req.body;
        const result = await generateCodeQuestReview(code);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: "Failed to process code review" });
    }
});

// ROUTE 3: LINKEDIN
router.post('/linkedin-optimize', async (req, res) => {
    try {
        const { resumeText } = req.body;
        const result = await generateAIContent("LINKEDIN_OPTIMIZATION", { resumeText });
        res.json({ result });
    } catch (e) {
        res.status(500).json({ error: "Failed to optimize profile" });
    }
});

module.exports = router;