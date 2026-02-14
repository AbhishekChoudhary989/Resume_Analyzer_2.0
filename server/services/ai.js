const express = require('express');
const Groq = require("groq-sdk");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const pdf = require('pdf-parse');

const { generateCodeQuestReview, generateAIContent } = require('../services/ai.service');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function extractText(buffer) {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (e) {
        console.error("PDF Parsing Error:", e);
        return "";
    }
}

// --- ROUTE 1: RESUME ANALYSIS (GROQ) ---
router.post('/chat', async (req, res) => {
    try {
        const { prompt, fileUrl } = req.body;
        let resumeText = "";

        if (fileUrl && fileUrl.includes('/uploads/')) {
            const filename = fileUrl.split('/uploads/')[1];
            const filePath = path.resolve(__dirname, '..', 'uploads', filename);

            if (fs.existsSync(filePath)) {
                const buffer = fs.readFileSync(filePath);
                resumeText = await extractText(buffer);
            }
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(400).json({ error: "Resume text could not be read." });
        }

        const systemPrompt = `
        You are an expert ATS (Applicant Tracking System). Analyze the resume text provided.
        If it IS a resume, you MUST return this EXACT JSON structure:
        {
            "companyName": "Candidate's Current/Past Company",
            "jobTitle": "Candidate's Role",
            "overallScore": 85,
            "summary": "3-4 sentence professional summary.",
            "headPoints": ["Key strength 1", "Key strength 2", "Key strength 3"],
            "ATS": { "score": 85, "tips": [{"type": "good", "tip": "advice", "explanation": "reason"}] },
            "content": { "score": 85, "tips": [{"type": "good", "tip": "advice", "explanation": "reason"}] },
            "structure": { "score": 85, "tips": [{"type": "good", "tip": "advice", "explanation": "reason"}] },
            "skills": { "score": 85, "tips": [{"type": "good", "tip": "advice", "explanation": "reason"}] },
            "toneAndStyle": { "score": 85, "tips": [{"type": "good", "tip": "advice", "explanation": "reason"}] }
        }`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Context: ${prompt}\n\nResume Text: ${resumeText.substring(0, 25000)}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const cleanJson = completion.choices[0]?.message?.content || "{}";
        res.json({ message: { content: cleanJson } });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "AI Service Error: " + error.message });
    }
});

// --- ROUTE 2: CODEQUEST REVIEW (GEMINI) ---
router.post('/get-review', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Code snippet is required" });
        const result = await generateCodeQuestReview(code);
        res.json({ result });
    } catch (error) {
        console.error("CodeQuest Route Error:", error);
        res.status(500).json({ error: "Failed to process code review" });
    }
});

// --- ROUTE 3: LINKEDIN OPTIMIZER (GEMINI) ---
router.post('/linkedin-optimize', async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) return res.status(400).json({ error: "Resume text required" });

        const result = await generateAIContent("LINKEDIN_OPTIMIZATION", { resumeText });
        res.json({ result });
    } catch (e) {
        console.error("LinkedIn Error:", e);
        res.status(500).json({ error: "Failed to optimize profile" });
    }
});

module.exports = router;