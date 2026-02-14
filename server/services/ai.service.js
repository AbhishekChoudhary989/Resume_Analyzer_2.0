require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. Initialize Gemini
const googleKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(googleKey || "dummy_key");

// --- HELPER: Clean Text ---
function cleanText(text) {
    if (!text) return "";
    return text.replace(/\0/g, '').replace(/[^\x20-\x7E\n]/g, '').trim().substring(0, 15000);
}

// --- HELPER: Safe JSON Parser ---
function safeJSONParse(jsonString) {
    try {
        let clean = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
        const first = clean.indexOf('{');
        const last = clean.lastIndexOf('}');
        if (first !== -1 && last !== -1) clean = clean.substring(first, last + 1);
        return JSON.parse(clean);
    } catch (e) {
        return null;
    }
}

// ============================================================
// 1. RESUME ANALYSIS (Strict Mode)
// ============================================================
async function analyzeResume(resumeText, jobTitle) {
    const cleanedText = cleanText(resumeText);
    const targetRole = jobTitle || "Software Engineer";

    const fallback = {
        overallScore: 40,
        summary: "Analysis incomplete.",
        headPoints: ["Resume Parsed"],
        ATS: { score: 40, tips: [{ type: "improve", tip: "Ensure resume matches job description." }] },
        content: { score: 50, tips: [] },
        structure: { score: 60, tips: [] },
        skills: { score: 40, tips: [] },
        toneAndStyle: { score: 70, tips: [] },
        missingKeywords: ["Java", "Python", "React"]
    };

    const prompt = `
        You are a Ruthless ATS Scanner.
        TARGET ROLE: "${targetRole}"
        RESUME: ${cleanedText}

        INSTRUCTIONS:
        1. Compare strictly against "${targetRole}".
        2. If different field, score under 40.
        3. Identify 5 missing keywords.
        
        RETURN EXACT JSON:
        {
            "companyName": "Last Company",
            "jobTitle": "Detected Role",
            "overallScore": 0-100,
            "summary": "2-sentence summary.",
            "headPoints": ["Strength1", "Strength2", "Strength3"],
            "missingKeywords": ["Key1", "Key2", "Key3"],
            "ATS": { "score": 0-100, "tips": [{"type": "improve", "tip": "advice"}] },
            "content": { "score": 0-100, "tips": [{"type": "good", "tip": "advice"}] },
            "structure": { "score": 0-100, "tips": [{"type": "improve", "tip": "advice"}] },
            "skills": { "score": 0-100, "tips": [{"type": "improve", "tip": "advice"}] },
            "toneAndStyle": { "score": 0-100, "tips": [{"type": "good", "tip": "advice"}] }
        }
    `;

    try {
        console.log(`🤖 Analyzing with Groq for ${targetRole}...`);
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "Strict ATS Scanner. JSON only." }, { role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });
        return safeJSONParse(completion.choices[0]?.message?.content) || fallback;
    } catch (error) {
        console.warn(`⚠️ Groq Failed. Switching to Gemini...`);
        try {
            if (!googleKey) throw new Error("No Gemini Key");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (geminiError) {
            return fallback;
        }
    }
}

// ============================================================
// 2. ROADMAP GENERATION
// ============================================================
async function generateRoadmap(resumeText, params) {
    const cleanedText = cleanText(resumeText);
    const fallback = { roadmap: [{ step: "Basics", description: "Learn fundamentals.", resources: [] }] };

    const prompt = `
        Create a 5-step roadmap for ${params.job_title} in ${params.location}.
        RESUME: ${cleanedText.substring(0, 4000)}
        RETURN JSON: { "roadmap": [{ "step": "...", "description": "...", "resources": ["..."] }] }
    `;

    try {
        if (googleKey) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const res = await model.generateContent(prompt);
            const parsed = safeJSONParse(res.response.text());
            if (parsed) return parsed;
        }
        throw new Error("Gemini Failed");
    } catch (e) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return safeJSONParse(completion.choices[0]?.message?.content) || fallback;
        } catch (err) {
            return fallback;
        }
    }
}

