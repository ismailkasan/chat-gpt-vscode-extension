import * as vscode from "vscode";

export interface HistoryItem {
    prompt: string;
    answer: string;
    date: Date;
    id: string;
    urls: string[];
}

export interface History {
    id: string;
    chats: HistoryItem[];
    date: Date;
    title: string;
    platform: string;
    model: string;
}

export interface Prompt {
    prompt: string;
    historyId: string;
    chatId: string;
    settings: Settings;
     date: Date;
}

export interface PromptResponse extends Prompt {
    answer: string;
    date: Date;
    base64Images: Images[];
    cdnImages: string[];
}
export interface Images{
    cdnUrl:string;
    base64:string;
    mimeType:string;
}
export interface Settings {
    apiKey: string;
    temperature: number;
    responseNumber: number;
    imageSize: string;
    model: string;
    platform: string;
}

export interface InitGeneralSettingsViewData {
    settings: Settings[];
    selectedPlatform: string;
}

export interface InitChatViewData extends InitGeneralSettingsViewData {
    history: History[];
    logoPath: string;
}
