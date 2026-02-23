import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

dotenv.config();

const server = express();
server.use(cors({
    origin: ["http://127.0.0.1:5500","http://localhost:5500"]
}));
server.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });

//store memory during chats
const sessions = new Map();

function botPersonality(chatBot) {
    if (chatBot === "A") {
        return "You are a friendly and warm chatbot. Be supportive and conversational and ask questions but do not use emojis and keep responses to around 2 sentences"
    } else {
        return "You are a direct and task focused chatbot. Respond concisely, clearly and practically. Do not ask follow-up questions. Do not provide emotional reassurance or validation. Do not describe your role or purpose. Do not use system-style language such as Understood, Acknowledged, Affirmative or similar terms. Keep responses short and focused only on user input. If asked casual questions such as a greeting or how are you, respond breifly and socially normally ie. I am good but do not expand or ask the user how they are. If the user makes a netural statement then respond briefly and naturally"
    }
}

function ensureSession(sessionId, chatBot) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            chatBot: chatBot,
            conversation: []
        });
    }

    const session = sessions.get(sessionId);
    if (chatBot) session.chatBot = chatBot;
    return session;
}

function ensureSaving() {
    const folder = path.join(process.cwd(), "savedChats");
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    return folder;
}

//connect with the frontend
server.post("/api/conversation", async (req, res) => {
    try {
        const { message, chatBot, sessionId } = req.body;
        
        const session = ensureSession(sessionId, chatBot);

        session.conversation.push({
            role: "user",
            text: message,
        });
        
        const chatBotPersonality = botPersonality(chatBot);

        const contents = [
            { role: "user", parts: [{ text: chatBotPersonality }] },
            ...session.conversation.map(turn => ({
                role: turn.role,
                parts: [{text: turn.text}]
            }))
        ];


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents
        });

        let reply = "";
        if (response.text != null) {
            reply = response.text
        }
        else {
            reply = "";
        }

        session.conversation.push({
            role: "model",
            text: reply
        });

        //send our reply to the frontend
        res.json({ reply });
    
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Request to chatbot failed" });
    }
});

//save each conversation to a textfile
server.post("/api/save-chat", (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        const folder = ensureSaving();
        const chatBot = session.chatBot;

        const files = fs.readdirSync(folder).filter(file => file.startsWith(`chatbot_${chatBot}_`));
        
        const sessionNumber = files.length + 1;

        const formattedConversation = session.conversation.map(turn => `${turn.role}:\n${turn.text}\n`).join("\n");

        const fileContent = `Chatbot: ${chatBot} 
                             Session ID: ${sessionId}
                             
                             ${formattedConversation}`;

        const filename = `chat_${chatBot}_${sessionNumber}.txt`
        const filePath = path.join(folder, filename);

        fs.writeFileSync(filePath, fileContent, "utf8");

        //Clear memory after its been saved as a file
        sessions.delete(sessionId);

        res.json({ ok: true, filename });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "saving failed" });
    }
});

//Start the server listening
server.listen(3000, () => {
    console.log("Server on at http://localhost:3000")
})