// ============================================================
// 3. SEARCH PARAMS
// ============================================================
async function extractSearchParams(resumeText) {
    const cleanedText = cleanText(resumeText);
    const defaultParams = { job_title: "Software Engineer", location: "India" };
    const prompt = `Extract job_title and location from: ${cleanedText.substring(0, 1000)}. Return JSON: { "job_title": "...", "location": "..." }`;

    try {
        if (googleKey) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const res = await model.generateContent(prompt);
            return safeJSONParse(res.response.text()) || defaultParams;
        }
        throw new Error("No Gemini");
    } catch (e) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return safeJSONParse(completion.choices[0]?.message?.content) || defaultParams;
        } catch (err) {
            return defaultParams;
        }
    }
}

// ============================================================
// 4. LINKEDIN OPTIMIZER
// ============================================================
async function generateAIContent(type, data) {
    if (type !== "LINKEDIN_OPTIMIZATION") return {};
    const prompt = `Optimize LinkedIn based on resume: ${cleanText(data.resumeText).substring(0, 5000)}. Return JSON: { "headlines": [], "about": "" }`;

    try {
        if (googleKey) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const res = await model.generateContent(prompt);
            const parsed = safeJSONParse(res.response.text());
            if (parsed) return parsed;
        }
        throw new Error("Gemini Failed");
    } catch (e) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            return safeJSONParse(completion.choices[0]?.message?.content) || { headlines: [], about: "Optimization Failed." };
        } catch (err) {
            return { headlines: ["Optimization Failed"], about: "Error." };
        }
    }
}

// ============================================================
// 5. CODEQUEST (Strict: Challenge Generator vs Code Review)
// ============================================================
async function generateCodeQuestReview(userCode) {

    // ✅ CRITICAL FIX: Robust Mode Detection
    const isQuestionRequest =
        !userCode ||
        userCode.length < 50 || // Boilerplate is around 30-40 chars, real code is longer
        userCode.includes("Generate Question") ||
        userCode.includes("CMD:GENERATE_QUESTION") ||
        userCode.trim().startsWith("// Write your");

    // --- MODE 1: GENERATE QUESTION ONLY ---
    if (isQuestionRequest) {
        const lang = userCode.includes("python") ? "Python" : "JavaScript"; // Basic lang detection
        console.log(`🎲 Generating ${lang} Question...`);

        const prompt = `
            Act as a Technical Interviewer.
            Generate ONE medium-level ${lang} coding interview problem.
            
            IMPORTANT:
            1. Output ONLY the problem description.
            2. Do NOT include the solution code.
            
            FORMAT (Markdown):
            ## [Problem Title]
            **Difficulty:** Medium
            
            **Problem Statement:**
            [Description]
            
            **Example:**
            Input: ...
            Output: ...
            
            **Constraints:**
            - ...
        `;

        try {
            if (googleKey) {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const res = await model.generateContent(prompt);
                return res.response.text();
            }
            throw new Error("No Gemini");
        } catch (e) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile"
                });
                return completion.choices[0]?.message?.content;
            } catch(err) {
                return "## Two Sum\nFind two numbers that add up to target.";
            }
        }
    }

    // --- MODE 2: REVIEW CODE (When user actually submits code) ---
    console.log("🧐 Reviewing User Code...");
    const prompt = `
        You are a Senior Software Engineer.
        Review this candidate's solution.
        
        USER CODE:
        ${userCode.substring(0, 5000)}

        INSTRUCTIONS:
        1. Rating: 0-100 (Be strict).
        2. Bugs: List logic errors.
        3. Solution: Provide the optimized, correct code.

        RETURN MARKDOWN:
        ## Rating: [Score]/100
        
        ### 🐛 Analysis
        - [Point 1]
        
        ### ✅ Optimal Solution
        \`\`\`javascript
        [Code]
        \`\`\`
    `;

    try {
        if (googleKey) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const res = await model.generateContent(prompt);
            return res.response.text();
        }
        throw new Error("Gemini Failed");
    } catch (e) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile"
            });
            return completion.choices[0]?.message?.content || "Review Failed.";
        } catch (err) {
            return "## Review Unavailable";
        }
    }
}

module.exports = {
    analyzeResume,
    generateRoadmap,
    extractSearchParams,
    generateAIContent,
    generateCodeQuestReview
};