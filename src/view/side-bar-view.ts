const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

const oldState: any = vscode.getState() || { conversations: [] };

let conversations: string[] = [];
let iconUrl: any;
if (oldState.conversations) {
    conversations = oldState.conversations;
    updateConversationsList();
}


// Html element
const startChatButton = document.getElementById("start-chat-gpt-button");
const clearButton = document.getElementById("clear-conversations-button");

/**
 * Main function
 */
function main() {

    // Add the eventLsteners.
    startChatButton?.addEventListener("click", handleStartButtonClick);
    clearButton?.addEventListener("click", handleClearButtonClick);


    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'add-new-question-command':
                {
                    addConversation(message.data);
                }
                break;
            case 'conversation-icon-command':
                iconUrl = message.data;
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
 * Handle clear button click event.
 */
function handleClearButtonClick() {
    conversations = [];
    vscode.setState({ conversations: conversations });
    updateConversationsList()
}


function onHistoryClicked(question: string) {
    vscode.postMessage({ command: 'history-question-command', data: question });
}

/**
 * @param {Array<{ value: string }>} colors
*/
function updateConversationsList() {
    const ul = document.getElementById('conversations-id');

    if (ul != null) {
        ul.textContent = '';
        let index = 0;
        for (const conversation of conversations) {
            if (conversation != undefined) {

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
                li.className = 'color-entry';
                li.textContent = conversation.length > 100 ? conversation.substring(0, 100) + '...' : conversation;
                li.addEventListener('click', () => {
                    onHistoryClicked(conversation);
                });
                li.title = conversation;
                li.style.cursor = 'pointer';
                li.style.fontSize = '14px';
                li.style.listStyleType = 'none';

                spanContainer.appendChild(li);
                ul.appendChild(spanContainer);
            }
        }
    }

    // Update the saved state
    vscode.setState({ conversations: conversations });

}

function addConversation(content: string) {
    if (content != undefined) {
        if (conversations.length < 10) {
            if (!conversations.includes(content))
                conversations.unshift(content);
        }
        if (conversations.length == 10) {
            conversations.pop();
            if (!conversations.includes(content)) {
                conversations.unshift(content);
            }
        }
    }
    updateConversationsList();
}
