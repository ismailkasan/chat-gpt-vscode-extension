
import * as vscode from 'vscode';
import { promptToTextDavinci003 } from './openai-api.service';
import { window, ProgressLocation } from 'vscode';
import { getNewGuid } from './utility.service';
import { editorCommentPrompts, editorRefactorPrompts } from '../constants/constants';
import { askGemini } from './gemini-api.service';
import { Prompt, Settings } from '../interfaces/common-interfaces';

export function registerCommand(platform: string, settings: Settings) {

    /*Refactor */
    vscode.commands.registerCommand("vscode-chat-gpt.refactor", () => {
        refactorCode(platform, settings)
    });

    /*Add Comment */
    vscode.commands.registerCommand("vscode-chat-gpt.addDocumentation", () => {
        addDocumentation(platform, settings);
    });

    /*Insert Guid */
    vscode.commands.registerCommand("vscode-chat-gpt.insertGuid", () => {
        insertGuid();
    });
}

/**
 * Refactor code via ChatGpt
 * @param apiKey :string
 * @returns 
 */
function refactorCode(platform: string, settings: Settings) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }
    var selection = textEditor.selection;
    var selectedText = textEditor.document.getText(selection).replace(/"/g, "'");

    const language = textEditor.document.languageId;
    const promptPrefix = editorRefactorPrompts.find(a => a.language === language).promptPrefix;
    const prompt = promptPrefix + selectedText;

    askAiPlatforms(platform, prompt, settings, textEditor);
}

/**
 * Add comments code via ChatGpt
 * @param apiKey :string
 * @returns 
 */
function addDocumentation(platform: string, settings: Settings) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }
    var selection = textEditor.selection;
    var selectedText = textEditor.document.getText(selection).replace(/"/g, "'");

    const language = textEditor.document.languageId;
    const promptPrefix = editorCommentPrompts.find(a => a.language === language).promptPrefix;
    const prompt = promptPrefix + selectedText;

    askAiPlatforms(platform, prompt, settings, textEditor);
}

function askAiPlatforms(platform: string, prompt: string, settings: Settings, textEditor: vscode.TextEditor) {
    if (platform === 'openai') {
        promptToTextDavinci003(prompt, settings.apiKey)
            .then(result => {
                textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result));
            });
    } else if (platform === 'gemini') {

        const model = {
            prompt: prompt,
            settings: settings
        } as Prompt;

        askGemini(model, settings)
            .then(result => {
                textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result.text));
            }).catch(err=>{
                    var selectedText = textEditor.document.getText(textEditor.selection).replace(/"/g, "'");
                const errorContent = `/* ${err.message} */ \n ${selectedText}`;
                textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, errorContent));
            });

    } else {
        return;
    }
}

/**
 * Insert Guid
 * @returns 
 */
function insertGuid() {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }

    const newGuid = getNewGuid();
    textEditor.edit(editBuilder => {
        editBuilder.insert(textEditor.selection.active, newGuid);
    });
}

function showProgressRunning() {
    let customCancellationToken: vscode.CancellationTokenSource | null = null;

    window.withProgress({
        location: ProgressLocation.Notification,
        title: "I am long running!",
        cancellable: true
    }, (progress, token) => {

        customCancellationToken = new vscode.CancellationTokenSource();
        customCancellationToken.token.onCancellationRequested(() => {
            customCancellationToken?.dispose();
            customCancellationToken = null;

            vscode.window.showInformationMessage("Cancelled the progress");
            return;
        });


        token.onCancellationRequested(() => {
            customCancellationToken?.cancel()
            console.log("User canceled the long running operation");
        });

        progress.report({ increment: 0 });

        setTimeout(() => {
            progress.report({ increment: 10, message: "Running..." });
        }, 1000);

        setTimeout(() => {
            progress.report({ increment: 40, message: "Running..." });
        }, 2000);

        setTimeout(() => {
            progress.report({ increment: 50, message: "Running..." });
        }, 3000);

        const p = new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });

        return p;
    });
}
