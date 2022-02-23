const toggle = document.getElementById("toggle");
const modeDisplay = document.getElementById("modeDisplay");
const intensityDisplay = document.getElementById("intensityDisplay");
const intensityBar = document.querySelector("input");

let mode = false;
let intensity = 90;

const updateLabels = () => {
    modeDisplay.textContent = mode ? " ON" : "OFF";
    intensityDisplay.textContent = intensity;
};

const sendUpdateRequest = () => {
    chrome.tabs.query({ active: true }, function (tabs) {
        // chrome.runtime.sendMessage variant targets open extension pages, not content scripts in a given tab
        chrome.tabs.sendMessage(
            tabs[0].id,
            "updateSettings", // <- Could also be a JSON object, or anything JSON serializable
            () => console.log("Sent updateSettings")
        );
    });
};

toggle.addEventListener("click", () => {
    mode = !mode;
    chrome.storage.sync.set({ mode: mode }, () => {
        console.log("Set mode to " + mode);
        updateLabels();
        sendUpdateRequest();
    });
});

intensityBar.addEventListener("input", (event) => {
    console.log(event);
    intensity = Number(event.target.value);
    chrome.storage.sync.set({ intensity: intensity }, () => {
        console.log("Set intensity to " + intensity);
        updateLabels();
        sendUpdateRequest();
    });
});

chrome.storage.sync.get({ mode: false, intensity: 90 }, (retrieved) => {
    console.log(retrieved);
    mode = retrieved.mode;
    intensity = retrieved.intensity;

    updateLabels();
    intensityBar.value = intensity;
});
