import wallpaperLoader from '../blocks/wallpaper/wallpaper.head';

const documentReady = new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', () => resolve());
});

Promise.all([documentReady, wallpaperLoader.ready]).then(() => {
    Array.from(document.querySelectorAll("script.deferred")).forEach(elem => {
        elem.src = elem.getAttribute('data-src');
    });
});
