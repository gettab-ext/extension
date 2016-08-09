import {SETTINGS_STORAGE_KEY} from '../config/const';

const DEFAULT_SETTINGS = {
    'search_engine': 'yahoo'
};

export const SETTING_KEYS = {
    searchEngine: 'search_engine'
};

class Settings {
    constructor() {
        this._inited = this._loadSettings();
    }

    _loadSettings() {
        return new Promise(resolve => {
            chrome.storage.local.get(SETTINGS_STORAGE_KEY, items => {
                this._settings = Object.assign(DEFAULT_SETTINGS, items[SETTINGS_STORAGE_KEY]);
                resolve();
            });
        });
    }

    set(key, value) {
        this._settings[key] = value;

        return new Promise(resolve => {
            chrome.storage.local.set({
                [SETTINGS_STORAGE_KEY]: this._settings
            }, () => resolve());
        });
    }

    get(key) {
        return this._settings[key];
    }

    inited() {
        return this._inited;
    }

}

const settings = new Settings();

export default settings;
