import tabs from '../utils/tabs';

const initActionButton = () => {
    if (!chrome.browserAction) {
        return;
    }

    chrome.browserAction.onClicked.addListener(function(e) {
        tabs.createNewTab();
    });
};

initActionButton();



