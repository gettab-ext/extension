import storage from './storage';
import utils from './utils';

class Fetcher {
    constructor({url, ttl, timeout, nocache}) {
        this.url = url;
        this.ttl = ttl;
        this.timeout = timeout;
        this.storageKey = `fetcher__${url}`;
        this.nocache = nocache;
    }

    /**
     * @returns {Promise}
     */
    get() {
        return storage.get(this.storageKey).then(stored => {
            if (stored) {
                return stored;
            }
            const getter = new Promise(resolve => {
                $.ajax({
                    url: this.url,
                    data: this.nocache && `rnd=${Math.random() * 1000}`,
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