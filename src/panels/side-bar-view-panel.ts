import * as vscode from 'vscode';
import { addQuestionEventEmitter, FireClickHistoryQuestionEvent, getNonce, getAsWebviewUri } from '../utilities/utility.service';

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
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);

		// Register message events that comes from the js.
		this.addReceiveMessageEvents(webviewView.webview);

		// Register message events that comes from the other panels.
		this.addReceiveMessageEventsFromOtherPanel();

	}

	/**
	 * Add listener for event comes from js.
	 * @param webview :vscode.Webview
	 */
	private addReceiveMessageEvents(webview: vscode.Webview) {
		webview.onDidReceiveMessage((message: any) => {
			const command = message.command;
			switch (command) {
				case "start-chat-command":
					this.startChatGptWebViewPanel();
					break;
				case "history-question-command":
					this.clickHistoryQuestion(message.data);
					break;
			}
		},
			undefined
		);
	}

	/**
	 * Add listener for event comes from other panels.
	 */
	private addReceiveMessageEventsFromOtherPanel() {
		addQuestionEventEmitter.on('addQuestion', (question: string) => {
			this.sendAddQuestionCommand(question);
		});
	}

	/**
	 * Send "add-new-question-command" and data to side-bar-view.js
	 * @param question :string
	 */
	public sendAddQuestionCommand(question: string) {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ command: 'add-new-question-command', data: question });
		}
	}

	/**
	 * start main panel. 
	 */
	private startChatGptWebViewPanel(): void {
		vscode.commands.executeCommand('vscode-chat-gpt.start');
	}

	/**
	 * start main panel and send history question data.
	 * @param historyQuestion :string
	 */
	private clickHistoryQuestion(historyQuestion: string): void {
		vscode.commands.executeCommand('vscode-chat-gpt.start');
		setTimeout(() => {
			// fire event in the communication service
			FireClickHistoryQuestionEvent(historyQuestion);
		}, 1000);
	}

	/**
	 * Gets html content of webview.
	 * @param webview: vscode.Webview
	 * @param extensionUri: vscode.Uri
	 * @returns string
	 */
	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = getAsWebviewUri(webview, extensionUri, ["out", "side-bar-view.js"]);

		// Do the same for the stylesheet.
		const styleVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/media', 'vscode.css']);

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
				<title>Panel</title>
			</head>
			<body>

			<div class="flex-container">
			<button id="start-chat-gpt-button">New Chat</button>
			<button id="clear-history-button" class="danger" >Clear History</button>
			</div>
			<p class="chat-history">Chat History</p>
			<ul id="history-id">
			</ul>
			
			<script nonce="${nonce}" src="${scriptUri}"></script>
			<div class="model">
				<p> Editor model:<a href="https://platform.openai.com/docs/models/gpt-3-5"> ${'text-davinci-003'}</a></p>
				<p> Chat model:<a href="https://github.com/kydycode/chatgpt-3.5-turbo"> ${'gpt-3.5-turbo'}</a></p>
			<div>
			</body>
			</html>`;
	}
}