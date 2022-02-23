let mode, intensity, updateOnClick, delayOnLoad;

const run = (reason) => {
    console.log("trying");
    console.log(reason);

    if (!mode) return;
    if (reason == "click" && !updateOnClick) return;

    const allElems = document.querySelectorAll("*");

    //.backgroundColor
    for (let elem of allElems) {
        const computed = window.getComputedStyle(elem);

        // Non-text elements
        const bC = tinycolor(computed.backgroundColor);
        if (bC.isLight()) {
            const darkened = bC.darken(intensity);
            elem.style.backgroundColor = darkened;
        }

        // Text
        const col = tinycolor(computed.color);
        if (col.isDark()) {
            const lightened = col.lighten(intensity);
            elem.style.color = lightened;
        }

        // SVGs
        const fill = tinycolor(computed.fill);
        if (fill.isDark()) {
            const lightened = fill.lighten(intensity);
            elem.style.fill = lightened;
        }
    }
};

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

            if (backToLightMode) {
                if (window.confirm("Reload the page to remove darkness?")) {
                    location.reload();
                }
            }

            setTimeout(run, init ? delayOnLoad * 1000 : 0);
        }
    );
};

getSettings(true);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message '" + message + "'");
    if (message === "updateSettings") {
        getSettings();
        run();
    }
    sendResponse({ success: true });
});

document.addEventListener("click", () => run("click"));
