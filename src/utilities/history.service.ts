import * as vscode from "vscode";
import { HistoryItem, History, PromptResponse, Settings } from "../interfaces/common-interfaces";

//#region History

export function addHistory(response: PromptResponse, context: vscode.ExtensionContext): History {

  const historyData = getHistoryData(context);

  let history = historyData.find(a => a.id == response.historyId && a.platform == response.settings.platform);

  const historyTitle = response.answer.length > 100 ? response.answer.substring(0, 100) + '...' : response.answer;
  const shortAnswer = response.answer.length > 5000 ? response.answer.substring(0, 5000) + '...' : response.answer;

  response.answer = shortAnswer;

  //Add new history
  if (history == undefined) {

    // new history
    history = {
      id: response.historyId,
      platform: response.settings.platform,
      model: response.settings.model,
      title: historyTitle,
      chats: [{
        answer: shortAnswer,
        id: response.chatId,
        date: new Date(),
        prompt: response.prompt,
        urls: []
      } as HistoryItem],
      date: new Date(),
    } as History;

    historyData.unshift(history);

    if (historyData.length > 15)
      historyData.pop();

  } else {
    // history topic exist

    history.chats.unshift({
      answer: shortAnswer,
      id: response.chatId,
      date: new Date(),
      prompt: response.prompt,
      urls: []
    } as HistoryItem);

    if (history.chats.length > 5)
      history.chats.pop();

  }
  setHistoryData(context, historyData);

  return history;
}

export function clearHistory(context: vscode.ExtensionContext) {
  clearHistoryData(context);
}

export function setHistoryData(context: vscode.ExtensionContext, historyData: History[]) {
  const state = stateManager(context);
  if (historyData !== undefined) {
    state.writeHistory({
      historyData: historyData
    });
  }
}

export function getHistoryData(context: vscode.ExtensionContext): History[] {
  const state = stateManager(context);

  const { historyData } = state.readHistory();
  return historyData as History[];
}

export function clearHistoryData(context: vscode.ExtensionContext) {
  const state = stateManager(context);
  state.clearHistory();
}

//#endregion History

//#region Settings

export function addSettings(context: vscode.ExtensionContext, setting: Settings) {
  let settingsData = getSettingsData(context);
  let existSettings;

  if (Array.isArray(settingsData)) {
    existSettings = settingsData?.find(a => a.platform == setting.platform);
  } else if (typeof settingsData === "object" && settingsData !== null) {
    settingsData = [settingsData];
  }

  //Add new settings
  if (existSettings == undefined) {

    // new history
    const newSettings = {
      platform: setting.platform,
      model: setting.model,
      apiKey: setting.apiKey,
      temperature: setting.temperature,
      imageSize: setting.imageSize,
      responseNumber: setting.responseNumber
    } as Settings;

    settingsData.unshift(newSettings);

  } else {
    // settings exist

    existSettings.apiKey = setting.apiKey;
    existSettings.responseNumber = setting.responseNumber;
    existSettings.imageSize = setting.imageSize;
    existSettings.platform = setting.platform;
    existSettings.model = setting.model;
    existSettings.temperature = setting.temperature;

  }
  setSettingsData(context, settingsData);
  setSelectedPlatform(context, setting.platform);
}

/**
 * Set settingsData into context.globalState.
 * @param context :vscode.ExtensionContext
 * @param settingsData : any
*/
export function setSettingsData(context: vscode.ExtensionContext, settingsData: Settings[]) {
  const state = stateManager(context);

  if (settingsData !== undefined) {
    state.write({
      settingsData: settingsData
    });
  }
}

/**
 * Gets settingsData from context.globalState.
 * @param context :vscode.ExtensionContext
 * @returns string
*/
export function getSettingsData(context: vscode.ExtensionContext): Settings[] {
  const state = stateManager(context);

  const { settingsData } = state.read();
  return settingsData as Settings[];
}

//#endregion Settings

//#region Selected Platform


export function setSelectedPlatform(context: vscode.ExtensionContext, platform: string) {
  const state = stateManager(context);

  if (platform !== undefined) {
    state.writeSelectedPlatform(platform);
  }
}

export function getSelectedPlatform(context: vscode.ExtensionContext): string {
  const state = stateManager(context);
  const { platform } = state.readSelectedPlatform();
  return platform as string;
}

//#endregion Selected Platform

//#region StateManager
/**
* State Manager has read and write methods for api key. This methods set and get the api key from context.globalState.
* @param context :vscode.ExtensionContext.
* @returns void.
*/
export function stateManager(context: vscode.ExtensionContext) {
  return {
    read,
    write,
    writeHistory,
    readHistory,
    clearHistory,
    clearSettings,
    readSelectedPlatform,
    writeSelectedPlatform
  };

  function read() {
    return {
      settingsData: context.globalState.get('storeData')
    };
  }

  function readHistory() {
    return {
      historyData: context.globalState.get('historyData')
    };
  }

  function write(newState: any) {
    context.globalState.update('storeData', newState.settingsData);
  }

  function writeHistory(newState: any) {
    context.globalState.update('historyData', newState.historyData);
  }

  function clearHistory() {
    context.globalState.update('historyData', []);
  }
  function clearSettings() {
    context.globalState.update('storeData', []);
  }

  function writeSelectedPlatform(platform: string) {
    context.globalState.update('selectedPlatform', platform);
  }

  function readSelectedPlatform() {
    return {
      platform: context.globalState.get('selectedPlatform')
    };
  }

}

//#endregion StateManager