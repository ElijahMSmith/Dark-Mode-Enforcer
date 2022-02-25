// Get a reference to those elements by their IDs
const checkbox = document.getElementById("checkbox");
const darkenDelay = document.getElementById("darkenDelay");

// Whether or not we want to re-run the darkening process when the page is clicked on.
// If true, then any elements not changed by the content script running when initially injected
// (elements not on the page at that time) will finally be hit by the process.
let checked = false;
// How long do we want to wait after the page loads for elements to finish loading in before we darken.
// The longer we wait, the more chance that the content script will affect EVERY element on the page.
let seconds = 0;

// When the checkbox is toggled, save it in storage
checkbox.addEventListener("change", (event) => {
    // We get the new value from the target of the event,
    // but we could just as easily get checkbox.checked
    checked = event.target.checked;

    chrome.storage.sync.set({ updateOnClick: checked }, () =>
        console.log("updateOnClick = " + event.target.checked)
    );
});

// When a number is put into the input, save it in storage
darkenDelay.addEventListener("change", (event) => {
    // Again, we could also get seconds from darkenDelay.value
    seconds = event.target.value;

    // While the value of the input is guarantee to be a number since the
    // type of the input is "number", it could still be negative which is bad.
    if (seconds < 0) {
        seconds = 0;
        darkenDelay.value = seconds;
    }

    chrome.storage.sync.set({ delayOnLoad: seconds }, () =>
        console.log("delayOnLoad = " + event.target.checked)
    );
});

// Get whatever the current values of these settings are when the options page is first loaded.
chrome.storage.sync.get({ updateOnClick: false, delayOnLoad: 0 }, (result) => {
    console.log(result);
    checked = result.updateOnClick;
    seconds = result.delayOnLoad;

    checkbox.checked = checked;
    darkenDelay.value = seconds;
});
