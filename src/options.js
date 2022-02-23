const checkbox = document.getElementById("checkbox");
const darkenDelay = document.getElementById("darkenDelay");

let checked = false;
let seconds = 0;

checkbox.addEventListener("change", (e) => {
    checked = e.target.checked;
    chrome.storage.sync.set(
        {
            updateOnClick: checked,
        },
        () => console.log("updateOnClick = " + e.target.checked)
    );
});

darkenDelay.addEventListener("change", (e) => {
    seconds = Number(e.target.value);
    if (seconds < 0) {
        seconds = 0;
        darkenDelay.value = seconds;
    }

    chrome.storage.sync.set(
        {
            delayOnLoad: seconds,
        },
        () => console.log("delayOnLoad = " + e.target.checked)
    );
});

chrome.storage.sync.get({ updateOnClick: false, delayOnLoad: 0 }, (result) => {
    console.log(result);
    checked = result.updateOnClick;
    seconds = result.delayOnLoad;

    checkbox.checked = checked;
    darkenDelay.value = seconds;
});
