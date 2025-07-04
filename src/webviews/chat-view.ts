import { AiPlatforms } from "../constants/constants";
import { History, Prompt, PromptResponse, Settings, InitChatViewData } from "../interfaces/common-interfaces";
const vscode = acquireVsCodeApi();

// Add load event listener.
window.addEventListener("load", chatMain);

// declare an array for search history.
let historyList: History[] = [];
let settings: Settings[] = [];
let selectedPaltform: string;
let logoPath: string;

// Declare Html elements
const promptTextArea = document.getElementById("prompt-text-area") as HTMLInputElement;
const sendButton = document.getElementById("send-button");
const newChatButton = document.getElementById("new-chat-button");
const clearHistoryButton = document.getElementById("clear-history-button");


function chatMain() {

    // Add the eventLsteners.
    sendButton?.addEventListener("click", handleNewPromptClick);
    newChatButton?.addEventListener("click", handleNewChatPanelClick);
    clearHistoryButton?.addEventListener("click", handleClearHistoryButtonClick);

    // chat enter event
    promptTextArea?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleNewPromptClick();
        }
    });

    try {
        // Handle messages sent from the extension to the webview
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'prompt-responded-command':
                    // Append answer.
                    const response = message.data as PromptResponse;
                    handlePromptResponse(response);
                    break;
                case 'history-data-sended-to-webview-command':
                    historyList = message.data as History[];
                    updateLeftHistoryList();
                    break;
                case 'init-view-command':
                    const initViewData = message.data as InitChatViewData;
                    initView(initViewData);

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

function initView(initViewData: InitChatViewData) {
    historyList = initViewData.history; // set history list
    settings = initViewData.settings; // set settings list
    selectedPaltform = initViewData.selectedPlatform; // set last selected platform
    logoPath = initViewData.logoPath;
    console.log('initViewData', initViewData);
    updatePaltformModelTitle();

    clearChatPanel();

    updateLeftHistoryList();


    const id = createHistoryId();
    setHistoryId(id);

    scrollToBottom();
}

function handleNewChatPanelClick() {

    updatePaltformModelTitle();

    promptTextArea.value = '';

    clearChatPanel();

    const id = createHistoryId();
    setHistoryId(id);

    scrollToBottom();
}

function handleClearHistoryButtonClick() {
    historyList = [];

    // Send messages to Panel.
    vscode.postMessage({
        command: "history-cleared-command",
    });

    updateLeftHistoryList();

    clearChatPanel();
}

function handleNewPromptClick() {

    const historyId = getHistoryId() as string;
    const chatId = createChatId() as string;
    const setting = settings.find(a => a.platform == selectedPaltform);

    const prompt = {
        "prompt": promptTextArea.value,
        "historyId": historyId,
        "settings": setting,
        "chatId": chatId,
        "date": new Date(),
    } as Prompt;


    // Send messages to Panel.
    vscode.postMessage({
        command: "prompt-created-command",
        data: prompt
    });

    const time = changeTimeFormat(prompt.date);

    const you = `<div id="prompt-pane" class="chat-message-right pb-4">
                                    <div>
                                        <div class="font-weight-bold mb-1">You</div>
                                        <div id="chat-prompt-time" class="text-muted small text-nowrap mt-2">${time}</div>
                                    </div>
                                    <div id="chat-prompt-${prompt.chatId}" class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                    ${prompt.prompt}                               
                                    </div>
                                </div>`;
    const cc = `<div id="answer-pane" class="chat-message-left pb-4">
                                    <div>
                                        <img src="${logoPath}" style="color:white;" class="rounded-circle mr-1" alt="code companion logo"
                                            width="40" height="40">
                                        <div id="chat-answer-time-${prompt.chatId}" class="text-muted small text-nowrap mt-2"></div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                        <div id="chat-answer-spinner-${prompt.chatId}"></div>                                    
                                        <div id="chat-answer-${prompt.chatId}"></div>                                    
                                    </div>
                                </div>`;

    const range = document.createRange();
    const fragment = range.createContextualFragment(you + cc);

    const answerMessages = document.getElementById('chat-answer-messages');
    if (answerMessages)
        answerMessages.appendChild(fragment);

    const spinner = ` <div id="mySpinner-${prompt.chatId}" class="spinner-border text-primary" role="status" style="width: 1.5rem; height: 1.5rem; display: none;">
                                  <span class="visually-hidden">Loading...</span>
                                </div>`;

    const spinnerId = "chat-answer-spinner-" + prompt.chatId;

    const chatAnswerSpinner = document.getElementById(spinnerId);
    if (chatAnswerSpinner)
        chatAnswerSpinner.innerHTML = spinner;

    showSpinner(prompt.chatId);
    scrollToBottom();
}

function handlePromptResponse(response: PromptResponse): void {

    hideSpinner(response.chatId);

    updatePromptResponse(response);

    scrollToBottom();
}

function updatePromptResponse(response: PromptResponse) {
    promptTextArea.value = '';

    const chatAnswerTime = document.getElementById('chat-answer-time-' + response.chatId);
    if (chatAnswerTime)
        chatAnswerTime.textContent = changeTimeFormat(response.date);

    const chatAnswer = document.getElementById('chat-answer-' + response.chatId);
    if (chatAnswer)
        typeHtmlWithTypingEffect(response.answer, chatAnswer);
}

function typeHtmlWithTypingEffect(html: string, target: HTMLElement, delay = 20) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rootNodes = Array.from(doc.body.childNodes);

    async function processNode(node: Node, parent: HTMLElement | Node): Promise<void> {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            for (const char of text) {
                await new Promise((res) => setTimeout(res, delay));
                parent.appendChild(document.createTextNode(char));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = (node as HTMLElement).cloneNode(false) as HTMLElement;
            parent.appendChild(el);
            for (const child of Array.from(node.childNodes)) {
                await processNode(child, el); // dikkat! içine yazıyoruz
            }
        }
    }

    (async () => {
        for (const node of rootNodes) {
            await processNode(node, target);
        }
    })();
}

