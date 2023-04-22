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
 * Create a vscode.Uri as WebviewUri for source files.
 * @param webview :vscode.Weview
 * @param extensionUri :vscode.Uri
 * @param pathList :string[]
 * @returns vscode.Uri
 */
export function getAsWebviewUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

/**
 * Create a vscode.Uri for source files.
 * @param extensionUri :vscode.Uri
 * @param pathList :strig[]
 * @returns vscode.Uri
 */
export function getVSCodeUri(extensionUri: Uri, pathList: string[]) {
  return vscode.Uri.joinPath(extensionUri, ...pathList);
}

/**
 * Set storeData into context.globalState.
 * @param context :vscode.ExtensionContext
 * @param storeData : any
 */
export function setStoreData(context: vscode.ExtensionContext, storeData: any) {
  const state = stateManager(context);

  if (storeData !== undefined) {
    state.write({
      storeData: storeData
    });
  }
}

/**
 * Gets storeData from context.globalState.
 * @param context :vscode.ExtensionContext
 * @returns string
 */
export function getStoreData(context: vscode.ExtensionContext): any {
  const state = stateManager(context);

  const { storeData } = state.read();
  return storeData as any;
}



/**
* State Manager has read and write methods for api key. This methods set and get the api key from context.globalState.
* @param context :vscode.ExtensionContext.
* @returns void.
*/
export function stateManager(context: vscode.ExtensionContext) {
  return {
    read,
    write,
  };

  function read() {
    return {
      storeData: context.globalState.get('storeData')
    };
  }

  function write(newState: any) {
    context.globalState.update('storeData', newState.storeData);
  }
}