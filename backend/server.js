import { GoogleGenAI } from "@google/genai";
import express from "express";
import dotenv from "dotenv";

//grab our needed codes from .env
dotenv.config();

//create our server
const server = express();
server.use(express.json());

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY,});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: "",
  });
  console.log(response.text);
}