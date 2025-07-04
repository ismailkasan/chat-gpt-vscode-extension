// AI platformları ve modelleri
export const AiPlatforms: Record<string, { label: string; models: { label: string; value: string; }[] }> = {
    openai: {
        label: "OpenAI",
        models: [
            { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
            { label: "GPT-4", value: "gpt-4" },
            { label: "GPT-4o", value: "gpt-4o" },
            { label: "GPT-4.5", value: "gpt-4.5" },
            { label: "text-davinci-003", value: "text-davinci-003" },
            { label: "dall-e-3", value: "dall-e-3" }
        ]
    },
    gemini: {
        label: "Gemini",
        models: [
            { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
            { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
            { label: "Gemini 2.5 Flash-Lite", value: "gemini-2.5-flash" },
        ]
    },
    // claude: {
    //     label: "Claude",
    //     models: ["Claude 3 Haiku", "Claude 3 Sonnet", "Claude 3 Opus"]
    // },
    // mistral: {
    //     label: "Mistral",
    //     models: ["Mistral 7B", "Mixtral 8x7B"]
    // },
    // cohere: {
    //     label: "Cohere",
    //     models: ["Command R", "Command R+"]
    // },
    // groq: {
    //     label: "Groq",
    //     models: ["LLaMA 3 8B", "LLaMA 3 70B", "Mixtral"]
    // },
    // together: {
    //     label: "Together AI",
    //     models: ["Yi-34B", "Mistral 7B", "LLaMA 3"]
    // }
};

export const PlatformAdresses: Record<string, { label: string; baseUrl: string; models: { label: string; apiUrl: string }[] }> = {
    openai: {
        label: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        models: [
            { label: "GPT-3.5 Turbo", apiUrl: "/chat/completions" },
            { label: "GPT-4", apiUrl: "/chat/completions" },
            { label: "GPT-4o", apiUrl: "/chat/completions" },
            { label: "GPT-4.5", apiUrl: "/chat/completions" },
            { label: "text-davinci-003", apiUrl: "/completions" },
            { label: "dall-e-3", apiUrl: "/images/generations" }
        ]
    },
    gemini: {
        label: "Gemini",
        baseUrl: "https://api.openai.com/v1",
        models: [
            { label: "Gemini 2.5 Pro", apiUrl: "gemini-2.5-pro:generateContent" },
            { label: "Gemini 2.5 Flash", apiUrl: "gemini-2.5-flash:generateContent" },
            { label: "Gemini 2.5 Flash-Lite", apiUrl: "gemini-2.5-flash:generateContent" },
        ]
    },
}