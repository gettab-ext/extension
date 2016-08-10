import storage from './storage';
import toDataUrl from './to-data-url';

window.loaded = window.loaded || new Map();

const loadBackgroundImage = function ({elem, url, loadedClass, preloadClass, errorClass, cacheTTL, key}) {
    const storageKey = key || `image_cache_${url}`;
    const imageId = `id_${url}`;

    if (loaded.get(elem) === imageId) {
        return Promise.resolve();
    }

    const preRender = () => {
        preloadClass && elem.classList.add(preloadClass);
    };
    const render = (url) => {
        elem.style.backgroundImage = `url('${url}')`;
        preloadClass && elem.classList.remove(preloadClass);
        loadedClass && elem.classList.add(loadedClass)

        loaded.set(elem, imageId);
    };
    const cacheImageData = () => {
        return toDataUrl(url).then(imageData => {
            return storage.set(storageKey, {
                imageData,
                imageId
            }, cacheTTL);
        }).catch(e => {
            console.warn(e);
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
                if (storedValue && storedValue.imageId === imageId && storedValue.imageData) {
                    render(storedValue.imageData);
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
