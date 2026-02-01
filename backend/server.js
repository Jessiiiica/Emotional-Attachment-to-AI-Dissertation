import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const server = express();
server.use(cors({
    origin: ["http://127.0.0.1:5500","http://localhost:5500"]
}));
server.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });

function botPersonality(chatBot) {
    if (chatBot === "A") {
        return "You are a friendly and warm chatbot. Be supportive and conversational"
    } else {
        return "You are a direct and task focused chatbot. Be concise and avoid emotional language"
    }
}

//connect with the frontend
server.post("/api/conversation", async (req, res) => {
    try {
        const {message, chatBot} = req.body;

        if (!message) {
            return res.status(400).json({ error: "missing message" });
        }
        
        const chatBotPersonality = botPersonality(chatBot);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: chatBotPersonality }] },
            { role: "user", parts: [{ text: message }] }],
        });

        let reply = "";
        if (response.text != null) {
            reply = response.text
        }
        else {
            reply = "";
        }

        //send our reply to the frontend
        res.json({ reply });
    
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Request to chatbot failed" });
    }
});

//Start the server listening
server.listen(3000, () => {
    console.log("Server on at http://localhost:3000")
})