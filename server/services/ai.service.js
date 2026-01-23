require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check for API Key
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_KEY;
if (!apiKey) console.error("❌ FATAL: GOOGLE_API_KEY is missing in .env file.");

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ FIXED: Using 1.5-flash (Fast, Free, Stable).
// ⚠️ "gemini-2.5-flash" causes errors. Do not change this back.
const MODEL_NAME = "gemini-2.5-flash";

// Helper: Retry loop
async function retryOperation(operation, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (!error.message.includes('503') && !error.message.includes('overloaded')) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error(`Failed after ${retries} attempts.`);
}

// --- 1. CODEQUEST (Strict Question vs Review Logic) ---
async function generateCodeQuestReview(userCode) {
    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: `You are a strict Coding Interviewer.

            detect the intent of the user input:

            ---
            **CASE 1: GENERATE QUESTION**
            If the input says "GENERATE_QUESTION", return a Markdown formatted coding challenge:
            - **Title:** [Challenge Name]
            - **Difficulty:** [Easy/Medium/Hard]
            - **Description:** Clear problem statement.
            - **Example Input/Output:** Show what the function takes and returns.
            - **Constraints:** e.g., "Time complexity O(n)".
            - **DO NOT** provide the solution code.

            ---
            **CASE 2: REVIEW SOLUTION**
            If the input says "USER_SOLUTION", analyze the code provided by the user.
            Return a Markdown report:
            - **Score:** [0-100]/100
            - **Status:** [Pass/Fail]
            - **Bugs & Feedback:** Bullet points explaining logic errors or edge cases missed.
            - **Optimized Solution:** Provide the correct, efficient code block.

            ---
            **CASE 3: CODE REVIEW**
            If the input says "CODE_REVIEW", provide constructive feedback on style and best practices ONLY. Do not grade it.
            `
        });

        const result = await retryOperation(() => model.generateContent(userCode));
        return result.response.text();
    } catch (error) {
        console.error("CodeQuest Error:", error.message);
        return "### ⚠️ Error\nUnable to process code request.";
    }
}

// --- 2. DUMMY FUNCTIONS (Required to keep Server Alive) ---
async function extractSearchParams() { return {}; }
async function generateRoadmap() { return ""; }

// ✅ EXPORT ONLY CODEQUEST (with dummies for safety)
module.exports = { generateCodeQuestReview, extractSearchParams, generateRoadmap };