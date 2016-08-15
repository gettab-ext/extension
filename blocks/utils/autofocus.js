import {BLOCK_SETTINGS_STORAGE_KEY} from '../config/const';
import {DEFAULT_AUTOFOCUS} from '../config/config';
import settings from '../settings/settings';
import _ from 'lodash';

let autofocus = DEFAULT_AUTOFOCUS;

const initAutofocus = () => {

    settings.inited().then(() => {
        const blockSettings = settings.get(BLOCK_SETTINGS_STORAGE_KEY);
        if (blockSettings) {
            autofocus = blockSettings.autofocus.visible;
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.userSettings) {
            autofocus = !!_.get(changes, 'userSettings.newValue.blockSettings.autofocus.visible');
        }
    });

    chrome.tabs.onCreated.addListener(function(t) {
        if (autofocus) {
            var id = t.id;
            if (t.url && t.url == 'chrome://newtab/') {
                chrome.tabs.create({
                    url: chrome.extension.getURL("index.html") + '?r=1'
                });
                chrome.tabs.remove(id);
            }
        }
    });
};

export default initAutofocus;
