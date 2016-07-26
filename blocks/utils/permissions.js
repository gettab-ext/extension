/* global chrome */
import utils from '../utils/utils';
import tabs from './tabs';

const REQUIRED_PERMISSIONS = {
    permissions: ['bookmarks', 'management', 'tabs', 'topSites'],
    origins: ['chrome://favicon/']
};

class Permissions {
    constructor() {
    }

    _hasAll(callback = utils.noop) {
        chrome.permissions.contains(REQUIRED_PERMISSIONS, result => {
            callback(result);
        });
    }

    request(callback = utils.noop, noReload) {
        this._hasAll(function(error, result) {
            if (error || result) {
                callback(error, result);
                return;
            }

            chrome.permissions.request(REQUIRED_PERMISSIONS, granted => {
                if (noReload) {
                    callback(false, granted);
                }

                if (granted) {
                    tabs.createNewTab();
                    window.close();
                }
            });
        });
    }

}

const permissions = new Permissions();
export default permissions;
