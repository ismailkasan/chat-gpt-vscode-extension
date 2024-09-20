import * as vscode from "vscode";
import { getStoreData, getNonce, getAsWebviewUri, setHistoryData, getVSCodeUri, getHistoryData } from "../utilities/utility.service";
import { askToChatGptAsStream } from "../utilities/chat-gpt-api.service";

/**
 * Webview panel class
 */
export class ChatGptPanel {
    public static currentPanel: ChatGptPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _context: vscode.ExtensionContext;

    // declare an array for search history.
    private searchHistory: string[] = [];

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

        this.sendHistoryAgain();
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
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "Ask To Chat Gpt", vscode.ViewColumn.One, {
                // Enable javascript in the webview.
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            const logoMainPath = getVSCodeUri(extensionUri, ['out/media', 'chat-gpt-logo.jpeg']);
            const icon = {
                "light": logoMainPath,
                "dark": logoMainPath
            };
            panel.iconPath = icon;

            ChatGptPanel.currentPanel = new ChatGptPanel(context, panel, extensionUri);
        }

        const historyData = getHistoryData(context);
        ChatGptPanel.currentPanel._panel.webview.postMessage({ command: 'history-data', data: historyData });
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
                        this.addHistoryToStore(message.data);
                        return;
                    case "history-question-clicked":
                        this.clickHistoryQuestion(message.data);
                        break;
                    case "history-request":
                        this.sendHistoryAgain();
                        break;
                    case "clear-history":
                        this.clearHistory();
                        break;
                }
            },
            undefined,
            this._disposables
        );
    }

    /**
     * Gets Html content of webview panel.
     * @param webview :vscode.Webview.
     * @param extensionUri :vscode.Uri.
     * @returns string;
     */
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {

        // get uris from out directory based on vscode.extensionUri
        const webviewUri = getAsWebviewUri(webview, extensionUri, ["out", "mainview.js"]);
        const nonce = getNonce();
        const styleVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/media', 'vscode.css']);
        const logoMainPath = getAsWebviewUri(webview, extensionUri, ['out/media', 'chat-gpt-logo.jpeg']);

        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'self' 'unsafe-inline'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link rel="icon" type="image/jpeg" href="${logoMainPath}">
          </head>
          <body>          
            <p class="answer-header mt-30"> Answer : </p>            
            <pre><code class="code" id="answers-id"></code></pre>
            <vscode-text-area class="text-area mt-20" id="question-text-id" cols="100">Question:</vscode-text-area>
            <div class="flex-container">
              <vscode-button id="ask-button-id">Ask</vscode-button>
              <vscode-button class="danger" id="clear-button-id">Clear</vscode-button>
              <vscode-button class="danger" id="clear-history-button">Clear History</vscode-button>
              <vscode-progress-ring id="progress-ring-id"></vscode-progress-ring>
            </div>

            <p class="chat-history">Chat History</p>
			<ul id="history-id">
			</ul>
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
          </body>
        </html>
        `;
    }

    /**
     * Ask history question to ChatGpt and send 'history-question-clicked' command with data to mainview.js.
     * @param hisrtoryQuestion :string
     */
    public clickHistoryQuestion(hisrtoryQuestion: string) {
        this.askToChatGpt(hisrtoryQuestion);
    }

    public sendHistoryAgain() {
        const historyData = getHistoryData(this._context);
        this._panel.webview.postMessage({ command: 'history-data', data: historyData });
    }

    /**
     * Ask to ChatGpt a question ans send 'answer' command with data to mainview.js.
     * @param question :string
     */
    private askToChatGpt(question: string) {
        const storeData = getStoreData(this._context);
        const existApiKey = storeData.apiKey;
        const existTemperature = storeData.temperature;
        if (existApiKey == undefined || existApiKey == null || existApiKey == '') {
            vscode.window.showInformationMessage('Please add your ChatGpt api key!');
        } else if (existTemperature == undefined || existTemperature == null || existTemperature == 0) {
            vscode.window.showInformationMessage('Please add temperature!');
        }
        else {
            askToChatGptAsStream(question, existApiKey, existTemperature).subscribe(answer => {
                ChatGptPanel.currentPanel?._panel.webview.postMessage({ command: 'answer', data: answer });
            });
        }
    }

    clearHistory() {
        this.searchHistory = [];
        setHistoryData(this._context, this.searchHistory);
    }

    addHistoryToStore(question: string) {
        const storeHistory = this.getHistoryFromStore();
        if (storeHistory != undefined)
            this.searchHistory = storeHistory;

        this.searchHistory.push(question);
        setHistoryData(this._context, this.searchHistory);
    }

    getHistoryFromStore() {
        const history = getHistoryData(this._context);
        return history;
    }
}