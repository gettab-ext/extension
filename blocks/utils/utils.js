import tabs from './tabs';
import windows from './windows';

const utils = {

    loadBackgroundImage($elem, url, loadedClass, preloadClass) {
        return new Promise(resolve => {

            preloadClass && $elem.addClass(preloadClass);

            const img = new Image();

            img.onload = () => {
                $elem.css({
                    'background-image': `url('${url}')`
                });

                preloadClass && $elem.removeClass(preloadClass);
                loadedClass && $elem.addClass(loadedClass);

                resolve();
            };

            img.src = url;
        });
    },

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
    }

};

export default utils;
