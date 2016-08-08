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
        console.timeStamp('start');
        settings.inited().then(() => {
            console.timeStamp('settings inited');
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY);
            const bgElem = document.querySelector(".bodyBg");
            if (wallpaperData.pictureOfTheDay) {
                return loadBackgroundImage({
                    elem: bgElem,
                    url: WP_OF_THE_DAY_URL,
                    cacheTTL: WP_CACHE_TTL,
                    preloadClass: 'bodyBg_state_loading',
                    loadedClass: 'bodyBg_state_loaded'
                });
            } else if (wallpaperData.randomFromLibrary) {
                // pass, have to wait for remote data
            } else {
                if (wallpaperData.userWallpaper) {
                    const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                    return loadBackgroundImage({
                        elem: bgElem,
                        url: userWallpaperData,
                        loadedClass: 'bodyBg_state_loaded'
                    });
                } else {
                    return loadBackgroundImage({
                        elem: bgElem,
                        url: wallpaperData.path,
                        cacheTTL: WP_CACHE_TTL,
                        loadedClass: 'bodyBg_state_loaded'
                    });
                }
            }
        })
        .then(() => {
            window.markHeadReady();
        });
    }
}

const wallpaperLoader = new FastWallpaperLoader();
export default wallpaperLoader;
