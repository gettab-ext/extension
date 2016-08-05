import storage from './storage';
import utils from './utils';

const DEFAULT_TIMEOUT = 120 * 1000;

class Fetcher {
    constructor({key, url, ttl, timeout, noHttpCache, autoRefresh, getter}) {
        this.url = url;
        this.ttl = ttl;
        this.timeout = timeout || DEFAULT_TIMEOUT;
        this.noHttpCache = noHttpCache;
        this.autoRefresh = autoRefresh;
        this.getter = getter;

        this.storageKey = (key || `fetcher__${url}`);

        if (this.autoRefresh) {
            this.get();
        }
    }

    /**
     * @returns {Promise}
     */
    get(passCache = false) {
        return storage.get(this.storageKey).then(stored => {
            if (stored && !passCache) {
                return stored;
            }
            const saveToCache = (data) => storage.set(this.storageKey, data, this.ttl);

            const getter = (this.getter
                ? this.getter()
                : new Promise((resolve, reject) => {
                    $.ajax({
                        url: this.url,
                        data: this.noHttpCache && `rnd=${Math.random() * 1000}`,
                        success: (data) => resolve(data),
                        fail: () => reject(`Error fetch ${this.url}`)
                    });
                })
            );

            getter.then(data => {
                if (this.autoRefresh) {
                    setTimeout(() => this.get(true), this.ttl);
                }
                saveToCache(data);
                return data;
            });

            const timeoutReject = new Promise((resolve, reject) => {
                utils.wait(this.timeout).then(() => reject(`Fetch timeout ${this.url}`));
            });

            return ((this.timeout !== undefined)
                ? Promise.race([timeoutReject, getter])
                : getter
            );
        });
    }
}

export default Fetcher;
