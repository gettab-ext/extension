/* global chrome */
import _ from 'lodash';

const STORAGE_KEY = "userSettings";

if (!chrome.storage) {
    chrome.storage = {
        local: {
            get(key, callback) {
                const value = localStorage.getItem(key);
                callback({
                    [key]: value ? JSON.parse(value) : undefined
                });
            },
            set(object, callback) {
                _.forOwn(object, (value, key) => {
                    localStorage.setItem(key, JSON.stringify(value));
                });
                callback();
            }
        }
    }
}

class Settings {
    constructor() {

        this._inited = this._loadSettings();

    }

    _loadSettings() {
        return new Promise(resolve => {
            chrome.storage.local.get(STORAGE_KEY, items => {
                this._settings = Object.assign({}, items[STORAGE_KEY]);
                resolve();
            });
        });
    }

    set(key, value) {
        this._settings[key] = value;

        return new Promise(resolve => {
            chrome.storage.local.set({
                [STORAGE_KEY]: this._settings
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
