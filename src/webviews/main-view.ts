import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeTextArea,
    vsCodeDivider,
    vsCodeProgressRing,
    vsCodeTextField,
    Button,
    ProgressRing,
    TextArea,
    TextField
} from "@vscode/webview-ui-toolkit";

/**
 * Register "@vscode/webview-ui-toolkit" component to vscode design system.
 */
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeDivider(), vsCodeProgressRing(), vsCodeTextField());

const vscode = acquireVsCodeApi();

// Add load event listener.
window.addEventListener("load", main);

// Declare Html elements
const questionTextArea = document.getElementById("question-text-id") as TextArea;
const apiKeyTextField = document.getElementById("api-key-text-field-id") as TextField;
const answer = document.getElementById("answers-id") as HTMLElement;
const askButton = document.getElementById("ask-button-id") as Button;
const clearButton = document.getElementById("clear-button-id") as Button;
const apiKeySaveButton = document.getElementById("api-key-save-button-id") as Button;
const apiKeyClearButton = document.getElementById("api-key-clear-button-id") as Button;

/**
 * Main function
 */
function main() {

    // Hide progress ring at the start.
    hideProgressRing();

    // Add the eventLsteners.
    askButton?.addEventListener("click", handleAskClick);
    clearButton?.addEventListener("click", handleClearClick);
    apiKeySaveButton?.addEventListener("click", handleSaveApiKeyClick);
    apiKeyClearButton?.addEventListener("click", handleClearApiKeyClick);
    questionTextArea.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleAskClick();
        }
    });

    try {
        // Handle messages sent from the extension to the webview
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {

                case 'answer':
                    hideProgressRing();
                    // Append answer.
                    const data = document.createTextNode(message.data);
                    answer?.appendChild(data);
                    break;
                case 'api-key-exist':
                    // Append api key.
                    const apiKey = message.data;
                    apiKeyTextField.value = apiKey;

                    // Set disable api key text field. 
                    apiKeyTextField.disabled = true;

                    // Set disable api key save button. 
                    apiKeySaveButton.disabled = true;
                    break;
                case 'history-question-sended':
                    questionTextArea.value = message.data;
                    answer.innerHTML = '';

                    showProgressRing();
                    break;
                case 'error':
                    hideProgressRing();
                    break;
            }
        });
    } catch (err: any) {
        console.log('errrr js');
        console.log(err);
    }
}

/**
 * Handle ask button click event.
 */
function handleAskClick() {

    // Send messages to Panel.
    vscode.postMessage({
        command: "press-ask-button",
        data: questionTextArea.value,
    });

    // Clear answer filed.
    answer.innerHTML = '';

    // Show progressing ring.
    showProgressRing();
}

/**
 * Handle clear button click event.
 */
function handleClearClick() {
    // Clear answer field.
    answer.innerHTML = '';

    // Clear question field.
    questionTextArea.value = '';

    // Hide progressing ring.
    hideProgressRing();
}

/**
 * Handle save api key click event. 
 */
function handleSaveApiKeyClick() {
    vscode.postMessage({
        command: "press-save-api-key-button",
        data: apiKeyTextField.value,
    });

    // Set disable api key text field. 
    apiKeyTextField.disabled = true;

    // Set disable api key save button. 
    apiKeySaveButton.disabled = true;
}

/**
 * Handle clear api key click event.
 */
function handleClearApiKeyClick() {

    vscode.postMessage({
        command: "press-clear-api-key-button",
        data: apiKeyTextField.value,
    });

    // Clear api key text field.
    apiKeyTextField.value = '';

    // Set un disable api key text field. 
    apiKeyTextField.disabled = false;

    // Set un disable api key save button. 
    apiKeySaveButton.disabled = false;
}

/**
 * Show progessing ring.
 */
function showProgressRing() {
    // add progress ring.
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'inline-block';
}

/**
 * Hide progressing ring.
 */
function hideProgressRing() {
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'none';
}