import * as vscode from "vscode";
import { getUri } from "../utilities/get-uri";
import { getNonce } from "../utilities/get-nonce";
import { askToChatGptAsStream } from "../utilities/chat-gpt.service";
import { getApiKey, getHistoryQuestion, setApiKey, setLastQuestion } from "./state-manager";

/**
 * Webview panel class
 */
export class ChatGptPanel {
    public static currentPanel: ChatGptPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _context: vscode.ExtensionContext;

    /**
     * 
     * @param context is a parameter that is typeoff vscode.ExtensionContext.
     * @param panel is a parameter thatis typeoff vscode.WebviewPanel.
     * @param extensionUri is a string parameter of vscode.Uri.
     */
    private constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._context = context;
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);

        // Read the api key from globalState and send it to webview
        const existApiKey = getApiKey(context);
        this._panel.webview.postMessage({ command: 'api-key-exist', data: existApiKey });

        /// register click history event command
        context.subscriptions.push(
            vscode.commands.registerCommand('vscode-chat-gpt.clickedHistoryQuestion', () => {
                this.clickedHistoryQuestion(context);
            }));
    }

    /**
     * Render method of webview that is triggered from "extension.ts" file.
     * @param context context is a parameter that is typeoff vscode.ExtensionContext.
     */
    public static render(context: vscode.ExtensionContext) {

        // if exist show 
        if (ChatGptPanel.currentPanel) {
            ChatGptPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else { // if not exist create a new one.

            const extensionUri: vscode.Uri = context.extensionUri;
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "ChatGpt", vscode.ViewColumn.One, {
                // Enable javascript in the webview.
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            ChatGptPanel.currentPanel = new ChatGptPanel(context, panel, extensionUri);
        }
    }

    /**
     * Dispose panel.
     */
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

    /**
     * Add listeners to catch messages from webview js.
     * @param webview is a parameter that is typeoff vscode.Webview.
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;

                switch (command) {
                    case "press-ask-button":
                        this.askToChatGpt(message.data);
                        return;
                    case "press-save-api-key-button":
                        setApiKey(this._context, message.data);
                        const responseMessage = `${message.data} : api key saved successfully.`;
                        vscode.window.showInformationMessage(responseMessage);
                        return;

                    case "press-clear-api-key-button":
                        setApiKey(this._context, '');
                        const claerResponseMessage = 'api key cleared successfully';
                        vscode.window.showInformationMessage(claerResponseMessage);
                        return;

                }
            },
            undefined,
            this._disposables
        );
    }

    /**
     * 
     * @param webview is a parameter that is typeoff vscode.Webview.
     * @param extensionUri is a string parameter of vscode.Uri.
     * @returns 
     */
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {

        // get uris from out directory based on vscode.extensionUri
        const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
        const nonce = getNonce();
        const styleVSCodeUri  = getUri(webview,extensionUri, ['out/media', 'vscode.css']);
        const logoMainPath = getUri(webview, extensionUri, ['out/media', 'chat-gpt-logo.jpeg']);

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <link href="${styleVSCodeUri}" rel="stylesheet">
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
              <span class="answer-header"> Answer : </span>
            </div>
            <pre><code class="code" id="answers-id"></code></pre>
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

    private addQuestion(lastQuestion: string): void {
        setLastQuestion(this._context, lastQuestion);
        vscode.commands.executeCommand('vscode-chat-gpt.addQuestion');
    }

    public clickedHistoryQuestion(context: vscode.ExtensionContext) {
        const historyQuestion = getHistoryQuestion(context);       
        this.askToChatGpt(historyQuestion);

        this._panel.webview.postMessage({ command: 'history-question-sended', data: historyQuestion });
    }

    private askToChatGpt(question: string) {
        const existApiKey = getApiKey(this._context);
        if (existApiKey == undefined || existApiKey == null || existApiKey == '') {
            vscode.window.showInformationMessage('Please add your ChatGpt api key!');          
        } {
            askToChatGptAsStream(question, existApiKey).subscribe(answer => {
                this._panel.webview.postMessage({ command: 'answer', data: answer });
            });

              // add question command form side bar view
              this.addQuestion(question);          
        }
    }
}