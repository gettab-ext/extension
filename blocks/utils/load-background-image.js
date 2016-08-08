import storage from './storage';
import toDataUrl from './to-data-url';

window.loaded = window.loaded || new Map();

const loadBackgroundImage = function ({elem, url, loadedClass, preloadClass, errorClass, cacheTTL}) {
    const storageKey = `image_cache_${url}`;

    if (loaded.get(elem) === storageKey) {
        return Promise.resolve();
    }

    const preRender = () => {
        preloadClass && elem.classList.add(preloadClass);
    };
    const render = (url) => {
        requestAnimationFrame(() => {
            elem.style.backgroundImage = `url('${url}')`;
            preloadClass && elem.classList.remove(preloadClass);
            loadedClass && elem.classList.add(loadedClass)
        });

        loaded.set(elem, storageKey);
    };
    const cacheImageData = () => {
        return toDataUrl(url).then(imageData => {
            return storage.set(storageKey, imageData, cacheTTL);
        });
    };
    const loadRemote = (url, callback) => {
        const img = new Image();

        img.onload = () => {
            render(url);
            if (cacheTTL) {
                cacheImageData().then(() => callback());
            } else {
                callback();
            }
        };

        img.onerror = () => {
            preloadClass && elem.classList.remove(preloadClass);
            errorClass && elem.classList.add(errorClass);
            callback();
        };

        img.src = url;
    };

    preRender();

    return new Promise(resolve => {
        if (cacheTTL) {
            storage.get(storageKey).then(storedValue => {
                if (storedValue) {
                    render(storedValue);
                    resolve();
                } else {
                    loadRemote(url, resolve);
                }
            });
        } else {
            loadRemote(url, resolve);
        }
    });
};

export default loadBackgroundImage;
