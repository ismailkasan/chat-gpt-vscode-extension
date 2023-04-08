
import * as vscode from 'vscode';
import { ChatGptPanel } from './panels/chat-gpt-panel';

export function activate(context: vscode.ExtensionContext) {


	const startCommand = vscode.commands.registerCommand("vscode-chat-gpt.start", () => {
		ChatGptPanel.render(context.extensionUri);
	});

	context.subscriptions.push(startCommand);
}

export function deactivate() { }