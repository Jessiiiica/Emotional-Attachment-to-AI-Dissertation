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

//connect with the frontend
server.post("/api/conversation", async (req, res) => {
    try {
        const {message} = req.body;

        if (!message) {
            return res.status(400).json({ error: "missing message" });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ role: "user", parts: [{ text: message }] },],
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