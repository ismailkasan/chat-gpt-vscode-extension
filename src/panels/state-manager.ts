import * as vscode from "vscode";

/**
 * Set last question into context.globalState for reading from another webview.
 * @param lastQuestion is a string parameter.
 * @returns void.
 */
export function setLastQuestion(context: vscode.ExtensionContext, lastQuestion: string | undefined) {
    const state = stateManager(context);

    if (lastQuestion !== undefined) {
        state.writeLastQuestion({
            lastQuestion: lastQuestion
        });
    }
}


export function getlastQuestion(context: vscode.ExtensionContext): string {
    const state = stateManager(context);

    const { lastQuestionApplied } = state.readLastQuestion();;
    console.log('getlastQuestion');
    console.log(lastQuestionApplied);
    return lastQuestionApplied as string;
}

/**
 * Set api key into context.globalState
 * @param apikeyValue is a string parameter of ChatGpt api key.
 * @returns void.
 */
export function setApiKey(context: vscode.ExtensionContext, apikeyValue: string | undefined) {
    const state = stateManager(context);

    if (apikeyValue !== undefined) {
        state.write({
            apiKey: apikeyValue
        });
    }
}

/**
 * Get api key from context.globalState.
 * @returns string api key.
 */
export function getApiKey(context: vscode.ExtensionContext): string {
    const state = stateManager(context);

    const { apiKeyApplied } = state.read();
    return apiKeyApplied as string;
}

export function setHistoryQuestion(context: vscode.ExtensionContext, historyQuestion: string | undefined) {
    const state = stateManager(context);

    if (historyQuestion !== undefined) {
        state.writeHistoryQuestion({
            historyQuestion: historyQuestion
        });
    }
}

export function getHistoryQuestion(context: vscode.ExtensionContext): string {
    const state = stateManager(context);

    const { historyQuestionApplied } = state.readHistoryQuestion();;
    return historyQuestionApplied as string;
}

/**
 * State Manager has read and write methods for api key. This methods set and get the api key from context.globalState.
 * @param context is a parameter that is typeoff vscode.ExtensionContext.
 * @returns void.
 */
export function stateManager(context: vscode.ExtensionContext) {
    return {
        read,
        write,
        writeLastQuestion,
        readLastQuestion,
        writeHistoryQuestion,
        readHistoryQuestion,
    };

    function read() {
        return {
            apiKeyApplied: context.globalState.get('apiKey')
        };
    }
    
    function write(newState: any) {
        context.globalState.update('apiKey', newState.apiKey);
    }

    function readLastQuestion() {
        return {
            lastQuestionApplied: context.globalState.get('lastQuestion')
        };
    }

    function writeLastQuestion(newState: any) {
        context.globalState.update('lastQuestion', newState.lastQuestion);
    }

    function readHistoryQuestion() {
        return {
            historyQuestionApplied: context.globalState.get('historyQuestion')
        };
    }

    function writeHistoryQuestion(newState: any) {
        context.globalState.update('historyQuestion', newState.historyQuestion);
    }
}