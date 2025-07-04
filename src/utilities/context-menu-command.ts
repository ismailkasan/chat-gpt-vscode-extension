
import * as vscode from 'vscode';
import { promptToTextDavinci003 } from './chat-gpt-api.service';
import { window, ProgressLocation } from 'vscode';
import { getNewGuid } from './utility.service';

export function registerCommand(apiKey: string) {

    /*Refactor */
    vscode.commands.registerCommand("vscode-chat-gpt.refactor", () => {
        refactorCode(apiKey)
    });

    /*Add Comment */
    vscode.commands.registerCommand("vscode-chat-gpt.addComments", () => {
        addComment(apiKey);
    });

    /*Add Documentaion */
    vscode.commands.registerCommand("vscode-chat-gpt.addDocumentation", () => {
        addDocument(apiKey);
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
function refactorCode(apiKey: string) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }
    var selection = textEditor.selection;
    var selectedText = textEditor.document.getText(selection);
    let prompt = `Refactor the following ${textEditor.document.languageId} code ` + selectedText;

    promptToTextDavinci003(prompt, apiKey).then(result => {
        // vscode.commands.executeCommand("cursorMove", { "to": "viewPortTop" });
        textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result));
    });
}

/**
 * Add comments code via ChatGpt
 * @param apiKey :string
 * @returns 
 */
function addComment(apiKey: string) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }
    var selection = textEditor.selection;
    var selectedText = textEditor.document.getText(selection);
    switch (textEditor.document.languageId) {
        case 'html':
            {
                let prompt = "Add comments for the following HTML code and format with 80 colums." + selectedText;
                prompt = prompt.replace(/"/g, "'");

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result + "\n" + selectedText));
                });
                break;
            }
        case 'css':
            {
                let prompt = "Add comments for the following CSS code and format with 80 colums." + selectedText;
                prompt = prompt.replace(/"/g, "'");

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result + "\n" + selectedText));
                });
                break;
            }
        default:
            const prompt = "Add comments for the following code and format with 80 colums." + selectedText;

            promptToTextDavinci003(prompt, apiKey).then(result => {
                textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, result + "\n" + selectedText));
            })
            break;
    }

}

/**
 * Add documents via ChatGpt
 * @param apiKey :string
 * @returns 
 */
function addDocument(apiKey: string) {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
        return; // No open text editor
    }
    var selection = textEditor.selection;
    var selectedText = textEditor.document.getText(selection);

    switch (textEditor.document.languageId) {

        case 'javascript':
            {
                const prompt = "Generate documentation comment following JSDoc specification with input parameters and return value type and add comment closing tag for the following code. " + selectedText;

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    const parts = result.split('*/') as string[];
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, parts[0] + "*/ \n" + selectedText));
                });
                break;
            }
        case 'java':
            {
                const prompt = "Generate documentation comment following Javadoc specification with input parameters and return value type and add comment closing tag for the following code. " + selectedText;

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    const parts = result.split('*/') as string[];
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, parts[0] + "*/ \n" + selectedText));
                });
                break;
            }
        case 'typescript':
            {
                const prompt = "Generate documentation comment following TSDoc specification with input parameters and return value type and add comment closing tag for the following code. " + selectedText;

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    const parts = result.split('*/') as string[];
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, parts[0] + "*/ \n" + selectedText));
                });
                break;
            }
        case 'csharp':
            {
                const prompt = "Generate documentation following Annex D Documentation comments specification with input parameters and return value type and add summary closing tag for the following c# code. " + selectedText;

                promptToTextDavinci003(prompt, apiKey).then(result => {
                    const parts = result.split('</returns>') as string[];
                    textEditor.edit(editBuilder => editBuilder.replace(textEditor.selection, parts[0] + "</returns> \n" + selectedText));
                });
                break;
            }

        default:
            break;
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
