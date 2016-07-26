import runtime from '../utils/runtime';

const REQUIRED_PERMISSIONS = {
    permissions: [ 'tabs' ],
    origins: [ 'chrome://favicon/' ]
};
const noop = () => {};

const tabs = {

    REQUIRED_PERMISSIONS: REQUIRED_PERMISSIONS,

    create(properties, callback = noop) {
        chrome.tabs.create(properties, function(tab) {
            callback(false, tab);
        });
    },

    createNewTab() {
        const launch = function(behavior, url) {
            tabs.create({
                active: true,
                url: url
            });
        };
        runtime.getNewtabInfo(function(newtab) {
            launch('newtab', newtab.url);
        });
    },

    query(query, callback = noop) {
        chrome.tabs.query(query, function(tabs) {
            callback(false, tabs);
        });
    },

    remove(id, callback = noop) {
        chrome.tabs.remove(id, function() {
            callback(false);
        });
    },

    update(id, properties, callback = noop) {
        chrome.tabs.update(id, properties, function(tab) {
            callback(false, tab);
        });
    },

    onUpdate: noop

};

export default tabs;

