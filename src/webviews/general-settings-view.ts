import { AiPlatforms } from "../constants/constants";
import { InitGeneralSettingsViewData, Settings } from "../interfaces/common-interfaces";

const vsCodeApi = acquireVsCodeApi();

/**
 * Add load event.
 */
window.addEventListener("load", generalSettingsMain);

// Declare Html elements.
const startButton = document.getElementById("start-button");
const saveButton = document.getElementById("save-button") as any;
const apiKeyTextField = document.getElementById("api-key-text-field") as any;
const temperatureTextField = document.getElementById("temperature-text-field") as any;
const imageNumberTextField = document.getElementById("image-number-text-field") as any;
const imageSizeTextField = document.getElementById("image-size-text-field") as any;
const platformSelect = document.getElementById("platform-select-field") as HTMLSelectElement;
const modelSelect = document.getElementById("model-select-field") as HTMLSelectElement;

// let settingsHistory: Settings[] = [];
// let selectedPlatformHistory: string;

/**
 * Main function
 */
function generalSettingsMain() {

    // Sayfa ilk yüklendiğinde
  //  populatePlatforms();
    // populateModels(platformSelect.value);

    // Add eventLsteners of Html elements.
    startButton?.addEventListener("click", handleStartButtonClick);
    saveButton?.addEventListener("click", handleSaveClick);

    // Olay dinleyici
    // Event: Platform seçimi değiştiğinde modelleri güncelle
    platformSelect.addEventListener("change", () => {
        // const selectedPlatformKey = platformSelect.value;

        // const selectedSetting = settingsHistory.find(a => a.platform == platformSelect.value);
        // if (selectedSetting) {
        //     apiKeyTextField.value = selectedSetting?.apiKey;
        //     temperatureTextField.value = selectedSetting?.temperature;
        //     imageNumberTextField.value = selectedSetting?.responseNumber;
        //     imageSizeTextField.value = selectedSetting?.imageSize;
        // }

        populateModels(platformSelect.value);
    });

    // Handle messages sent from the extension or panel to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.command) {
            case 'settings-exist':
                // Append api key.
                const initViewData = message.data as InitGeneralSettingsViewData;
                console.log('message.data', initViewData.settings);
                console.log('Selected Paltform', initViewData.selectedPlatform);

                setTimeout(() => {

                    console.log('2 saniye sonra', initViewData.settings);
                    console.log('2 saniye sonra Selected Paltform', initViewData.selectedPlatform);
                    initWebView(initViewData);
                }, 5000);
                break;
            case 'error':
                console.log(message);
                break;
        }
    });
}

function initWebView(initViewData: InitGeneralSettingsViewData) {
    const platform = initViewData.selectedPlatform;

    // settingsHistory = initViewData.settings;
    // selectedPlatformHistory = initViewData.selectedPlatform;

    const selectedSetting = initViewData.settings.find(a => a.platform = platform);

    if (selectedSetting) {
      //  populateModels(selectedSetting.platform);

        // apiKeyTextField.value = selectedSetting?.apiKey;
        // temperatureTextField.value = selectedSetting?.temperature;
        // imageNumberTextField.value = selectedSetting?.responseNumber;
        // imageSizeTextField.value = selectedSetting?.imageSize;

        //    platformSelect.value = selectedSetting?.platform;

       // modelSelect.value = selectedSetting?.model as string;
    }
}
/**
 * Handle start button click event.
 */
function handleStartButtonClick() {
    // Send messages to Panel.
    vsCodeApi.postMessage({
        command: "start-chat",
        text: 'start-chat',
    });
}


/**
 * Handle save  click event. 
 */
function handleSaveClick() {
    const settings = {
        apiKey: apiKeyTextField?.value,
        temperature: temperatureTextField?.value,
        responseNumber: imageNumberTextField?.value,
        imageSize: imageSizeTextField?.value,
        platform: platformSelect?.value,
        model: modelSelect?.value,
    } as Settings;

    vsCodeApi.postMessage({
        command: "save-settings",
        data: settings,
    });
}


// Platformları select alanına ekle
function populatePlatforms(): void {
    platformSelect.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "0";
    firstOption.text = "Please Select";
    platformSelect.appendChild(firstOption);
    Object.entries(AiPlatforms).forEach(([key, value]) => {
        const option = document.createElement("option");
        option.value = key;
        option.text = value.label;
        platformSelect.appendChild(option);
    });
}

// Seçilen platforma göre modelleri select alanına ekle
function populateModels(platformKey: string): void {
    const platform = AiPlatforms[platformKey];
    if (!platform) return;

    modelSelect.innerHTML = "";

    platform.models.forEach(model => {
        const option = document.createElement("option");
        option.value = model.value;
        option.text = model.label;
        modelSelect.appendChild(option);
    });
}





