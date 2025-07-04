import * as vscode from 'vscode';
import {  getAsWebviewUri, getNonce } from '../utilities/utility.service';

export class ModelsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'models';

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
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'out')]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._extensionUri);
	}



	
	/**
	 * Gets html content of webview.
	 * @param webview: vscode.Webview
	 * @param extensionUri: vscode.Uri
	 * @returns string
	 */
	private _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const bootstrapScriptUri = getAsWebviewUri(webview, extensionUri, ["out/assets/js", "bootstrap.bundle.min.js"]);

		// Stylesheets.
		const stylesCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'styles.css']);
		const allCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'all.css']);
		const bootstrapCssVSCodeUri = getAsWebviewUri(webview, extensionUri, ['out/assets/css', 'bootstrap.min.css']);

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
					<link href="${bootstrapCssVSCodeUri}" rel="stylesheet">			
					<link href="${stylesCssVSCodeUri}" rel="stylesheet">			
					<link href="${allCssVSCodeUri}" rel="stylesheet">			
					<title>Panel</title>
				</head>
				<body>
					<h5>OpenAi Models</h5>
					</br>
					<p>Code Companion use OpenAi models for specific tasks. Code Companion supports models below </p>
					<p></p>
					</br>
					<h4 class="mt-10">Chat  <a href="https://platform.openai.com/docs/models/gpt-3-5"> <span class="badge bg-success fr">${'gpt-3.5-turbo'}</span></a></h4>
					<h4 class="mt-10">Editor <a href="https://platform.openai.com/docs/models/gpt-3-5"> <span class="badge bg-secondary fr">${'text-davinci-003'}</span></a></h4>
					<h4 class="mt-10">Image  <a href="https://platform.openai.com/docs/models/dall-e"> <span class="badge bg-success fr">${'DALL·E'}</span></a></h5>
						
					<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>
				</body>
			</html>`;
	}
}