import * as vscode from "vscode";
import { getUri } from "../utilities/get-uri";
import { getNonce } from "../utilities/get-nonce";
import { askToChatGptV3 } from "../utilities/chat-gpt.service";


export class ChatGptPanel {
    public static currentPanel: ChatGptPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._context = context;
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);

        // only read
        const existApiKey = this.apiKey(undefined);
        this._panel.webview.postMessage({ command: 'api-key-exist', data: existApiKey });
    }


    public static render(context: vscode.ExtensionContext) {

        if (ChatGptPanel.currentPanel) {
            ChatGptPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {

            const extensionUri: vscode.Uri = context.extensionUri;
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "ChatGpt", vscode.ViewColumn.One, {
                // Enable javascript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            ChatGptPanel.currentPanel = new ChatGptPanel(context, panel, extensionUri);
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

                switch (command) {
                    case "press-ask-button":
                        const existApiKey = this.apiKey(undefined);
                        askToChatGptV3(message.text, existApiKey).subscribe(answer => {
                            this._panel.webview.postMessage({ command: 'answer', data: answer });
                        });
                        return;
                    case "press-save-api-key-button":
                        const key = this.apiKey(message.text);
                        if (key != undefined) {
                            const responseMessage = `${key} : api key saved successfully.`;
                            vscode.window.showInformationMessage(responseMessage);
                        }
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
        const logoMainPath = getUri(webview, extensionUri, ['out', 'chat-gpt-logo-2-HBRQ6ZBV.jpeg']);

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <link href="${stylesMainPath}" rel="stylesheet">
            <link rel="icon" type="image/jpeg" href="${logoMainPath}">
            <title>ChatGpt Assistant</title>
          </head>
          <body>
            <h1>Ask to ChatGpt!</h1>
            <vscode-text-field id="api-key-text-field-id" size="150">Api Key:</vscode-text-field>
            <div class="flex-container">
                <vscode-button id="api-key-save-button-id">Save</vscode-button>
                <vscode-button class="danger" id="api-key-clear-button-id">Clear</vscode-button>
            </div>
            <vscode-divider role="separator"></vscode-divider>
            <div class="flex-container-logo">
              <span>
                <img class="logo-image" src="${logoMainPath}">
              </span>
              <span> Answer : </span>
            </div>
            <pre>
            <code class="code" id="answers-id"></code>
            </pre>
            <vscode-text-area class="text-area" id="question-text-id" cols="100" autofocus>Question</vscode-text-area>
            <div class="flex-container">
              <vscode-button id="ask-button-id">Ask</vscode-button>
              <vscode-button class="danger" id="clear-button-id">Clear</vscode-button>
              <vscode-progress-ring id="progress-ring-id"></vscode-progress-ring>
            </div>
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
          </body>
        </html>
        `;

    }

    private apiKey(apikeyValue: string | undefined): string {
        const state = this.stateManager(this._context);

        if (apikeyValue != undefined) {
            state.write({
                apiKey: apikeyValue
            });
        }

        const { apiKeyApplied } = state.read();
        return apiKeyApplied as string;
    }

    private stateManager(context: vscode.ExtensionContext) {
        return {
            read,
            write
        }

        function read() {
            return {
                apiKeyApplied: context.globalState.get('apiKey')
            }
        }

        function write(newState: any) {
            context.globalState.update('apiKey', newState.apiKey)
        }
    }
}