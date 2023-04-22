
import * as vscode from 'vscode';
import { ChatGptPanel } from './panels/main-view-panel';
import { SideBarViewProvider } from './panels/side-bar-view-panel';
import { getStoreData } from './utilities/utility.service';
import { registerCommand } from './utilities/context-menu-command';

export async function activate(context: vscode.ExtensionContext) {

	const startCommand = vscode.commands.registerCommand("vscode-chat-gpt.start", () => {
		ChatGptPanel.render(context);
	});
	context.subscriptions.push(startCommand);

	// bu bir viewdir
	const provider = new SideBarViewProvider(context.extensionUri, context);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(SideBarViewProvider.viewType, provider));

	const storeData = getStoreData(context);
	registerCommand(storeData.apiKey);

}

export function deactivate() { }
