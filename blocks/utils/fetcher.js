import storage from './storage';
import utils from './utils';

class Fetcher {
    constructor({url, ttl, timeout, noHttpCache}) {
        this.url = url;
        this.ttl = ttl;
        this.timeout = timeout;
        this.noHttpCache = noHttpCache;

        this.storageKey = `fetcher__${url}`;
    }

    /**
     * @returns {Promise}
     */
    get(passCache = false) {
        return storage.get(this.storageKey).then(stored => {
            if (stored && !passCache) {
                return stored;
            }
            const getter = new Promise(resolve => {
                $.ajax({
                    url: this.url,
                    data: this.noHttpCache && `rnd=${Math.random() * 1000}`,
                    success: (data) => {
                        storage.set(this.storageKey, data, this.ttl)
                            .then(() => resolve(data));
                    },
                    fail: () => resolve(null)
                });
            });

            return ((this.timeout !== undefined)
                ? Promise.race([utils.wait(this.timeout), getter])
                : getter
            );
        });
    }
}

export default Fetcher;
