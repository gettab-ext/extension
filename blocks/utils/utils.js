import tabs from './tabs';
import windows from './windows';
import storage from './storage';

const POSITION_STORAGE_TIME = 15 * 60 * 1000;
const POSITION_STORAGE_KEY = 'position-data';

const utils = {

    cloneAsObject(obj) {
        if (obj === null || !(obj instanceof Object)) {
            return obj;
        }
        var temp = (obj instanceof Array) ? [] : {};
        // ReSharper disable once MissingHasOwnPropertyInForeach
        for (var key in obj) {
            temp[key] = utils.cloneAsObject(obj[key]);
        }
        return temp;
    },

    noop: function() {},

    openUrl: function(url) {
        tabs.query({ active: true, lastFocusedWindow: true }, function(err, tabsData) {
            if (!err && tabsData.length) {
                tabs.update(tabsData[0].id, { active: true, url: url });
            }
            else {
                tabs.create({ active: true, url: url });
            }
        });
    },

    openLinkFromEvent: function(e, url) {
        url = url || e.delegateTarget.href;

        // Middle-click + Shift = new tab w/ focus
        if (e.which === 2 && e.shiftKey)
            tabs.create({ active: true, url: url });

        // Middle-click = new tab w/o focus
        else if(e.which === 2)
            tabs.create({ active: false, url: url });

        // Left-click + Shift + Ctrl = new tab w/ focus
        else if(e.which === 1 && e.shiftKey && e.ctrlKey)
            tabs.create({ active: true, url: url });

        // Left-click + Shift = new window w/ focus
        else if(e.which === 1 && e.shiftKey)
            windows.create({ focused: true, url: url });

        // Left-click + Ctrl = new tab w/o focus
        else if(e.which === 1 && e.ctrlKey)
            tabs.create({ active: false, url: url });

        // Left-click = same tab
        else if(e.which === 1)
            utils.openUrl(url);
    },

    uuid: function () {
        var i, random;
        var uuid = '';

        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }

        return uuid;
    },

    wait(timeout) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, timeout)
        })
    },

    bindMethodMap(context, obj) {
        return Object.keys(obj).reduce((methodMap, key) => {
            methodMap[key] = obj[key].bind(context);
            return methodMap;
        }, {});
    },

    getGeolocation() {
        return new Promise(resolve => {
            var geoSuccess = (position) => {
                const coords = utils.cloneAsObject(position.coords);
                storage.set(POSITION_STORAGE_KEY, coords, POSITION_STORAGE_TIME)
                    .then(() => resolve(coords));
            };
            navigator.geolocation.getCurrentPosition(geoSuccess);
        });
    }


};

export default utils;
