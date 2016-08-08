import {
    WALLPAPERS_STORAGE_KEY
} from '../config/const';

import {
    WP_CACHE_TTL,
    WP_OF_THE_DAY_URL,
} from '../config/config';

import {
    USER_WALLPAPER_STORAGE_KEY
} from '../config/const';

import settings from '../settings/settings';
import loadBackgroundImage from '../utils/load-background-image';

class FastWallpaperLoader {
    constructor() {
        this.ready = settings.inited().then(() => {
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY);
            if (!wallpaperData) {
                return;
            }
            if (wallpaperData.pictureOfTheDay) {
                return this._render(WP_OF_THE_DAY_URL, true);
            } else if (wallpaperData.randomFromLibrary) {
                // pass, have to wait for remote data
            } else {
                if (wallpaperData.userWallpaper) {
                    const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                    return this._render(userWallpaperData, false);
                } else {
                    return this._render(wallpaperData.path, true);
                }
            }
        })
    }

    _render(path, useCache) {
        const bgElem = document.querySelector(".bodyBg");
        return loadBackgroundImage({
            elem: bgElem,
            url: path,
            cacheTTL: useCache && WP_CACHE_TTL,
            loadedClass: 'bodyBg_state_loaded'
        });
    }
}

const wallpaperLoader = new FastWallpaperLoader();
export default wallpaperLoader;
