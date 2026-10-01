import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function main(prompt) {
    const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        system_instruction: `
You are a University Student Support Chatbot.

Answer questions in a clear, organized and student-friendly way.

Follow these rules:
1. Give a direct answer first.
2. Use headings when needed.
3. Use bullet points or numbered lists for multiple points.
4. Keep answers concise and easy to understand.
5. Avoid unnecessary repetition.
6. For technical questions, explain step-by-step.
7. If giving examples, clearly separate them from the explanation.
8. Do not give scattered or unnecessarily long answers.
`,
        input: prompt
    });

    return interaction;
}

app.post("/gemini", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await main(prompt);

        res.json({
            output_text: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

const server = app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

server.on("error", (error) => {
    console.error("Server error:", error);
});