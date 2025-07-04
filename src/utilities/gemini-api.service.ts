
import { GoogleGenAI } from "@google/genai";
import { Prompt } from '../interfaces/common-interfaces';


export async function askGemini(prompt: Prompt, apiKey: string) {
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: prompt.settings.model,
            contents: prompt.prompt,
        });
        return response;
    } catch (error: any) {
        throw error
    }
}
