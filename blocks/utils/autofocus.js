import {AUTOFOCUS} from '../config/config';

chrome.tabs.onCreated.addListener(function(t) {
    if (AUTOFOCUS) {
        var id = t.id;
        if (t.url && t.url == 'chrome://newtab/') {
            chrome.tabs.remove(id);
            chrome.tabs.create({
                url: chrome.extension.getURL("index.html") + '?r=1'
            });
        }
    }
});
