require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_KEY;
if (!apiKey) console.error("❌ FATAL: GOOGLE_API_KEY is missing.");

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ As requested: Using gemini-2.5-flash
const MODEL_NAME = "gemini-2.5-flash";

async function retryOperation(operation, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (!error.message.includes('503') && !error.message.includes('overloaded')) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error(`Failed after ${retries} attempts.`);
}

// --- 1. CODEQUEST ---
async function generateCodeQuestReview(userCode) {
    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: `You are a Coding Interviewer.
            MODE 1: GENERATE_QUESTION -> Return a coding challenge.
            MODE 2: USER_SOLUTION -> Grade it (0-100) & fix bugs.
            MODE 3: CODE_REVIEW -> Feedback only.
            Always use Markdown.`
        });
        const result = await retryOperation(() => model.generateContent(userCode));
        return result.response.text();
    } catch (error) {
        return "### ⚠️ AI Error\nUnable to process code.";
    }
}

// --- 2. RESUME PARAMS ---
async function extractSearchParams(resumeText) {
    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: { responseMimeType: "application/json" }
        });
        const prompt = `Extract 'job_title' and 'location' from this resume. Default location to 'India'. JSON only. Resume: ${resumeText.substring(0, 1000)}`;

        const result = await retryOperation(() => model.generateContent(prompt));
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("AI Params Error (Using Fallback):", error.message);
        return { job_title: "Software Engineer", location: "India" };
    }
}

// --- 3. ROADMAP ---
async function generateRoadmap(resumeText, jobParams, liveJobs) {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const jobsContext = (liveJobs && liveJobs.length > 0)
            ? liveJobs.map(j => `- Role: ${j.title} at ${j.company} (${j.location})`).join('\n')
            : "No specific market data found.";

        const prompt = `
        Act as a Senior Career Architect.
        Target Role: ${jobParams.job_title}
        Location: ${jobParams.location}
        LIVE MARKET DATA: ${jobsContext}
        RESUME: ${resumeText.substring(0, 5000)}

        TASK: Generate a "Strategic Career Roadmap" in Markdown.
        Headers:
        ## 📊 Executive Profile
        ## 🛠 Skill Gap Analysis
        ## 🚀 6-Month Action Plan
        ## 💰 Salary Intelligence
        `;

        const result = await retryOperation(() => model.generateContent(prompt));
        return result.response.text();

    } catch (error) {
        return `## ⚠️ Analysis Failed\nError: ${error.message}`;
    }
}

module.exports = { generateCodeQuestReview, extractSearchParams, generateRoadmap };