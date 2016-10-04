import {BLOCK_SETTINGS_STORAGE_KEY} from '../config/const';
import {DEFAULT_AUTOFOCUS} from '../config/config';
import settings from '../settings/settings';
import _ from 'lodash';

let autofocus = DEFAULT_AUTOFOCUS;
const newTabUrl = 'chrome://newtab/';

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

    const openNewTab = () => {
        chrome.tabs.create({
            url: chrome.extension.getURL("index.html") + '?r=1'
        });
    };

    const onTabOpen = (t) => {
        const id = t.id;
        if (autofocus && t.url && t.url == newTabUrl) {
            openNewTab();
            chrome.tabs.remove(id);
        }
    };

    chrome.tabs.onCreated.addListener(onTabOpen);
    chrome.tabs.query({url: newTabUrl}, tabs => tabs.forEach(tab => onTabOpen(tab)));

};

export default initAutofocus;
