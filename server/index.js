require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

const { generateRoadmap, extractSearchParams } = require('./services/ai.service');
const { fetchIndeedJobs } = require('./services/scraper');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/kv', require('./routes/kv'));
app.use('/api/ai', require('./routes/ai'));

// --- ROUTE 1: FAST ROADMAP ---
app.post('/api/roadmap', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // 1. Read PDF
        const dataBuffer = fs.readFileSync(req.file.path);
        let resumeText = "";

        try {
            const pdfData = await pdf(dataBuffer);
            resumeText = pdfData.text;
        } catch (pdfError) {
            console.error("PDF Parse Error:", pdfError);
            return res.status(400).json({ error: "Could not read PDF file." });
        }

        // Clean Text (Remove null bytes that crash some AIs)
        resumeText = resumeText.replace(/\0/g, '').trim();

        if (resumeText.length < 50) return res.status(400).json({ error: "Resume text too short or unreadable." });

        console.log(`📄 Resume Processed (${resumeText.length} chars). Generating Roadmap...`);

        // 2. AI Tasks
        // NOTE: We now pass the ACTUAL extracted params to the roadmap generator!
        const searchParams = await extractSearchParams(resumeText);

        console.log("🔍 Extracted Params:", searchParams);

        const roadmap = await generateRoadmap(resumeText, searchParams);

        // Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({
            analysis: roadmap,
            searchParams: searchParams
        });

    } catch (error) {
        console.error("Roadmap Route Crash:", error);
        res.status(500).json({ error: "Internal Server Error during Analysis." });
    }
});

// --- ROUTE 2: BACKGROUND JOBS ---
app.post('/api/jobs', async (req, res) => {
    try {
        const { job_title, location } = req.body;
        // Fallback defaults if params missing
        const title = job_title || "Developer";
        const loc = location || "India";

        console.log(`🔎 Background Job Search: ${title} in ${loc}`);
        const liveJobs = await fetchIndeedJobs(title, loc);
        res.json({ live_jobs: liveJobs });

    } catch (error) {
        console.error("Job Search Error:", error);
        res.json({ live_jobs: [] });
    }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-analyzer')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});