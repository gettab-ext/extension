import utils from '../utils/utils';

const REQUIRED_PERMISSIONS = {
    permissions: [ 'tabs' ],
    origins: [ 'chrome://favicon/' ]
};

const tabs = {

    REQUIRED_PERMISSIONS: REQUIRED_PERMISSIONS,

    create: function(properties, callback = utils.noop) {
        chrome.tabs.create(properties, function(tab) {
            callback(false, tab);
        });
    },

    query: function(query, callback = utils.noop) {
        chrome.tabs.query(query, function(tabs) {
            callback(false, tabs);
        });
    },

    remove: function(id, callback = utils.noop) {
        chrome.tabs.remove(id, function() {
            callback(false);
        });
    },

    update: function(id, properties, callback = utils.noop) {
        chrome.tabs.update(id, properties, function(tab) {
            callback(false, tab);
        });
    },

    onUpdate: utils.noop()

};

export default tabs;

