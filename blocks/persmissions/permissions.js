/* global chrome */

const REQUIRED_PERMISSIONS = {
    permissions: ['bookmarks', 'management', 'tabs', 'topSites'],
    origins: ['chrome://favicon/']
};

const noop = () => {};

class Permissions {
    constructor() {

    }

    hasAll(callback = noop) {
        chrome.permissions.contains(REQUIRED_PERMISSIONS, result => {
            callback(result);
        });
    }

    request(callback = noop, noReload) {
        this.hasAll(function(error, result) {
            if (error || result) {
                callback(error, result);
                return;
            }

            chrome.permissions.request(REQUIRED_PERMISSIONS, granted => {
                if (noReload) {
                    callback(false, granted);
                }

                if (granted) {
                    chrome.runtime.reload();
                }
            });
        });
    }

}

const permissions = new Permissions();
export default permissions;