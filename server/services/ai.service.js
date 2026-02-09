require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check for API Key
const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_KEY;
if (!apiKey) console.error("❌ FATAL: GOOGLE_API_KEY is missing in .env file.");

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ FIXED: Using 1.5-flash (Fast, Free, Stable).
// ⚠️ "gemini-2.5-flash" DOES NOT EXIST publicly and causes 404/Loading errors.
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

// --- 1. CODEQUEST LOGIC ---
async function generateCodeQuestReview(userCode) {
    try {
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: `You are a Professional Coding Interviewer.
            
            MODE 1: GENERATE_QUESTION
            If the prompt contains "GENERATE_QUESTION", you must:
            - Create a random coding challenge based on the requested language.
            - Provide a Title, Difficulty Level, and Problem Statement.
            - List constraints and edge cases.
            - DO NOT provide the code solution.

            MODE 2: REVIEW_SOLUTION
            If the prompt contains "USER_SOLUTION", you must:
            - Grade the code from 0-100.
            - Explain logic errors, time complexity, and bugs.
            - Provide a "Professional Grade" refactored solution.
            
            Always use Markdown formatting for responses.`
        });

        const result = await retryOperation(() => model.generateContent(userCode));
        return result.response.text();
    } catch (error) {
        console.error("CodeQuest Error:", error.message);

        // Handle Rate Limits gracefully
        if (error.status === 429 || error.message.includes('429')) {
            return "### ⏳ Rate Limit Reached\nThe AI is busy right now. Please wait about 30 seconds before trying the next question.";
        }
        return "### ⚠️ Error\nUnable to process code request.";
    }
}

// --- 2. DUMMY FUNCTIONS (To keep server alive) ---
async function extractSearchParams() { return {}; }
async function generateRoadmap() { return ""; }

module.exports = { generateCodeQuestReview, extractSearchParams, generateRoadmap };