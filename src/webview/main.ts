import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeDivider, vsCodeProgressRing, vsCodeTextField, Button, ProgressRing, TextArea, TextField } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeDivider(), vsCodeProgressRing(), vsCodeTextField());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);



// Html element
const questionTextArea = document.getElementById("question-text-id") as TextArea;
const apiKeyTextField = document.getElementById("api-key-text-field-id") as TextField;
const answer = document.getElementById("answers-id") as HTMLElement;
const askButton = document.getElementById("ask-button-id") as Button;
const clearButton = document.getElementById("clear-button-id") as Button;
const apiKeySaveButton = document.getElementById("api-key-save-button-id") as Button;
const apiKeyClearButton = document.getElementById("api-key-clear-button-id") as Button;

// Handle messages sent from the extension to the webview
window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {

        case 'answer':
            hideProgressRing();
            // append answer
            const data = document.createTextNode(message.data);
            answer?.appendChild(data);
            break;
        case 'api-key-exist':
            // append api key
            const apiKey = message.data;
            apiKeyTextField.value = apiKey;
            apiKeyTextField.disabled = true;
            apiKeySaveButton.disabled = true;
            break;
    }
});

// add the eventLsteners at the main
function main() {

    // hide progress ring at the main
    hideProgressRing();

    askButton?.addEventListener("click", handleAskClick);
    clearButton?.addEventListener("click", handleClearClick);
    apiKeySaveButton?.addEventListener("click", handleSaveApiKeyClick);
    apiKeyClearButton?.addEventListener("click", handleClearApiKeyClick);
}

function handleAskClick() {
    vscode.postMessage({
        command: "press-ask-button",
        text: questionTextArea.value,
    });

    // answer text value clear
    answer.innerHTML = '';

    showProgressRing();
}

function handleClearClick() {
    answer.innerHTML = '';
    questionTextArea.value = '';
    hideProgressRing();
}

function handleSaveApiKeyClick() {
    vscode.postMessage({
        command: "press-save-api-key-button",
        text: apiKeyTextField.value,
    });

    apiKeyTextField.disabled = true;
    apiKeySaveButton.disabled = true;
}

function handleClearApiKeyClick() {
    apiKeyTextField.value = '';
    apiKeyTextField.disabled = false;
    apiKeySaveButton.disabled = false;
}


function showProgressRing() {
    // add progress ring
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    // const progressRingHtml = `<vscode-progress-ring id="progress-ring-id"></vscode-progress-ring>`;
    progressRing.style.display = 'inline-block';
}

function hideProgressRing() {
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'none';
}