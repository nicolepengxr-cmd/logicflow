import { GoogleGenAI } from "@google/genai";

// Centralized Gemini AI configuration
// The API key is hardcoded here to ensure compatibility when deployed to environments like Vercel
// where browser-side environment variables might not be correctly injected.
// WARNING: Hardcoding API keys in the frontend is insecure and should only be used for demos or prototypes.
const GEMINI_API_KEY = "AIzaSyBNpGgQFc1PsSUkvb50Qjo-yqOqwJR_Fkg"; 

export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
