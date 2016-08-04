const MESSAGE_TARGET = 'data-transport';

const transportClient = {
    requestData(key) {
        return new Promise(resolve => {
            chrome.runtime.sendMessage({
                target: MESSAGE_TARGET,
                action: 'get',
                key: key
            }, response => {
                if (chrome.runtime.lastError) {
                    // An error occurred :(
                    console.log("ERROR: ", chrome.runtime.lastError);
                }
                resolve(response);
            });
        });
    }
};

export default transportClient;
