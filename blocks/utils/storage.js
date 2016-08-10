/* global chrome */

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
            },
            remove(key, callback) {
                localStorage.removeItem(key);
                callback();
            }
        }
    }
}

class Storage {

    get(key) {
        return new Promise(resolve => {
            chrome.storage.local.get(key, value => {
                const item = value[key];

                if (!item) {
                    resolve(undefined);
                } else if (item.timestamp === undefined && item.data) {
                    resolve(item.data);
                } else if (item.timestamp && item.timestamp > Date.now() && item.data) {
                    resolve(item.data);
                } else {
                    chrome.storage.local.remove(key, () => resolve(undefined));
                }
            });
        });
    }

    set(key, value, ttl) {
        return new Promise(resolve => {
            const obj = {
                [key]: {
                    data: value,
                    timestamp: ttl ? (Date.now() + ttl) : undefined
                }
            };
            chrome.storage.local.set(obj, () => resolve(value));
        });
    }

    _clean() {

    }

}

const storage = new Storage();
export default storage;
