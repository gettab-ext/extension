const headReady = new Promise(resolve => {
    window.markHeadReady = () => resolve();
});

headReady.then(() => {
    Array.from(document.querySelectorAll("script.deferred")).forEach(elem => {
        elem.src = elem.getAttribute('data-src');
    });
});

import '../blocks/wallpaper/wallpaper.head';
