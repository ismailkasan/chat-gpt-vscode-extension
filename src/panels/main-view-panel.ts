import * as vscode from "vscode";
import { EmitAddQuestionEvent, clickHistoryQuestionEventEmitter, getApiKey, getNonce, getUri, setApiKey } from "../utilities/utility.service";
import { askToChatGptAsStream } from "../utilities/chat-gpt-api.service";

/**
 * Webview panel class
 */
export class ChatGptPanel {
    public static currentPanel: ChatGptPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _context: vscode.ExtensionContext;

    /**
     * Constructor
     * @param context :vscode.ExtensionContext.
     * @param panel :vscode.WebviewPanel.
     * @param extensionUri :vscode.Uri.
     */
    private constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._context = context;
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
        this.addReceiveMessageEventsFromOtherPanels();

        // Read the api key from globalState and send it to webview
        const existApiKey = getApiKey(context);
        this._panel.webview.postMessage({ command: 'api-key-exist', data: existApiKey });
    }

    /**
     * Render method of webview that is triggered from "extension.ts" file.
     * @param context :vscode.ExtensionContext.
     */
    public static render(context: vscode.ExtensionContext) {

        // if exist show 
        if (ChatGptPanel.currentPanel) {
            ChatGptPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {

            // if not exist create a new one.
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
     * Add listeners to catch messages from mainview js.
     * @param webview :vscode.Webview.
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;

                switch (command) {
                    case "press-ask-button":
                        this.askToChatGpt(message.data);

                        // add question command form side bar view
                        EmitAddQuestionEvent(message.data);
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
     * Add message event listener from other panels.
     */
    private addReceiveMessageEventsFromOtherPanels() {
        clickHistoryQuestionEventEmitter.on('clickHistoryQuestion', (hisrtoryQuestion: string) => {
            this.clickHistoryQuestion(hisrtoryQuestion);
        });
    }

    /**
     * Gets Html content of webview panel.
     * @param webview :vscode.Webview.
     * @param extensionUri :vscode.Uri.
     * @returns string;
     */
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {

        // get uris from out directory based on vscode.extensionUri
        const webviewUri = getUri(webview, extensionUri, ["out", "mainview.js"]);
        const nonce = getNonce();
        const styleVSCodeUri = getUri(webview, extensionUri, ['out/media', 'vscode.css']);
        const logoMainPath = getUri(webview, extensionUri, ['out/media', 'chat-gpt-logo.jpeg']);

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

    /**
     * Ask history question to ChatGpt and send 'history-question-sended' command with data to mainview.js.
     * @param hisrtoryQuestion :string
     */
    public clickHistoryQuestion(hisrtoryQuestion: string) {
        this.askToChatGpt(hisrtoryQuestion);
        ChatGptPanel.currentPanel?._panel.webview.postMessage({ command: 'history-question-sended', data: hisrtoryQuestion });
    }

    /**
     * Ask to ChatGpt a question ans send 'answer' command with data to mainview.js.
     * @param question :string
     */
    private askToChatGpt(question: string) {
        const existApiKey = getApiKey(this._context);
        if (existApiKey == undefined || existApiKey == null || existApiKey == '') {
            vscode.window.showInformationMessage('Please add your ChatGpt api key!');
        } {
            askToChatGptAsStream(question, existApiKey).subscribe(answer => {
                ChatGptPanel.currentPanel?._panel.webview.postMessage({ command: 'answer', data: answer });
            });
        }
    }
}