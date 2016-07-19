const noop = () => {};

const browser = {
    button: {
        setText(text, callback = noop) {
            if (chrome.browserAction) {
                chrome.browserAction.setBadgeText({ text: text });
            }

            callback(false);
        },

        setBgColor(color, callback = noop) {
            if (chrome.browserAction) {
                chrome.browserAction.setBadgeBackgroundColor({ color: color });
            }
            callback(false);
        }
    }
};

if (chrome.browserAction) {
    chrome.browserAction.onClicked.addListener(function(e) {
        browser.button.onClick.fire();
    });
}

export default browser;

