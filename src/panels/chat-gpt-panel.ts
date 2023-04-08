import * as vscode from "vscode";
import { getUri } from "../utilities/get-uri";
import { getNonce } from "../utilities/get-nonce";
import { askToChatGptV3 } from "../utilities/chat-gpt.service";


export class ChatGptPanel {
    public static currentPanel: ChatGptPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }


    public static render(extensionUri: vscode.Uri) {
        if (ChatGptPanel.currentPanel) {
            ChatGptPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "ChatGpt", vscode.ViewColumn.One, {
                // Enable javascript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            ChatGptPanel.currentPanel = new ChatGptPanel(panel, extensionUri);
        }
    }


    public dispose() {
        ChatGptPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "press-ask-button":
                        vscode.window.showInformationMessage(text);

                        askToChatGptV3(message.text).subscribe(answer => {
							this._panel.webview.postMessage({ command: 'answer', data: answer });
						});                      
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
        const nonce = getNonce();
        const stylesMainPath = getUri(webview, extensionUri, ['out', 'style.css']);

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
              <link href="${stylesMainPath}" rel="stylesheet">
              <title>ChatGpt Assistant</title>             
            </head>
            <body>
              <h1>Ask to ChatGpt!</h1>
              <vscode-divider role="separator"></vscode-divider>
              
              <h3 id="question-id">Question: </h3>
              <p id="answers-id">Answer: </p>            

              <vscode-divider role="separator"></vscode-divider>
              
              <vscode-text-area class="text-area" id="question-text-id" cols="100" autofocus>Question</vscode-text-area>
              
              <div class="flex-container">
              <vscode-button id="ask-button-id">Ask</vscode-button>
              <vscode-progress-ring id="progress-ring-id" ></vscode-progress-ring>
              </div>
              <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
          </html>
        `;

    }
}