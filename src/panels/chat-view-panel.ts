import * as vscode from "vscode";
import { getNonce, getAsWebviewUri, getVSCodeUri } from "../utilities/utility.service";
import { getSettingsData, addHistory, getHistoryData, clearHistory, getSelectedPlatform } from "../utilities/history.service";
import { askOpenAi } from "../utilities/chat-gpt-api.service";
import { InitChatViewData, Prompt, PromptResponse } from "../interfaces/common-interfaces";
import { askGemini } from "../utilities/gemini-api.service";
import * as path from 'path';
import { marked } from 'marked';

/**
 * Webview panel class
 */
export class ChatViewPanel {
    public static currentPanel: ChatViewPanel | undefined;
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

        //const logoPath = getAsWebviewUri(this._panel.webview, extensionUri, ['out/assets/media', 'code-companion-logo.svg']);
        // const imagePath= this._panel.webview.asWebviewUri(vscode.Uri.file(extensionUri,'out/assets/media/code-companion-logo.svg'));
        const imagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'out/assets/media/code-companion-logo.svg')
        );
        const logoPath = this._panel.webview.asWebviewUri(imagePath).toString();

        // init webview
        this.initWebview(logoPath);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._setWebviewMessageListener(this._panel.webview);
    }

    /**
     * Render method of webview that is triggered from "extension.ts" file.
     * @param context :vscode.ExtensionContext.
    */
    public static render(context: vscode.ExtensionContext) {
        // if exist show 
        if (ChatViewPanel.currentPanel) {
            ChatViewPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {

            // if not exist create a new one.
            const extensionUri: vscode.Uri = context.extensionUri;
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "Chat", vscode.ViewColumn.One, {
                // Enable javascript in the webview.
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            const darklogoPath = getVSCodeUri(extensionUri, ['out/assets/media', 'dark-logo.svg']);
            const lightlogoPath = getVSCodeUri(extensionUri, ['out/assets/media', 'white-logo.svg']);
            const icon = {
                "light": lightlogoPath,
                "dark": darklogoPath
            };
            panel.iconPath = icon;

            ChatViewPanel.currentPanel = new ChatViewPanel(context, panel, extensionUri);
        }
    }

    /**
     * Dispose panel.
     */
    public dispose() {
        ChatViewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Add listeners to catch messages from chat-view js.
     * @param webview :vscode.Webview.
     */
    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;

                switch (command) {
                    case "prompt-created-command":
                        this.Post(message.data);
                        return;
                    case "history-cleared-command":
                        clearHistory(this._context);
                        break;
                }
            },
            undefined,
            this._disposables
        );
    }

    private initWebview(logoPath: string) {
        const historyData = getHistoryData(this._context);
        const settingsData = getSettingsData(this._context);
        const selectedPlatform = getSelectedPlatform(this._context);


        const initViewData = {
            history: historyData,
            settings: settingsData,
            selectedPlatform: selectedPlatform,
            logoPath: logoPath
        } as InitChatViewData;
 console.log(initViewData);
        this._panel.webview.postMessage({
            command: 'init-view-command',
            data: initViewData
        });
    }

    public sendHistoryToWebview() {
        const historyData = getHistoryData(this._context);
       
        this._panel.webview.postMessage({
            command: 'history-data-sended-to-webview-command',
            data: historyData
        });
    }

    public sendRespondedPromptToWebview(promptResponse: PromptResponse) {
        this._panel.webview.postMessage({
            command: 'prompt-responded-command',
            data: promptResponse
        });
    }

    /**
     * Ask to ChatGpt a prompt ans send 'answer' command with data to mainview.js.
     * @param prompt :string
     */
    private Post(prompt: Prompt) {
        const settings = getSettingsData(this._context);
        const existSettings = settings.find(a => a.platform == prompt.settings.platform);
        const existApiKey = existSettings?.apiKey;
        const existTemperature = existSettings?.temperature;
        if (existApiKey == undefined || existApiKey == null || existApiKey == '') {
            vscode.window.showInformationMessage('Please add your ChatGpt api key!');
        } else if (existTemperature == undefined || existTemperature == null || existTemperature == 0) {
            vscode.window.showInformationMessage('Please add temperature!');
        }
        else {
            switch (existSettings?.platform) {
                case 'openai':
                    try {
                        askOpenAi(prompt, existApiKey)
                            .then(answer => {
                                this.handleResponse(prompt, answer);
                            });
                    } catch (error: any) {
                        this.handleResponse(prompt, error.message);
                    }
                    break;
                case 'gemini':
                    try {
                        console.log('gemini');
                        askGemini(prompt, existApiKey).then(response => {
                          
                            this.handleResponse(prompt, response?.text);
                        });
                    } catch (error: any) {
                        this.handleResponse(prompt, error.message);
                    }
                    break;

                default:
                    break;
            }
        }
    }
    private async convertMarkdownToHtml(markdown: string): Promise<string> {
        return await marked.parse(markdown);
    }

    private handleResponse(prompt: Prompt, answer: string | undefined) {
        if (answer) {
            this.convertMarkdownToHtml(answer).then(htmlContent => {
                  console.log('handleResponse-htmlContent', htmlContent)

                const promptResponse =
                    {
                        ...prompt,
                        "answer": htmlContent

                    } as PromptResponse;

                const history = addHistory(promptResponse, this._context,);

                // Send to web view
                this.sendHistoryToWebview();
                this.sendRespondedPromptToWebview(promptResponse);
            });
        }
    }



    private changeTimeFormat(dateStr: Date): string {

        const date = new Date(dateStr);
        let hours = date.getHours();
        let minutes = date.getMinutes().toString();

        // Check whether AM or PM
        let newformat = hours >= 12 ? 'PM' : 'AM';

        // Find current hour in AM-PM Format
        hours = hours % 12;

        // To display "0" as "12"
        hours = hours ? hours : 12;
        minutes = minutes < '10' ? '0' + minutes : minutes;

        return hours + ':' + minutes + ' ' + newformat;
    }


    /**
   * Gets Html content of webview panel.
   * @param webview :vscode.Webview.
   * @param extensionUri :vscode.Uri.
   * @returns string;
   */
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {

        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const webviewUri = getAsWebviewUri(webview, extensionUri, ["out", "chat-view.js"]);
        const bootstrapScriptUri = getAsWebviewUri(webview, extensionUri, ["out/assets/js", "bootstrap.bundle.min.js"]);

        // nonce
        const nonce = getNonce();

        // stylesheets
        const styleVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'styles.css']);
        const allCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'all.css']);
        const bootstrapCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'bootstrap.min.css']);

        // Logo
        const logoPath = getAsWebviewUri(webview, extensionUri, ['out/assets/media', 'code-companion-logo.svg']);

        const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src ${webview.cspSource} 'self' 'unsafe-inline'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
    <link href="${bootstrapCssVSCodeUri}" rel="stylesheet">
    <link href="${allCssVSCodeUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link rel="icon" type="image/jpeg" href="${logoPath}">
