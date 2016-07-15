import tabs from './tabs';

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
    }

};

export default utils;
