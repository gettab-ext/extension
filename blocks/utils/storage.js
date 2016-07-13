/* global chrome */

const TTL_PREFIX = 'timestamp';

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
                console.log('get', key, value, item, item && item.timestamp < Date.now());

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
            console.log('storage set', obj);
            chrome.storage.local.set(obj, () => resolve(value));
        });
    }

}

const storage = new Storage();
export default storage;