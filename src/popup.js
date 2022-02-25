// Get a reference to all the elements we want to use in this script by their IDs
const toggle = document.getElementById("toggle");
const modeDisplay = document.getElementById("modeDisplay");
const intensityDisplay = document.getElementById("intensityDisplay");

// Just to be different, we're going to get the input slider with with querySelector
// The argument for this is any valid CSS selector and it returns the first match
// querySelectorAll, by contrast, returns an array of ALL matching elements
// We could just as easily give it an id and use getElementById
const intensityBar = document.querySelector("input");

// Keep our current settings value for display
let mode = false;
let intensity = 90;

// Change the text in our spans to be whatever the current values are
const updateLabels = () => {
    modeDisplay.textContent = mode ? " ON" : "OFF";
    intensityDisplay.textContent = intensity;
};

// When our popup has been changed, send a message to any
// running content scripts that they need to re-apply the darkening
const sendUpdateRequest = () => {
    // Get the currently open tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Send the message to that currently open tab,
        // which will be received by its content script
        chrome.tabs.sendMessage(
            // tabs is an array of all matching tabs, of which there is only one (only one active tab)
            tabs[0].id,
            // This message we're passing could also be a JSON object, or anything JSON serializable
            "updateSettings",
            (response) => {
                // If the content script hasn't run and set up the listener for the message yet, there will be an error.
                // This catches that error and does something else so that the error doesn't appear in the console.
                if (!chrome.runtime.lastError)
                    console.log("Response:\n", response);
            }
        );
    });
};

// Listen for the toggle button to be clicked
toggle.addEventListener("click", () => {
    // Update the mode and put it in storage
    mode = !mode;
    chrome.storage.sync.set({ mode: mode }, () => {
        // Update the text on the popup and send the update message to content scripts
        console.log("Set mode to " + mode);
        updateLabels();
        sendUpdateRequest();
    });
});

// Listen for the intensity bar to be DRAGGED
intensityBar.addEventListener("input", (event) => {
    // Each time the bar is dragged one place, the value of the input changes and this event triggers.
    // Since this happens a LOT, we don't want to save ALL these to storage,
    // Just update the popup text to the current value.
    console.log(event);
    intensity = Number(event.target.value);
    updateLabels();
});

// Listen for the intensity bar to be RELEASED
intensityBar.addEventListener("change", (event) => {
    // Since this only occurs when the input is released, it happens much less often.
    // At this point we can now save the change and send an update message to content scripts.
    // This way the content scripts don't have to re-run on hundreds of elements 10s of times per second.
    console.log(event);
    intensity = Number(event.target.value);
    chrome.storage.sync.set({ intensity: intensity }, () => {
        console.log("Set intensity to " + intensity);
        updateLabels();
        sendUpdateRequest();
    });
});

// Get whatever is in storage as the default value when popup is first opened
chrome.storage.sync.get({ mode: false, intensity: 90 }, (retrieved) => {
    console.log(retrieved);
    mode = retrieved.mode;
    intensity = retrieved.intensity;

    updateLabels();
    intensityBar.value = intensity;
});
