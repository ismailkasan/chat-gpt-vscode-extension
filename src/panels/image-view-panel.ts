import * as vscode from "vscode";
import { getNonce, getAsWebviewUri, getVSCodeUri } from "../utilities/utility.service";
import { getSettingsData } from "../utilities/history.service";
import { imageGenerationeFromChatGpt } from "../utilities/chat-gpt-api.service";

/**
 * Image panel class
 */
export class ImagePanel {
    public static currentPanel: ImagePanel | undefined;
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
    }

    /**
     * Render method of webview that is triggered from "extension.ts" file.
     * @param context :vscode.ExtensionContext.
    */
    public static render(context: vscode.ExtensionContext) {

        // if exist show 
        if (ImagePanel.currentPanel) {
            ImagePanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {

            // if not exist create a new one.
            const extensionUri: vscode.Uri = context.extensionUri;
            const panel = vscode.window.createWebviewPanel("vscode-chat-gpt", "Generate Image", vscode.ViewColumn.One, {
                // Enable javascript in the webview.
                enableScripts: true,
                // Restrict the webview to only load resources from the `out` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
            });

            const logoMainPath = getVSCodeUri(extensionUri, ['out/assets/media', 'dark-logo.svg']);
            const icon = {
                "light": logoMainPath,
                "dark": logoMainPath
            };
            panel.iconPath = icon;

            ImagePanel.currentPanel = new ImagePanel(context, panel, extensionUri);
        }
    }

    /**
     * Dispose panel.
     */
    public dispose() {
        ImagePanel.currentPanel = undefined;

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
                    case "press-image-ask-button":
                        this.askToChatGpt(message.data);
                        return;
                    case "image-clicked":
                        vscode.env.openExternal(vscode.Uri.parse(message.data));
                        return;
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
        const webviewUri = getAsWebviewUri(webview, extensionUri, ["out", "imageview.js"]);
        const nonce = getNonce();
        const styleVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'styles.css']);
        const logoMainPath = getAsWebviewUri(webview, extensionUri, ['out/assets/media', 'dark-logo.svg']);

        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none';  style-src ${webview.cspSource} 'self' 'unsafe-inline'; font-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link rel="icon" type="image/jpeg" href="${logoMainPath}">
          </head>
          <body>
                  
            <p class="answer-header mt-30"> Gallery </p>
            <p class="info-message" id="image-error-id"></p>           
            <div id="gallery-container">            
            </div>            
            <vscode-text-area class="text-area mt-20" id="prompt-text-id" cols="100">Prompt:</vscode-text-area>
            <div class="flex-container">
              <vscode-button id="ask-image-button-id">Generate Image</vscode-button>
              <vscode-button class="danger" id="clear-image-button-id">Clear</vscode-button>
              <vscode-progress-ring id="progress-ring-id"></vscode-progress-ring>
            </div>
            <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
          </body>
        </html>
        `;
    }

    /**
     * Ask to ChatGpt a question ans send 'answer' command with data to mainview.js.
     * @param question :string
     */
    private askToChatGpt(question: string) {
        const settingsData = getSettingsData(this._context);
        const existApiKey = settingsData.apiKey;
        const existImageSize = settingsData.imageSize;
        const existResponseNumber = settingsData.responseNumber;
        if (existApiKey == undefined || existApiKey == null || existApiKey == '') {
            vscode.window.showInformationMessage('Please add your Open Ai api key!');
        } else if (existImageSize == undefined || existImageSize == null || existImageSize == 0) {
            vscode.window.showInformationMessage('Please add image size!');
        } else if (existResponseNumber == undefined || existResponseNumber == null || existResponseNumber == 0) {
            vscode.window.showInformationMessage('Please add response number!');
        }
        else {
            imageGenerationeFromChatGpt(question, existApiKey, existResponseNumber).then(data => {

                if (data.includes('Error')) {
                    ImagePanel.currentPanel?._panel.webview.postMessage({ command: 'image-error-answer', data: data });
                } else {
                    ImagePanel.currentPanel?._panel.webview.postMessage({ command: 'image-urls-answer', data: data });
                }
            });
        }
    }
}