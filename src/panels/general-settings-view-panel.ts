import * as vscode from 'vscode';
import { getNonce, getAsWebviewUri } from '../utilities/utility.service';
import { getSettingsData, addSettings, getSelectedPlatform } from '../utilities/history.service';
import { InitGeneralSettingsViewData } from '../interfaces/common-interfaces';
import { HTML_OBJECT_IDS, MESSAGE_COMMANDS } from '../constants/constants';

export class GeneralSettingsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'general-settings';
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _context: vscode.ExtensionContext,
	) {

	}

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

		// Read the api key from globalState and send it to webview
		const settingsData = getSettingsData(this._context);
		const selectedPlatform = getSelectedPlatform(this._context);

		const initData: InitGeneralSettingsViewData = {
			settings: settingsData,
			selectedPlatform: selectedPlatform,
		};

		this._view.webview.postMessage(
			{
				command: MESSAGE_COMMANDS.existSettings,
				data: initData
			});
	}

	/**
	 * Add listener for event comes from js.
	 * @param webview :vscode.Webview
	 */
	private addReceiveMessageEvents(webview: vscode.Webview) {
		webview.onDidReceiveMessage((message: any) => {
			const command = message.command;
			switch (command) {
				case MESSAGE_COMMANDS.startChat:
					this.startChatGptWebViewPanel();
					break;
				case MESSAGE_COMMANDS.saveSettings:
					const responseMessage = `Settings saved successfully.`;
					addSettings(this._context, message.data);
					vscode.window.showInformationMessage(responseMessage);
					break;
			}
		},
			undefined
		);
	}

	/**
	 * start chat panel. 
	 */
	private startChatGptWebViewPanel(): void {
		vscode.commands.executeCommand('vscode-chat-gpt.start');
	}

	/**
	 * Gets html content of webview.
	 * @param webview: vscode.Webview
	 * @param extensionUri: vscode.Uri
	 * @returns string
	 */
	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = getAsWebviewUri(webview, extensionUri, ["out", "general-settings-view.js"]);
		const bootstrapScriptUri = getAsWebviewUri(webview, extensionUri, ["out/assets/js", "bootstrap.bundle.min.js"]);

		// Stylesheets.
		const stylesCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'styles.css']);
		const allCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'all.css']);
		const bootstrapCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'bootstrap.min.css']);

		// Logo
		const logoPath = getAsWebviewUri(webview, extensionUri, ['out/assets/media', 'code-companion-logo.svg']);


		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
				<html lang="en">

				<head>
					<meta charset="UTF-8">
					<meta http-equiv="Content-Security-Policy"
						content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; font-src ${webview.cspSource};  script-src 'nonce-${nonce}';">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${bootstrapCssVSCodeUri}" rel="stylesheet">
					<link href="${stylesCssVSCodeUri}" rel="stylesheet">
					<link href="${allCssVSCodeUri}" rel="stylesheet">
					<title>Panel</title>
				</head>

				<body>
				
					<div class="code-companion-card">
						<img src="${logoPath}" alt="Code Companion Logo" class="logo" />
						<h2>Code Companion</h2>
						<h3>Welcome!</h3>
						<p>Code Companion allows you to interact with AI platforms through their APIs to streamline your development tasks. It also integrates with the VSCode API, enabling access to commands via the editor's context menu and keyboard shortcuts.</p>
						<p>To get started, enter your preferred AI platform API key.</p>
						<p class="note">Don’t worry! Your API key is securely stored within your workspace environment.</p>

						
						<div class="row">
					  		<div class="col">
								<label class="note"><i class="fas fa-key"></i> Platform:</label>
								<select class="form-select" id="${HTML_OBJECT_IDS.platformSelectField}" aria-label="Default select example">
								</select>
							</div>
						</div>
						<div class="row">
					  		<div class="col">
								<label class="note"><i class="fas fa-key"></i> Model:</label>
								<select class="form-select" id="${HTML_OBJECT_IDS.modelSelectField}" aria-label="Default select example">
								</select>
							</div>
						</div>
						<div class="row">
					  		<div class="col">
								<label class="note"><i class="fas fa-key"></i> Api Key:</label>
								<input id="${HTML_OBJECT_IDS.apiKeyTextField}" placeholder="OpenAi api key." />
							</div>
						</div>
						<div class="row">
							<div class="col">
									<label class="note"><i class="fas fa-temperature-low"></i> Temperature:
										<a href="#" data-bs-toggle="tooltip" data-bs-placement="top" title="What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random,
										while lower values like 0.2 will make it more focused and deterministic."> <i class="fas fa-info-circle"></i>
										</a> </label>
									<input id="${HTML_OBJECT_IDS.temperatureTextField}" placeholder="0.8" />
							</div>
						</div>
						<div class="row">
							<div class="col">
									<label class="note"><i class="fas fa-list-ol"></i> Response Number: <a href="#" data-bs-toggle="tooltip"
											data-bs-placement="top"
											title="Smaller sizes are faster to generate. You can request 1-5 images at a time using the n parameter.">
											<i class="fas fa-info-circle"></i> </a></label>
									<input id="${HTML_OBJECT_IDS.imageNumberTextField}" placeholder="Number of generated images." />
							</div>
						</div>
						<div class="row">
							<div class="col">
									<label class="note"><i class="fas fa-crop-alt"></i> Size: <a href="#" data-bs-toggle="tooltip"
											data-bs-placement="top"
											title="Generated images can have a size of 256x256, 512x512, or 1024x1024 pixels."> <i
												class="fas fa-info-circle"></i> </a></label>
									<input id="${HTML_OBJECT_IDS.imageSizeTextField}" placeholder="Size of images like '1024x1024'" />
							</div>
						</div>
						<div class="row">
								<div class="flex-container-center">
									<button id="${HTML_OBJECT_IDS.startButton}" type="button" class="btn btn-secondary btn-sm"><i
											class="far fa-comment-alt"></i>
										Chat</button>
									<button id="${HTML_OBJECT_IDS.saveButton}" type="button" class="btn btn-success btn-sm"> <i
											class="fas fa-save"></i> Save</button>
								</div>
						</div>						
					</div>
					<script nonce="${nonce}" src="${scriptUri}"></script>
					<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>
				</body>
				</html>`;
	}
}