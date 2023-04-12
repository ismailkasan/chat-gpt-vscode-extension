
import * as vscode from 'vscode';
import { ChatGptPanel } from './panels/chat-gpt-panel';
import { SideBarViewProvider } from './panels/side-bar-view-panel';

export async function activate(context: vscode.ExtensionContext) {

	const startCommand = vscode.commands.registerCommand("vscode-chat-gpt.start", () => {
		ChatGptPanel.render(context);
	});
	context.subscriptions.push(startCommand);

	// bu bir viewdir
	const provider = new SideBarViewProvider(context.extensionUri, context);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(SideBarViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-chat-gpt.addQuestion', () => {
			provider.addQuestion(context);
		}));

}

export function deactivate() { }