function orderPromptsAndResponsesOnchatPanel(id: string) {

    const topic = historyList.find(a => a.id == id && a.platform == selectedPaltform);

    if (topic) {

        topic?.chats?.forEach(item => {

            const time = changeTimeFormat(item.date);

            const you = `<div id="prompt-pane" class="chat-message-right pb-4">
                                    <div>
                                        <div class="font-weight-bold mb-1">You</div>
                                        <div id="chat-prompt-time" class="text-muted small text-nowrap mt-2">${time}</div>
                                    </div>
                                    <div id="chat-prompt-${item.id}" class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                                    ${item.prompt}                               
                                    </div>
                                </div>`;
            const cc = `<div id="answer-pane" class="chat-message-left pb-4">
                                    <div>
                                        <img src="${logoPath}" style="color:white;" class="rounded-circle mr-1" alt="code companion logo"
                                            width="40" height="40">
                                        <div id="chat-answer-time-${item.id}" class="text-muted small text-nowrap mt-2">${time}</div>
                                    </div>
                                    <div class="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                                        <div id="chat-answer-spinner-${item.id}"></div>                                    
                                        <div id="chat-answer-${item.id}">${item.answer}</div>                                    
                                    </div>
                                </div>`;

            const range = document.createRange();
            const fragment = range.createContextualFragment(you + cc);

            const answerMessages = document.getElementById('chat-answer-messages');
            if (answerMessages)
                answerMessages.appendChild(fragment);

        });
    }
}

function scrollToBottom(): void {
    const messages = document.getElementById('chat-messages');
    messages?.scroll({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
}

function updateLeftHistoryList() {
    
    const platformHistoryList = historyList.filter(a => a.platform == selectedPaltform);

    const ul = document.getElementById('history-id');
    if (ul != null)
        ul.innerHTML = "";

    if (ul != null && historyList != null) {

        let index = 0;
        for (const item of platformHistoryList) {
            if (item != undefined) {

                index++;
                const li = document.createElement('li');
                li.id = "li-id-" + item.id;
                li.className = "nav-item";
                ul.appendChild(li);

                const lastTopic = item.chats?.reverse()[0]?.prompt;
                const anchor = document.createElement('a');
                anchor.id = "anchor-id" + item.id;
                anchor.className = "nav-link text-light px-2 py-1 rounded hover-bg"
                anchor.href = "#"
                anchor.textContent = (lastTopic != undefined ? lastTopic : '');
                anchor.addEventListener('click', () => {
                    onLeftHistoryItemClicked(item);
                });

                const flexDiv = document.createElement('div');
                flexDiv.id = "flex-div-id";
                flexDiv.className = "d-flex align-items-start";
                anchor.appendChild(flexDiv);

                li.appendChild(anchor);
            }
        }
    }
}

function onLeftHistoryItemClicked(history: History) {

    clearChatPanel();

    setHistoryId(history.id);

    orderPromptsAndResponsesOnchatPanel(history.id);
    updatePaltformModelTitle();

    scrollToBottom();
}

function updatePaltformModelTitle() {
    const topicTitle = document.getElementById('platform-model-title');
    const selectedSettings = settings?.find(a => a.platform == selectedPaltform);

    const platform = AiPlatforms[selectedPaltform].label;

    if (topicTitle)
        topicTitle.textContent = platform + ' - ' + selectedSettings?.model;
}

function clearChatPanel(): void {
    const messages = document.getElementById('chat-messages');

    if (messages) {
        const children = Array.from(messages.children);
        for (const child of children) {
            if (child.id !== 'chat-answer-messages') {
                messages.removeChild(child);
            }
        }
    }

    const topicTitle = document.getElementById('topic-title');
    if (topicTitle)
        topicTitle.textContent = "";
}

function setHistoryId(id: string): void {
    const messages = document.getElementById('chat-messages');
    messages?.setAttribute('data-history-id', id);
}

function getHistoryId(): string | null | undefined {
    const messages = document.getElementById('chat-messages');
    return messages?.getAttribute('data-history-id');
}

function createHistoryId(): string {
    const date = new Date();
    return `${date.getFullYear()}${date.getMonth()}${date.getDate() + 1}${date.getTime().toString()}`;
}

function createChatId(): string {
    const date = new Date();
    return date.getTime().toString();
}

function changeTimeFormat(dateStr: Date): string {

    const date = new Date(dateStr);
    let hours = date.getHours();
    let minutes = date.getMinutes().toString();

    // Check whether AM or PM
    let newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format
    hours = hours % 12;

    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < '10' ? '0' + minutes : minutes;

    return hours + ':' + minutes + ' ' + newformat;
}



function showSpinner(spinnerId: string) {
    const spinner = document.getElementById('mySpinner-' + spinnerId);
    if (spinner)
        spinner.style.display = 'inline-block'
}

function hideSpinner(spinnerId: string) {
    const spinner = document.getElementById('mySpinner-' + spinnerId);
    if (spinner)
        spinner.style.display = 'none'
}