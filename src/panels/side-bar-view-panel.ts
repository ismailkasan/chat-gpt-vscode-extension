import * as vscode from 'vscode';
import { getNonce } from '../utilities/get-nonce';
import { getUri } from '../utilities/get-uri';
import { getlastQuestion, setHistoryQuestion } from './state-manager';


export class SideBarViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'chat-gpt-view-id';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'out')]
			// localResourceRoots: [
			// 	this._extensionUri
			// ]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);

		// const conversationIconUri = getUri(webviewView.webview, this._extensionUri, ["out/media", "conversation-icon.svg"]);	
		// this._view.webview.postMessage({ command: 'conversation-icon-command', data: conversationIconUri });
		// console.log('icon send command');
		// console.log(conversationIconUri);

		webviewView.webview.onDidReceiveMessage((message: any) => {
			const command = message.command;
			switch (command) {
				case "start-chat-command":
					this.startChatGptWebViewPanel();
					break;
				case "history-question-command":
					this.clickedHistoryQuestion(message.data);
					break;
			}
		},
			undefined,

		);

	}

	public addQuestion(context: vscode.ExtensionContext) {
		const lastQuestion = getlastQuestion(context);
		console.log('add question');
		console.log(lastQuestion);

		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ command: 'add-new-question-command', data: lastQuestion });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private startChatGptWebViewPanel(): void {
		vscode.commands.executeCommand('vscode-chat-gpt.start');
	}
	private clickedHistoryQuestion(historyQuestion: string): void {
		setHistoryQuestion(this._context, historyQuestion);
		vscode.commands.executeCommand('vscode-chat-gpt.start');
		vscode.commands.executeCommand('vscode-chat-gpt.clickedHistoryQuestion');
	}

	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

		//	const model = chatGptModel!=undefined?chatGptModel:'gelmedi';

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = getUri(webview, extensionUri, ["out", "side-bar-view.js"]);
		// Do the same for the stylesheet.
		// const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out/media', 'vscode.css'));
		const styleVSCodeUri = getUri(webview,extensionUri, ['out/media', 'vscode.css']);

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVSCodeUri}" rel="stylesheet">
			
				<title>Cat Colors</title>
			</head>
			<body>

			<div class="flex-container">
			<button id="start-chat-gpt-button">New Chat</button>
			<button id="clear-conversations-button" class="danger" >Clear History</button>
			</div>
			<p class="chat-history">Chat History</p>
			<ul id="conversations-id"  class="color-list">
			</ul>
			
			<script nonce="${nonce}" src="${scriptUri}"></script>
			<p class="model"> model:<a href="https://github.com/kydycode/chatgpt-3.5-turbo"> ${'gpt-3.5-turbo'}</a></p>
			</body>
			</html>`;
	}

}