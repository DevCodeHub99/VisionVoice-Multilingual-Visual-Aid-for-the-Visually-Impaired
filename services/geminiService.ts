
import { GoogleGenAI } from "@google/genai";
import { Task } from '../types';
import { PROMPT_TEMPLATES } from '../constants';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

export const generateDescription = async (
    base64Data: string, 
    mimeType: string, 
    task: Task, 
    languageName: string
): Promise<string> => {
    try {
        const fullPrompt = `${PROMPT_TEMPLATES[task]} Please provide the response in ${languageName}.`;

        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Data,
            },
        };

        const textPart = {
            text: fullPrompt
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}. Please check your API key and network connection.`;
        }
        return "An unknown error occurred while contacting the AI service.";
    }
};
