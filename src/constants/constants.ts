// AI platformları ve modelleri
export const aiPlatforms: Record<string, { label: string; baseUrl: string; models: { label: string; value: string; apiUrl: string }[]; }> = {
    openai: {
        label: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        models: [
            { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo", apiUrl: "/chat/completions" },
            { label: "GPT-4", value: "gpt-4", apiUrl: "/chat/completions" },
            { label: "GPT-4o", value: "gpt-4o", apiUrl: "/chat/completions" },
            { label: "GPT-4.5", value: "gpt-4.5", apiUrl: "/chat/completions" },
            { label: "text-davinci-003", value: "text-davinci-003", apiUrl: "/completions" },
            { label: "dall-e-3", value: "dall-e-3", apiUrl: "/images/generations" }
        ]
    },
    gemini: {
        label: "Gemini",
        baseUrl: "https://api.openai.com/v1",
        models: [
            { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro", apiUrl: "gemini-1.5-pro:generateContent" },
            { label: "Gemini 2.0 Flash-Preview-Image-Generation", value: "gemini-2.0-flash-preview-image-generation", apiUrl: "gemini-2.0-flash-preview-image-generation:generateContent" },
            { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro", apiUrl: "gemini-2.5-pro:generateContent" },
            { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash", apiUrl: "gemini-2.5-flash:generateContent" },
            { label: "Gemini 2.5 Flash-Lite", value: "gemini-2.5-flash-lite", apiUrl: "gemini-2.5-flash-lite:generateContent" },
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

export const editorCommentPrompts = [
    { language: 'default', promptPrefix: "Add comments for the following code and format with 80 colums. Get only comments and code in response! Code: " },
    { language: 'html', promptPrefix: "Add comments for the following HTML code and format with 80 colums. Get only comments and code in response! Html Code: " },
    { language: 'css', promptPrefix: "Add comments for the following CSS code and format with 80 colums. Get only comments and code in response! CSS Code: " },
    { language: 'javascript', promptPrefix: "Generate comments with JSDoc specification by input parameters and return value types for the following JavaScript code. Get only comments and code in response! Javascript Code:  " },
    { language: 'typescript', promptPrefix: "Generate comments with TSDoc specification by input parameters and return value types for the following TypeScript code. Get only comments and code in response! TypeScript Code:  " },
    { language: 'csharp', promptPrefix: "Generate comments with Annex D Documentation comments specification by input parameters and return value types for the following CSharp code. Get only comments and code in response! CSharp Code: " },
    { language: 'java', promptPrefix: "Generate comments with Javadoc specification by input parameters and return value types for the following Java code. Get only comments and code in response! Java Code: " }
] as const;

export const editorRefactorPrompts=[
      { language: 'default', promptPrefix: "Refactor the following code. Don't loose the business logic of the code! Code: " },
    { language: 'html', promptPrefix: "Refactor the following HTML code. Don't loose the business logic of the code! Html Code: " },
    { language: 'css', promptPrefix: "Refactor the following CSS code. Don't loose the business logic of the code! CSS Code:  " },
    { language: 'javascript', promptPrefix: "Refactor the following JavaScript code. Don't loose the business logic of the code! JavaScript Code: " },
    { language: 'typescript', promptPrefix: "Refactor the following TypeScript code. Don't loose the business logic of the code! TypeScript Code: " },
    { language: 'csharp', promptPrefix: "Refactor the following CSharp code. Don't loose the business logic of the code! CSharp Code: " },
    { language: 'java', promptPrefix: "Refactor the following Java code. Don't loose the business logic of the code! Java Code: " }
]


export const HTML_OBJECT_IDS = {
    promptTextArea: 'prompt-text-area',
    sendButton: 'send-button',
    newChatButton: 'new-chat-button',
    clearHistoryButton: 'clear-history-button',
    startButton: 'start-button',
    saveButton: 'save-button',
    apiKeyTextField: 'api-key-text-field',
    temperatureTextField: 'temperature-text-field',
    imageNumberTextField: 'image-number-text-field',
    imageSizeTextField: 'image-size-text-field',
    platformSelectField: 'platform-select-field',
    modelSelectField: 'model-select-field',

} as const;

export const MESSAGE_COMMANDS = {
    promptResponded: 'prompt-responded-command',
    historyDataSendedToWebview: 'history-data-sended-to-webview-command',
    initView: 'init-view-command',
    historyCleared: 'history-cleared-command',
    promptCreated: 'prompt-created-command',
    downloadImage: 'download-image-command',
    existSettings: 'exist-settings-command',
    startChat: 'start-chat-command',
    saveSettings: 'save-settings-command',
} as const;

export const HTTP_METHODS = {
    post: 'POST',
    get: 'GET',
    put: 'PUT',
    delete: 'DELETE'
} as const;