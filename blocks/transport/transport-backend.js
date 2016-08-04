const MESSAGE_TARGET = 'data-transport';

class Transport {
    constructor() {
        this.sources = {};
    }

    init() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            const key = message.key;
            if (message.target !== MESSAGE_TARGET || message.action !== 'get' || !this.sources[key]) {
                return;
            }
            const dataGetter = this.sources[key]();
            dataGetter.then(data => sendResponse(data));
            return true;
        });
    }

    exposeDataSource(key, getter) {
        this.sources[key] = getter;
    }
}

const transport = new Transport();
transport.init();

export default transport;
