/* global chrome */
const noop = () => {};

var windows = {

    create: function(createData, callback = noop) {
        chrome.windows.create(createData, function(wd) {
            callback(false, wd);
        });
    },

    remove: function(windowId, callback = noop) {
        chrome.windows.remove(windowId, function(wd) {
            callback(false, windowId);
        });
    },

    update: function(windowId, updateInfo, callback = noop) {
        try {
            chrome.windows.update(windowId, updateInfo, function(wd) {
                callback(false, wd);
            });
        } catch (e) {
            console.log(e);
            callback(true, null);
        }
    }

};

export default windows;
