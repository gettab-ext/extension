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
    }

};

export default utils;