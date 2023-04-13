const vscode = acquireVsCodeApi();

/**
 * Add load event.
 */
window.addEventListener("load", main);

// Get search history from state.
const oldState: any = vscode.getState() || { searchHistory: [] };

// declare an array for search history.
let searchHistory: string[] = [];

if (oldState.searchHistory) {
    searchHistory = oldState.searchHistory;
    updateHistoryList();
}


// Declare Html elements.
const startChatButton = document.getElementById("start-chat-gpt-button");
const clearButton = document.getElementById("clear-history-button");

/**
 * Main function
 */
function main() {

    // Add eventLsteners of Html elements.
    startChatButton?.addEventListener("click", handleStartButtonClick);
    clearButton?.addEventListener("click", handleClearButtonClick);

    // Handle messages sent from the extension or panel to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'add-new-question-command':
                {
                    addHistory(message.data);
                }
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
    searchHistory = [];
    vscode.setState({ searchHistory: searchHistory });
    updateHistoryList()
}

/**
 * Handle on click history question event.
 */
function onHistoryClicked(question: string) {
    vscode.postMessage({ command: 'history-question-command', data: question });
}


/**
 * Update history list.
 */
function updateHistoryList() {
    const ul = document.getElementById('history-id');

    if (ul != null) {
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
                li.textContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
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

    // Update the saved state
    vscode.setState({ searchHistory: searchHistory });

}

/**
 * Add last search to history.
 * @param content :string
 */
function addHistory(content: string) {
    if (content != undefined) {
        if (searchHistory.length < 10) {
            if (!searchHistory.includes(content))
                searchHistory.unshift(content);
        }
        if (searchHistory.length == 10) {
            searchHistory.pop();
            if (!searchHistory.includes(content)) {
                searchHistory.unshift(content);
            }
        }
    }
    updateHistoryList();
}
