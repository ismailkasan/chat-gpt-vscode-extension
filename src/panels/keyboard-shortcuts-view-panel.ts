import * as vscode from 'vscode';
import { getAsWebviewUri, getNonce } from '../utilities/utility.service';

export class KeyboardShortcutsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'keyboard-shortcuts';

	constructor(private readonly _extensionUri: vscode.Uri) {
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
					<meta http-equiv="Content-Security-Policy"
						content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${bootstrapCssVSCodeUri}" rel="stylesheet">
					<link href="${stylesCssVSCodeUri}" rel="stylesheet">
					<link href="${allCssVSCodeUri}" rel="stylesheet">
					<title>Panel</title>
				</head>

				<body>

					<h5>CC Keyboard Shortcuts</h5>
					<ul>
						<li> Use this shortcut to open Chat Panel: </br> <code>ctrl+ alt + s, shift + cmd + s</code> </li></br>
						<li> Use this shortcut to open Image Panel: </br> <code>ctrl+ alt + i, shift + cmd + i</code> </li></br>
						<li> Use this shortcut to add comment. Support all languages.  </br> <code>ctrl+ alt + c, shift + cmd + c</code></br> </li></br>
						<li> Use this shortcut to add documentations. Only supports javaScript, TypeScript, Java and C#. </br> <code>ctrl + alt + d, shift + cmd + d</code></br> </li></br>
						<li> Use this shortcut to refactor the code. Only support javaScript, TypeScript, Java and C#. </br> <code> ctrl + alt + r, shift + cmd + r</code></br> </li></br>
						<li> Use this shortcut to insert new guid. Support all languages. </br> <code>ctrl + alt + g, shift + cmd + g</code> </li>
					</ul>

					<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>
				</body>
				</html>`;
	}
}