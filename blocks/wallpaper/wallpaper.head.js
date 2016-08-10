import {WALLPAPERS_STORAGE_KEY, NEXT_WP_STORAGE_KEY} from '../config/const';
import {WP_CACHE_TTL, WP_OF_THE_DAY_URL} from '../config/config';
import {DEFAULT_WALLPAPER} from './wallpaper.data';
import {USER_WALLPAPER_STORAGE_KEY, WP_CACHE_STORAGE_KEY, RANDOM_WP_RENDERED} from '../config/const';

import settings from '../settings/settings';
import storage from '../utils/storage';
import loadBackgroundImage from '../utils/load-background-image';

const wait = (timeout) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.timeStamp('waited');
            resolve();
        }, timeout)
    })
};

class FastWallpaperLoader {
    constructor() {
        this.ready = Promise.race([wait(500), settings.inited().then(() => {
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY) || DEFAULT_WALLPAPER;

            if (wallpaperData.pictureOfTheDay) {
                return this._render(WP_OF_THE_DAY_URL, true);
            } else if (wallpaperData.randomFromLibrary) {
                return storage.get(NEXT_WP_STORAGE_KEY).then(nextWallpaperData => {
                    if (nextWallpaperData) {
                        window[RANDOM_WP_RENDERED] = nextWallpaperData;
                        return this._render(nextWallpaperData.dataUrl, false);
                    }
                });
            } else {
                if (wallpaperData.userWallpaper) {
                    const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                    return this._render(userWallpaperData, false);
                } else {
                    return this._render(wallpaperData.path, true);
                }
            }
        })]);
    }

    _render(path, useCache) {
        const bgElem = document.querySelector(".bodyBg");
        return loadBackgroundImage({
            elem: bgElem,
            url: path,
            cacheTTL: useCache && WP_CACHE_TTL,
            loadedClass: 'bodyBg_state_loaded',
            errorClass: 'bodyBg_state_error',
            key: WP_CACHE_STORAGE_KEY
        });
    }
}

const wallpaperLoader = new FastWallpaperLoader();
export default wallpaperLoader;
