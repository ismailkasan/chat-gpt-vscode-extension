const vscodeapi = acquireVsCodeApi();

// Add load event listener.
window.addEventListener("load", main);

// image
const askImageButton = document.getElementById("ask-image-button-id") as any;
const imagePromptTextArea = document.getElementById("prompt-text-id") as HTMLInputElement;
const clearImageButton = document.getElementById("clear-image-button-id") as HTMLInputElement;

/**
 * Main function
 */
function main() {

    hideProgressRing();

    // image button events
    askImageButton?.addEventListener("click", handleImageAskClick);
    clearImageButton?.addEventListener("click", handleImageClearClick);  

    // image enter event
    imagePromptTextArea?.addEventListener("keypress", function (event) {
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
                imgNode.alt = imagePromptTextArea.value + '-' + index;
                imgNode.style.cursor = 'pointer';
                aTag.appendChild(imgNode);

                const descDivTag = document.createElement('div');
                descDivTag.className = "desc";
                descDivTag.textContent = imagePromptTextArea.value + '-' + index;

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
        data: imagePromptTextArea.value,
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
    imagePromptTextArea.value = '';
}


function showErrorMessage(message: string) {
    const pError = document.getElementById('image-error-id') as any;
    pError.textContent = message;
}


/**
 * Show progessing ring.
 */
function showProgressRing() {
    // add progress ring.
    const progressRing = document.getElementById("progress-ring-id") as any;
    progressRing.style.display = 'inline-block';
}

/**
 * Hide progressing ring.
 */
function hideProgressRing() {
    const progressRing = document.getElementById("progress-ring-id") as any;
    progressRing.style.display = 'none';
}
