import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeTextArea,
    vsCodeDivider,
    vsCodeProgressRing,
    vsCodeTextField,
    ProgressRing,
    Button,
    TextArea,
} from "@vscode/webview-ui-toolkit";

/**
 * Register "@vscode/webview-ui-toolkit" component to vscode design system.
 */
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeProgressRing(), vsCodeTextArea(), vsCodeDivider(), vsCodeProgressRing(), vsCodeTextField());

const vscode = acquireVsCodeApi();

// Add load event listener.
window.addEventListener("load", main);

// declare an array for search history.
let searchHistory: string[] = [];

vscode.postMessage({
    command: "history-request",
});

// Declare Html elements
const answer = document.getElementById("answers-id") as HTMLElement;
const chatQuestionTextArea = document.getElementById("question-text-id") as TextArea;
const askButton = document.getElementById("ask-button-id") as Button;
const clearButton = document.getElementById("clear-button-id") as Button;
const clearHistoryButton = document.getElementById("clear-history-button");

// image
const askImageButton = document.getElementById("ask-image-button-id") as Button;
const promptTextArea = document.getElementById("prompt-text-id") as TextArea;
const clearImageButton = document.getElementById("clear-image-button-id") as Button;

/**
 * Main function
 */
function main() {

    hideProgressRing();

    // Add the eventLsteners.
    askButton?.addEventListener("click", handleAskClick);
    clearButton?.addEventListener("click", handleClearClick);
    clearHistoryButton?.addEventListener("click", handleClearHistoryButtonClick);

    // image button events
    askImageButton?.addEventListener("click", handleImageAskClick);
    clearImageButton?.addEventListener("click", handleImageClearClick);

    // chat enter event
    chatQuestionTextArea?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleAskClick();
        }
    });

    // image enter event
    promptTextArea?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleImageAskClick();
        }
    });

    try {
        // Handle messages sent from the extension to the webview
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'answer':
                    // Append answer.
                    const data = document.createTextNode(message.data);
                    answer?.appendChild(data);
                    break;
                case 'history-data':
                    searchHistory = message.data;
                    updateHistoryList();
                    break;
                case 'image-urls-answer':
                    // Append answer.
                    const imageList = message.data as any[];
                    updateImageList(imageList)
                    hideProgressRing();
                    break;
                case 'image-error-answer':
                    // Append answer.
                    showErrorMessage(message.data);
                    hideProgressRing();
                    break;
                case 'error':
                    break;
            }
        });
    } catch (err: any) {
        console.log('errrr js');
        console.log(err);
    }
}

//#region Chat

/**
 * Handle ask button click event.
 */
function handleAskClick() {

    // Send messages to Panel.
    vscode.postMessage({
        command: "press-ask-button",
        data: chatQuestionTextArea.value,
    });

    // Clear answer filed.
    answer.innerHTML = '';

    addHistory(chatQuestionTextArea.value);
}

/**
 * Handle clear button click event.
 */
function handleClearClick() {
    // Clear answer field.
    answer.innerHTML = '';

    // Clear question field.
    chatQuestionTextArea.value = '';
}

/**
 * Handle clear button click event.
 */
function handleClearHistoryButtonClick() {
    searchHistory = [];

    // Send messages to Panel.
    vscode.postMessage({
        command: "clear-history",
    });

    updateHistoryList()
}

/**
 * Update history list.
 */
function updateHistoryList() {

    const ul = document.getElementById('history-id');

    if (ul != null && searchHistory != null) {
        ul.textContent = '';
        let index = 0;
        for (const content of searchHistory) {
            if (content != undefined) {

                index++;
                const spanContainer = document.createElement('span');
                spanContainer.id = "container-span-id"
                spanContainer.className = "flex-container"
                spanContainer.style.marginTop = '15px';

                const spanNumber = document.createElement('span');
                spanNumber.id = "span-number-id"
                spanNumber.textContent = index + ') ';
                spanNumber.style.minWidth = '10px';
                spanNumber.style.width = '10px';
                spanNumber.style.fontSize = '14px';
                spanContainer.appendChild(spanNumber);

                const li = document.createElement('li');
                li.textContent = content.length > 50 ? content.substring(0, 250) + '...' : content;
                li.addEventListener('click', () => {
                    onHistoryClicked(content);
                });
                li.title = content;
                li.style.cursor = 'pointer';
                li.style.fontSize = '14px';
                li.style.listStyleType = 'none';

                spanContainer.appendChild(li);
                ul.appendChild(spanContainer);
            }
        }
    }
}

/**
 * Handle on click history question event.
 */
function onHistoryClicked(question: string) {
    vscode.postMessage({ command: 'history-question-clicked', data: question });

    // clear fields
    answer.innerHTML = '';
    chatQuestionTextArea.value = question;
}

/**
 * Add last search to history.
 * @param content :string
 */
function addHistory(content: string) {
    if (content != undefined) {
        if (searchHistory&&searchHistory.length < 10) {
            if (!searchHistory.includes(content))
                searchHistory.unshift(content);
        }
        if (searchHistory&&searchHistory.length == 10) {
            searchHistory.pop();
            if (!searchHistory.includes(content)) {
                searchHistory.unshift(content);
            }
        }
    }
    updateHistoryList();
}

//#endregion Chat

//#region Image

/**
 * Update history list.
 */
function updateImageList(imageUrls: any[]) {

    const galleryContainer = document.getElementById('gallery-container');

    if (galleryContainer != null) {
        galleryContainer.textContent = '';
        let index = 0;
        for (const img of imageUrls) {
            if (img != undefined) {

                index++;

                const galleryDivTag = document.createElement('div');
                galleryDivTag.className = "gallery"

                const aTag = document.createElement('a');
                aTag.target = '_blank';
                aTag.href = img.url;

                const imgNode = document.createElement('img');
                imgNode.src = img.url;
                imgNode.width = 400;
                imgNode.height = 400;
                imgNode.alt = promptTextArea.value + '-' + index;
                imgNode.style.cursor = 'pointer';
                aTag.appendChild(imgNode);

                const descDivTag = document.createElement('div');
                descDivTag.className = "desc";
                descDivTag.textContent = promptTextArea.value + '-' + index;

                galleryDivTag.appendChild(aTag);
                galleryDivTag.appendChild(descDivTag);
                galleryContainer.appendChild(galleryDivTag);
            }
        }
    }
}


/**
 * Handle generate image button click event.
 */
function handleImageAskClick() {

    showProgressRing();

    const pError = document.getElementById('image-error-id') as any;
    pError.textContent = '';

    // Send messages to Panel.
    vscode.postMessage({
        command: "press-image-ask-button",
        data: promptTextArea.value,
    });

    // Clear images filed.
    updateImageList([]);
}

/**
 * Handle clear image button click event.
 */
function handleImageClearClick() {

    // Clear images filed.
    updateImageList([]);

    // Clear question field.
    promptTextArea.value = '';

}


function showErrorMessage(message: string) {
    const pError = document.getElementById('image-error-id') as any;
    pError.textContent = message;
}

//#endregion Image

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
