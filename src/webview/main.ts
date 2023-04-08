import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeDivider, vsCodeProgressRing, Button, ProgressRing, TextArea } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextArea(), vsCodeDivider(), vsCodeProgressRing());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);
hideProgressRing();

// Handle messages sent from the extension to the webview
const answer = document.getElementById("answers-id") as HTMLElement;
window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {

        case 'answer':
            hideProgressRing();
            // append answer
            const data = document.createTextNode(message.data);
            answer?.appendChild(data);
            break;
    }
});

function main() {

    const askButton = document.getElementById("ask-button-id") as Button;
    askButton?.addEventListener("click", handleAskClick);

}

function handleAskClick() {
    const questionTextArea = document.getElementById("question-text-id") as TextArea;
    vscode.postMessage({
        command: "press-ask-button",
        text: questionTextArea.value,
    });
    
    // question and answer text value clear
    questionTextArea.value = '';
    answer.innerHTML = '';
    
    // add question label
    const questionLabel = document.getElementById("question-id") as HTMLElement;
    const firstQuestionText = document.createTextNode(questionTextArea.value);
    questionLabel?.appendChild(firstQuestionText);

    // add progress ring
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    // const progressRingHtml = `<vscode-progress-ring id="progress-ring-id"></vscode-progress-ring>`;
    progressRing.style.display = 'inline-block';
}

function hideProgressRing() {
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'none';
}