</head>

<body>

<div id="app-container">
  <div id="sidebar">
  
 
                        <h5 class="text-light fw-semibold mb-3 mt-10">Code Companion</h5>
                        <ul class="nav flex-column">
                            <li class="nav-item">
                                <a href="#" id="new-chat-button" class="nav-link text-light px-2 py-1 rounded hover-bg active green">
                                    <i class="fas fa-plus me-2"></i> New Chat
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" id="clear-history-button" class="nav-link text-light px-2 py-1 rounded hover-bg">
                                    <i class="fas fa-trash-alt me-2"></i> Clear History
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="nav-link text-light px-2 py-1 rounded hover-bg">
                                    <i class="fas fa-archive me-2"></i> Library
                                </a>
                            </li>
                        </ul>
                        <div class="mt-4 small text-muted">Chats</div>
                        <ul class="nav flex-column mt-1" id="history-id">
                        </ul>
                    </div>
                    <hr class="d-block d-lg-none mt-1 mb-0">

  

  <div id="main">
    <div id="chat-container">
    
     <div class="text-center text-light fw-semibold fs-6 mt-10">
                    <h5 class="h5" id="platform-model-title"></h5>
                </div>

               
                    <div class="chat-messages p-4" id="chat-messages" data-history-id="0">                        
                        <div id="chat-answer-messages"></div>
                    </div>
            
	  
    </div>

    <div id="prompt-input">

     <div class="row ">                    
                        <div class="col-12 col-lg-12 col-xl-12">
                            <div class="flex-grow-0 py-3 px-4">
                             
                                <div class="input-group">
                                    <textarea class="form-control" id="prompt-text-area" cols="2"
                                        placeholder="Type your prompt!"></textarea>
                                    <button id="send-button" type="button" class="btn btn-success  btn-sm ml-5"> <i
                                            class="fas fa-paper-plane"></i> Send</button>
                                </div>
                                
                            </div>
                        </div>                       
                    </div>
                </div>

    </div>
  </div>
</div>

    <script nonce="${nonce}" src="${bootstrapScriptUri}"></script>
    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
</body>
</html>`;

        return html;
    }
}

