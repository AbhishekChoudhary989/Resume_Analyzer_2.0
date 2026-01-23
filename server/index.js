require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

// ✅ IMPORT FROM ai.js
const { generateRoadmap, extractSearchParams } = require('./services/ai');
const { fetchIndeedJobs } = require('./services/scraper');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/files', require('./routes/files'));
app.use('/api/kv', require('./routes/kv'));

app.post('/api/roadmap', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text || "";

        if (resumeText.length < 50) return res.status(400).json({ error: "Resume text too short." });

        // 1. Extract Params (AI)
        let params = await extractSearchParams(resumeText);

        // Safety Fallback if AI fails (to prevent scraper crash)
        if (!params || !params.job_title) {
            params = { job_title: "Software Developer", location: "India" };
        }

        // 2. Fetch Jobs (Scraper)
        const liveJobs = await fetchIndeedJobs(params.job_title, params.location);

        // 3. Generate Roadmap (AI)
        const roadmap = await generateRoadmap(resumeText, params, liveJobs);

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({ analysis: roadmap, live_jobs: liveJobs });

    } catch (error) {
        console.error("Roadmap Error:", error);
        res.status(500).json({ error: "Analysis failed." });
    }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-analyzer')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

app.listen(5000, () => console.log(`🚀 Server on http://localhost:5000`));