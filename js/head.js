import wallpaperLoader from '../blocks/wallpaper/wallpaper.head';

const documentReady = new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', () => resolve());
});

Promise.all([documentReady, wallpaperLoader.ready]).then(() => {
    console.timeStamp('deffered load');
    Array.from(document.querySelectorAll("script.deferred")).forEach(elem => {
        elem.src = elem.getAttribute('data-src');
    });
});
