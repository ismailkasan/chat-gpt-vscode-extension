
import { GenerateContentConfig, GoogleGenAI, Modality } from "@google/genai";
import { Prompt, Settings } from '../interfaces/common-interfaces';

export async function askGemini(prompt: Prompt, settings: Settings) {
    try {
        const config = {} as GenerateContentConfig;
        config.temperature = settings.temperature;
        config.responseModalities = [Modality.TEXT, Modality.IMAGE];

        const ai = new GoogleGenAI({ apiKey: settings.apiKey });
        const response = await ai.models.generateContent({
            model: prompt.settings.model,
            contents: prompt.prompt,
            config: config
        });
        return response;
    } catch (error: any) {
        throw error;
    }
}
