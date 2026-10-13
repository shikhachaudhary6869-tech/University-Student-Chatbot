import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const dataPath = path.join(process.cwd(), "data");

const universityData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "university.json"), "utf-8")
);

const academicsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "academics.json"), "utf-8")
);

const examsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "exams.json"), "utf-8")
);

const placementsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "placements.json"), "utf-8")
);

const faqData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "faq.json"), "utf-8")
);

app.use(cors());
app.use(express.json({ limit: "64kb" }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
    ? new GoogleGenAI({ apiKey })
    : null;

/*
 * Vercel routes matching requests to this serverless function (api/index.js),
 * so req.url arrives as "/api/...". Strip that prefix so the routes below can
 * stay path-agnostic and work identically when running `node index.js`.
 */
app.use((req, _res, next) => {
    if (req.url === "/api" || req.url.startsWith("/api/")) {
        req.url = req.url.slice(4) || "/";
    }
    next();
});

/*
 * Basic per-instance rate limit to protect the GEMINI_API_KEY from abuse.
 * NOTE: serverless instances are ephemeral and not shared, so this is a
 * best-effort guard, not a hard limit. Add Upstash/Vercel KV for real quotas.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const hits = new Map();

function rateLimit(req, res, next) {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return next();
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
        return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }

    entry.count += 1;
    next();
}

// Simple sweep so the Map cannot grow unbounded on a long-lived instance.
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
        if (now > entry.resetAt) hits.delete(key);
    }
}, RATE_LIMIT_WINDOW_MS).unref();

const SYSTEM_INSTRUCTION = `
You are an AI-Powered University Student Support Assistant.

Your main purpose is to help university students with academic and university-related questions.

You can assist students with:
- Academic subjects and concepts
- Examination-related questions
- Courses and departments
- University procedures
- Timetables and academic schedules
- Fees and registration guidance
- Scholarships
- Placements and career guidance
- University facilities and services
- Frequently asked questions
- Study planning and learning support

Response rules:
1. Give the direct answer first.
2. Use simple and student-friendly language.
3. Use headings for longer answers.
4. Use bullet points or numbered lists when appropriate.
5. For technical questions, explain step-by-step.
6. Keep answers concise but useful.
7. Do not invent university-specific information.
8. If university-specific information is not available, clearly say that the information is not available and suggest that the student check the official university source or contact the appropriate department.
9. Clearly distinguish general knowledge from university-specific information.
10. Do not claim that you have access to private student records.
11. Never ask students for passwords, API keys, or other sensitive credentials.
12. If a question is unrelated to university or education, answer briefly and politely redirect the student toward student-support topics.
`;

async function classifyQuestion(prompt) {
    try {
        const response = await fetch("http://127.0.0.1:8001/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: prompt }),
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            throw new Error("ML API request failed");
        }

        const result = await response.json();
        return result.category || "general";
    } catch (error) {
        console.error("ML classification unavailable:", error.message);
        return "general";
    }
}

async function main(prompt) {
    const category = await classifyQuestion(prompt);
console.log("ML predicted category:", category);
    const universityContext = JSON.stringify({
    university: universityData,
    academics: academicsData,
    exams: examsData,
    placements: placementsData,
    faq: faqData
}, null, 2);
    const input = `
University information:

${universityContext}
Predicted question category: ${category}
Use this category as a helpful hint, but prioritize the student's actual question if the category is incorrect.
Student question:
${prompt}

Answer the student's question using the university information when relevant.
Do not invent university-specific information.
`;

    const interaction = await ai.interactions.create({
        model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
        system_instruction: SYSTEM_INSTRUCTION,
        input: input
    });

    return interaction;
}


app.get("/health", (_req, res) => {
    res.json({ status: "ok", api_key_configured: Boolean(apiKey) });
});

app.post("/gemini", rateLimit, async (req, res) => {
    if (!ai) {
        console.error("GEMINI_API_KEY is not set");
        return res.status(500).json({ error: "Server is not configured" });
    }

    const prompt = req.body?.prompt;

    if (typeof prompt !== "string" || prompt.trim() === "") {
        return res.status(400).json({ error: "A non-empty 'prompt' string is required" });
    }

    if (prompt.length > 4000) {
        return res.status(400).json({ error: "Prompt is too long (max 4000 characters)" });
    }

    try {
        const response = await main(prompt.trim());
        console.log("Gemini response received:", response);


        res.json({
            output_text: response.output_text ?? "Sorry, I could not understand that."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

export default app;
