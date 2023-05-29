const vscode = acquireVsCodeApi();

/**
 * Add load event.
 */
window.addEventListener("load", main);

// Declare Html elements.
const startChatButton = document.getElementById("start-chat-gpt-button");
const imageButton = document.getElementById("image-generate-button");
const apiKeySaveButton = document.getElementById("api-key-save-button-id") as any;
const apiKeyTextField = document.getElementById("api-key-text-field-id") as any;
const temperatureTextField = document.getElementById("temperature-text-field-id") as any;
const imageNumberTextField = document.getElementById("image-number-text-field-id") as any;
const imageSizeTextField = document.getElementById("image-size-text-field-id") as any;

/**
 * Main function
 */
function main() {

    // Add eventLsteners of Html elements.
    startChatButton?.addEventListener("click", handleStartButtonClick);
    imageButton?.addEventListener("click", handleImageButtonClick);
    apiKeySaveButton?.addEventListener("click", handleSaveClick);

    // Handle messages sent from the extension or panel to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'settings-exist':
                // Append api key.
                const apiKey = message.data.apiKey;
                const temperature = message.data.temperature;
                const responseNumber = message.data.responseNumber;
                const imageSize = message.data.imageSize;
                apiKeyTextField.value = apiKey;
                temperatureTextField.value = temperature;
                imageNumberTextField.value = responseNumber;
                imageSizeTextField.value = imageSize;
                break;
            case 'error':
                console.log(message);
                break;
        }
    });
}

/**
 * Handle start button click event.
 */
function handleStartButtonClick() {
    // Send messages to Panel.
    vscode.postMessage({
        command: "start-chat-command",
        text: 'start-chat',
    });
}

/**
 * Handle image button click event.
 */
function handleImageButtonClick() {
    // Send messages to Panel.
    vscode.postMessage({
        command: "image-buton-clicked-command",
        text: 'image-button',
    });
}

/**
 * Handle save  click event. 
 */
function handleSaveClick() {
    const data = {
        apiKey: apiKeyTextField?.value,
        temperature: temperatureTextField?.value,
        responseNumber: imageNumberTextField?.value,
        imageSize: imageSizeTextField?.value
    }
    vscode.postMessage({
        command: "save-settings",
        data: data,
    });
}