import { Uri, Webview } from "vscode";
import * as vscode from "vscode";
import EventEmitter = require('events');

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

export function getWhiteLogoUri(webview: Webview, extensionUri: Uri) {
  const whiteLogoPath = getAsWebviewUri(webview, extensionUri, ['out/assets/media', 'white-logo.svg']);
  return whiteLogoPath;
}

export function getDarkLogoUri(webview: Webview, extensionUri: Uri) {
  const darkLogoPath = getAsWebviewUri(webview, extensionUri, ['out/assets/media', 'dark-logo.svg']);
  return darkLogoPath;
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

export function getNewGuid(): string {
  // Generate a random UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
