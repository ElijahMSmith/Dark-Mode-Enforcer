let mode, intensity, updateOnClick, delayOnLoad;

// The function that makes things into dark mode
const run = (reason) => {
    console.log("trying");
    console.log(reason);

    // If the dark mode is turned off or the updateOnClick setting is turned off
    // and the function is called from the click listener, skip
    if (!mode) return;
    if (reason == "click" && !updateOnClick) return;

    // Get an array of all the elements on the page
    const allElems = document.querySelectorAll("*");

    for (let elem of allElems) {
        // Because styles from external style sheets won't be included in elem.style,
        // we have to get the computer style (after all styles are applied from all sources,
        // this is what is the final result the user sees)
        const computed = window.getComputedStyle(elem);

        // Non-text elements - Mark dark if too bright
        const bC = tinycolor(computed.backgroundColor);
        if (bC.isLight()) {
            const darkened = bC.darken(intensity);
            elem.style.backgroundColor = darkened;
        }

        // Text - Make light for contrast with dark backgrounds
        const col = tinycolor(computed.color);
        if (col.isDark()) {
            const lightened = col.lighten(intensity);
            elem.style.color = lightened;
        }

        // SVGs - Also make light for contrast
        const fill = tinycolor(computed.fill);
        if (fill.isDark()) {
            const lightened = fill.lighten(intensity);
            elem.style.fill = lightened;
        }
    }
};

// Check Chrome storage for the current value of all settings
const getSettings = (init) => {
    chrome.storage.sync.get(
        {
            mode: false,
            intensity: 90,
            updateOnClick: false,
            delayOnLoad: 0,
        },
        (result) => {
            console.log(result);

            const backToLightMode = mode && !result.mode;

            mode = result.mode;
            intensity = result.intensity;
            updateOnClick = result.updateOnClick;
            delayOnLoad = result.delayOnLoad;

            // If the popup has turned dark mode OFF,
            // then we want to reload the page to reverse our darkening
            if (backToLightMode) {
                if (window.confirm("Reload the page to remove darkness?"))
                    location.reload();
            }

            // Delay the darkening process by the value put in the settings
            setTimeout(run, init ? delayOnLoad * 1000 : 0);
        }
    );
};

// Listen for any update messages from the popup if mode/intensity changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message '" + message + "'");
    if (message === "updateSettings") {
        // If popup is updated, then we get our
        // new settings values and run the darkening again
        getSettings();
        run();
    }
    sendResponse({ success: true });
});

// If the page is clicked anywhere, re-run the darkening code
document.addEventListener("click", () => run("click"));

// Get settings and then run the darkening when the script initially runs
getSettings(true);
