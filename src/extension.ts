
import * as vscode from 'vscode';
import { ChatViewPanel } from './panels/chat-view-panel';
import { GeneralSettingsViewProvider } from './panels/general-settings-view-panel';
import { getSettingsData } from './utilities/history.service';
import { registerCommand } from './utilities/context-menu-command';
import { ImagePanel } from './panels/image-view-panel';
import { ModelsViewProvider } from './panels/models-view-panel ';
import { KeyboardShortcutsViewProvider } from './panels/keyboard-shortcuts-view-panel';

export async function activate(context: vscode.ExtensionContext) {

	// Chat panel register
	const chatPanelCommand = vscode.commands.registerCommand("vscode-chat-gpt.start", () => {	
		ChatViewPanel.render(context);
	});
	context.subscriptions.push(chatPanelCommand);

	// Image panel register
	const imagePanelCommand = vscode.commands.registerCommand("vscode-chat-gpt.start-image", () => {	
		ImagePanel.render(context);
	});
	context.subscriptions.push(imagePanelCommand);

	// General Settings View Provider register
	const provider = new GeneralSettingsViewProvider(context.extensionUri, context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(GeneralSettingsViewProvider.viewType, provider));

	// Keyboard shortcuts View Provider register
	const keyboardShortcutsProvider = new KeyboardShortcutsViewProvider(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(KeyboardShortcutsViewProvider.viewType, keyboardShortcutsProvider));

	// Models View Provider register
	const modelsProvider = new ModelsViewProvider(context.extensionUri, context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ModelsViewProvider.viewType, modelsProvider));

	const settingsData = getSettingsData(context);
	registerCommand(settingsData.apiKey);

}

export function deactivate() { }
