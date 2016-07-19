const noop = () => {};

const runtime = {
    getNewtabInfo(callback = noop) {
        callback({
            url: chrome.extension.getURL('index.html'),
            opted_in: true
        });
    }
};

export default runtime;
