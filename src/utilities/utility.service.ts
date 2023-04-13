import { Uri, Webview } from "vscode";
import * as vscode from "vscode";
import EventEmitter = require('events');

/**
 * Add new question event emitter.
 */
const addQuestionEventEmitter = new EventEmitter();
export { addQuestionEventEmitter }


/**
 * Fire addQuestion event.
 * @param question :string.
*/
export function EmitAddQuestionEvent(question: string) {
  addQuestionEventEmitter.emit('addQuestion', question);
}

/**
 * Click history question event emitter.
 */
const clickHistoryQuestionEventEmitter = new EventEmitter();
export { clickHistoryQuestionEventEmitter }

/**
 * Fire history question event.
 * @param historyQuestion :string 
*/
export function FireClickHistoryQuestionEvent(historyQuestion: string) {
  clickHistoryQuestionEventEmitter.emit('clickHistoryQuestion', historyQuestion);
}

/**
 * Gets nonce
 * @returns string
 */
export function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Create a vscode.Uri for source files.
 * @param webview :vscode.Weview
 * @param extensionUri :vscode.Uri
 * @param pathList :string[]
 * @returns vscode.Uri
 */
export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

/**
 * Set api key into context.globalState.
 * @param context :vscode.ExtensionContext
 * @param apikeyValue : string | undefined
 */
export function setApiKey(context: vscode.ExtensionContext, apikeyValue: string | undefined) {
  const state = stateManager(context);

  if (apikeyValue !== undefined) {
    state.write({
      apiKey: apikeyValue
    });
  }
}

/**
 * Gets api key from context.globalState.
 * @param context :vscode.ExtensionContext
 * @returns string
 */
export function getApiKey(context: vscode.ExtensionContext): string {
  const state = stateManager(context);

  const { apiKeyApplied } = state.read();
  return apiKeyApplied as string;
}


/**
* State Manager has read and write methods for api key. This methods set and get the api key from context.globalState.
* @param context :vscode.ExtensionContext.
* @returns void.
*/
export function stateManager(context: vscode.ExtensionContext) {
  return {
    read,
    write
  };

  function read() {
    return {
      apiKeyApplied: context.globalState.get('apiKey')
    };
  }

  function write(newState: any) {
    context.globalState.update('apiKey', newState.apiKey);
  }
}