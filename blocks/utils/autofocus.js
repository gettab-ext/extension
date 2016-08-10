import {BLOCK_SETTINGS_STORAGE_KEY} from '../config/const';
import settings from '../settings/settings';
import _ from 'lodash';

let autofocus = true;

const initAutofocus = () => {

    settings.inited().then(() => {
        const blockSettings = settings.get(BLOCK_SETTINGS_STORAGE_KEY);
        autofocus = !blockSettings || blockSettings.autofocus.visible;
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
                chrome.tabs.remove(id);
                chrome.tabs.create({
                    url: chrome.extension.getURL("index.html") + '?r=1'
                });
            }
        }
    });
};

export default initAutofocus;
