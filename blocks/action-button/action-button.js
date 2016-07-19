import tabs from '../utils/tabs';
import runtime from '../utils/runtime';

const launch = function(behavior, url) {
    tabs.create({
        active: true,
        url: url
    });
};

const initActionButton = () => {
    if (!chrome.browserAction) {
        return;
    }

    chrome.browserAction.onClicked.addListener(function(e) {
        runtime.getNewtabInfo(function(newtab) {
            launch('newtab', newtab.url);
        });
    });
};

initActionButton();



