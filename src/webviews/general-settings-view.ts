import { aiPlatforms, HTML_OBJECT_IDS, MESSAGE_COMMANDS } from "../constants/constants";
import { InitGeneralSettingsViewData, Settings } from "../interfaces/common-interfaces";

const vsCodeApi = acquireVsCodeApi();

/**
 * Add load event.
 */
window.addEventListener("load", generalSettingsMain);

// Declare Html elements.
const startButton = document.getElementById(HTML_OBJECT_IDS.startButton);
const saveButton = document.getElementById(HTML_OBJECT_IDS.saveButton) as any;
const apiKeyTextField = document.getElementById(HTML_OBJECT_IDS.apiKeyTextField) as any;
const temperatureTextField = document.getElementById(HTML_OBJECT_IDS.temperatureTextField) as any;
const imageNumberTextField = document.getElementById(HTML_OBJECT_IDS.imageNumberTextField) as any;
const imageSizeTextField = document.getElementById(HTML_OBJECT_IDS.imageSizeTextField) as any;
const platformSelect = document.getElementById(HTML_OBJECT_IDS.platformSelectField) as HTMLSelectElement;
const modelSelect = document.getElementById(HTML_OBJECT_IDS.modelSelectField) as HTMLSelectElement;

let settingsHistory: Settings[] = [];
let selectedPlatformHistory: string;

/**
 * Main function
 */
function generalSettingsMain() {

    // Sayfa ilk yüklendiğinde
    populatePlatforms();
    populateModels(platformSelect.value);

    // Add eventLsteners of Html elements.
    startButton?.addEventListener("click", handleStartButtonClick);
    saveButton?.addEventListener("click", handleSaveClick);

    // Olay dinleyici
    // Event: Platform seçimi değiştiğinde modelleri güncelle
    platformSelect.addEventListener("change", () => {
        const selectedPlatformKey = platformSelect.value;

        if (settingsHistory && settingsHistory.length > 0) {
            const selectedSetting = settingsHistory.find(a => a.platform === selectedPlatformKey);
            if (selectedSetting) {
                apiKeyTextField.value = selectedSetting?.apiKey;
                temperatureTextField.value = selectedSetting?.temperature;
                imageNumberTextField.value = selectedSetting?.responseNumber;
                imageSizeTextField.value = selectedSetting?.imageSize;
            }
        }

        populateModels(platformSelect.value);
    });

    // Handle messages sent from the extension or panel to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case MESSAGE_COMMANDS.existSettings:

                const initViewData = message.data as InitGeneralSettingsViewData;
                initWebView(initViewData);

                break;
            case 'error':
                console.log(message);
                break;
        }
    });
}

function initWebView(initViewData: InitGeneralSettingsViewData) {
    settingsHistory = initViewData.settings;
    selectedPlatformHistory = initViewData.selectedPlatform;

    const platform = selectedPlatformHistory;

    if (settingsHistory && settingsHistory.length > 0) {

        const selected = settingsHistory.find(a => a.platform === platform);

        if (selected) {
            populateModels(platform);

            apiKeyTextField.value = selected?.apiKey;
            temperatureTextField.value = selected?.temperature;
            imageNumberTextField.value = selected?.responseNumber;
            imageSizeTextField.value = selected?.imageSize;

            platformSelect.value = platform;

            modelSelect.value = selected?.model as string;
        }
    }
}

function handleStartButtonClick() {
    // Send messages to Panel.    
    postMessage(MESSAGE_COMMANDS.startChat, "");
}

function handleSaveClick() {
    const settings = {
        apiKey: apiKeyTextField?.value,
        temperature: temperatureTextField?.value,
        responseNumber: imageNumberTextField?.value,
        imageSize: imageSizeTextField?.value,
        platform: platformSelect?.value,
        model: modelSelect?.value,
    } as Settings;

    postMessage(MESSAGE_COMMANDS.saveSettings, settings);
}

function postMessage(command: string, data: any) {
    vsCodeApi.postMessage({
        command: command,
        data: data,
    });
}

function populatePlatforms(): void {
    platformSelect.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "0";
    firstOption.text = "Please Select";
    platformSelect.appendChild(firstOption);
    Object.entries(aiPlatforms)
        .forEach(([key, value]) => {
            const option = document.createElement("option");
            option.value = key;
            option.text = value.label;
            platformSelect.appendChild(option);
        });
}

function populateModels(platformKey: string): void {
    const platform = aiPlatforms[platformKey];
    if (!platform) { return; }

    modelSelect.innerHTML = "";

    platform.models.forEach(model => {
        const option = document.createElement("option");
        option.value = model.value;
        option.text = model.label;
        modelSelect.appendChild(option);
    });
}
