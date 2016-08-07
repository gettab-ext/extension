import _ from 'lodash';
import Ps from 'perfect-scrollbar';
import '../utils/perfect-scrollbar.css';
import 'jquery-lazyload';

import utils from '../utils/utils';
import settings from '../settings/settings';
import page, {EVENTS} from '../page/page';
import dropboxTab from './dropbox-tab';
import Fetcher from '../utils/fetcher';

import {
    WP_STATIC_HOST,
    SITE_URL,
    WP_CACHE_TTL,
    WP_CONFIG_TTL,
    WP_CONFIG_URL,
    WP_CONFIG_FETCH_TIMEOUT,
    WP_OF_THE_DAY_URL,
    WP_OF_THE_DAY_INFO,
    WP_OF_THE_DAY_INFO_TTL
} from '../config/config';

import './dropbox-tab';
import './wallpaper.css';
import './bg.css';
import './dropbox-tab.css';
import './settings-tab.css';
import './wallpaper-info.css';

const EMBEDED_BASE_PATH = './wallpapers/';

const pathResolver = function(basePath, wp) {
    return Object.assign(wp, {
        path: `${basePath}/${wp.id}.png`,
        thumb: `${basePath}/${wp.id}_thumb.png`,
    });
};

const MODES = {
    currentPicture: 'current-picture',
    pictureOfTheDay: 'picture-of-the-day',
    randomPicture: 'random-picture'
};

const EMBEDDED_WALLPAPERS = [{
    "id": 1,
    "name": "Default",
    "desc": "Dark mountain theme",
    "embedded": true
}, {
    "id": 2,
    "name": "Peak",
    "desc": "Apple peak theme",
    "embedded": true
}, {
    "id": 3,
    "name": "Bird's-eye view",
    "desc": "From a height",
    "embedded": true
}].map(pathResolver.bind({}, EMBEDED_BASE_PATH));

const WALLPAPERS_STORAGE_KEY = 'wallpaper_settings';
export const DEFAULT_WALLPAPER = EMBEDDED_WALLPAPERS[0];
export const USER_WALLPAPER_STORAGE_KEY = 'user_wallpaper_setting';
const WP_CACHE_STORAGE_KEY = 'wallpaper_cache';

export const wallpaperThumbTmpl = ({name, path, thumb, mod}) => (`
    <div class="wallpaper-thumb wallpaper-thumb_mod_${mod}" data-name="${name}" data-original='${thumb}'">
        <!--<div class="wallpaper-thumb__fav">-->
            <!--<div class="icon icon-add-favorites"></div>-->
        <!--</div>-->
    </div>
`);

const getSettingOption = (option) => {
    return $(`.wp-settings__item[data-item='${option}']`);
};
const setOptionActive = ($option) => {
    $(`.wp-settings__item`).removeClass('wp-settings__item_active');
    $option.addClass('wp-settings__item_active');
};

class Wallpaper {

    constructor() {
        this.$wallpaperContainer = $(".bodyBg");
        this.$wallpaperListContainer = $("#scroller_base");
        this.$settingPanel = $('.gallery-box');

        this.$settingOptions = {
            random: getSettingOption(MODES.randomPicture),
            pictureOfTheDay: getSettingOption(MODES.pictureOfTheDay),
            currentImage: getSettingOption(MODES.currentPicture)
        };

        this.$wallpaperName = $('.wallpaper-name');
        this.$descPopup = $('.wallpaper-desc-popup');

        this.wallpapers = EMBEDDED_WALLPAPERS;
        this.currentWallpaper = null;
        this.renderedWallpaperPath = null;

        this._initFetchers();
        this._initLoaders();
        this._initSetters();

        this._bindEvents();
        this._loadRemoteWallpapers();
        this._renderWallpaperList();
        this._loadWallpaperSettings();
    }

    _initFetchers() {
        this.configFetcher = new Fetcher({
            url: WP_CONFIG_URL,
            ttl: WP_CONFIG_TTL,
            timeout: WP_CONFIG_FETCH_TIMEOUT,
            noHttpCache: true
        });
        this.wpOfTheDayInfoFetcher = new Fetcher({
            url: WP_OF_THE_DAY_INFO,
            ttl: WP_OF_THE_DAY_INFO_TTL,
            timeout: WP_CONFIG_FETCH_TIMEOUT,
            noHttpCache: true
        });
    }

    _initSetters() {
        this.setters = utils.bindMethodMap(this, {
            [MODES.currentPicture](wallpaperData) {
                if (!wallpaperData) {
                    wallpaperData = DEFAULT_WALLPAPER;
                }

                if (wallpaperData.userWallpaper) {
                    settings.set(WALLPAPERS_STORAGE_KEY, {
                        userWallpaper: true
                    });
                } else {
                    settings.set(WALLPAPERS_STORAGE_KEY, wallpaperData);
                }
                this.loaders[MODES.currentPicture](wallpaperData);
            },
            [MODES.pictureOfTheDay]() {
                settings.set(WALLPAPERS_STORAGE_KEY, {
                    pictureOfTheDay: true
                });
                this.loaders[MODES.pictureOfTheDay]();
            },
            [MODES.randomPicture]() {
                settings.set(WALLPAPERS_STORAGE_KEY, {
                    randomFromLibrary: true
                });
                this.loaders[MODES.randomPicture]();
            }
        });
    }

    _initLoaders() {
        this.loaders = utils.bindMethodMap(this, {
            [MODES.currentPicture](wallpaperData) {
                if (wallpaperData.userWallpaper) {
                    const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                    this._renderWallpaper({path: userWallpaperData, userWallpaper: true});
                } else {
                    this.currentWallpaper = wallpaperData;
                    this._renderWallpaper(wallpaperData);
                }
                setOptionActive(this.$settingOptions.currentImage);
            },
            [MODES.pictureOfTheDay]() {
                this._renderWallpaper({path: WP_OF_THE_DAY_URL});
                this.wpOfTheDayInfoFetcher.get().then(info => {
                    this._renderWallpaper(Object.assign(info, {path: WP_OF_THE_DAY_URL}));
                });
                setOptionActive(this.$settingOptions.pictureOfTheDay);
            },
            [MODES.randomPicture]() {
                this._loadRandomWallpaper();
                setOptionActive(this.$settingOptions.random);
            }
        });
    }

    _bindEvents() {
        this._bindPanelControls();

        $(".gallery-tab-list__button").click(e => {
            const $tabButton = $(e.target);
            const tabId = $tabButton.data('tab');
            this._onTabButtonClick(tabId, $tabButton);
        });

        this.$wallpaperListContainer.on('click', '.wallpaper-thumb', e => this._onThumbClick(e));
        this._bindSettingsOptions();
    }

    _bindPanelControls() {
        const showPanel = () => {
            $(window).trigger(EVENTS.modalShow);
            this.$settingPanel.addClass('gallery-box_active');
            dropboxTab.renderInitialState();
        };
        const hidePanel = () => {
            this.$settingPanel.removeClass('gallery-box_active');
        };
        const showDescPopup = () => {
            $(window).trigger(EVENTS.modalShow);
            page.toggleContentHidden(true);
            this.$descPopup.addClass('wallpaper-desc-popup_visible');
        };
        const hideDescPopup = () => {
            page.toggleContentHidden(false);
            this.$descPopup.removeClass('wallpaper-desc-popup_visible');
        };

        $(window).on(EVENTS.hideModals, () => hideDescPopup());
        page.bindPopupHide('.gallery-box, #open-wallpapers', () => hidePanel());

        $('#open-wallpapers').click(() => showPanel());
        $(".gallery-close", this.$settingPanel).click(() => hidePanel());
        this.$wallpaperName.on('click', () => showDescPopup());
    }

    _bindSettingsOptions() {
        this.$settingOptions.pictureOfTheDay.on('click', () => this.setters[MODES.pictureOfTheDay]());
        this.$settingOptions.random.on('click', () => this.setters[MODES.randomPicture]());
        this.$settingOptions.currentImage.on('click', () => this.setters[MODES.currentPicture]());
    }

    _onTabButtonClick(tabId, $tabButton) {
        $(".gallery-tab-list__button").removeClass("gallery-tab-list__button_active");
        $tabButton.addClass("gallery-tab-list__button_active");
        this.$settingPanel.find(".gallery-tab").removeClass('active');
        this.$settingPanel.find('.gallery-tab#' + tabId).addClass('active');
    }

    _loadWallpaperSettings() {
        settings.inited().then(() => {
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY) || DEFAULT_WALLPAPER;

            if (wallpaperData.pictureOfTheDay) {
                this.loaders[MODES.pictureOfTheDay]();
            } else if (wallpaperData.randomFromLibrary) {
                this.loaders[MODES.randomPicture]();
            } else {
                this.loaders[MODES.currentPicture](wallpaperData);
            }
        });
    }

    _loadRandomWallpaper() {
        this.libraryReady.then(() => {
            const randomWallpaper = _.sample(this.wallpapers);
            this._renderWallpaper(randomWallpaper);
            this.currentWallpaper = randomWallpaper;
        });

    }

    _renderWallpaper({path, name, desc, embedded, userWallpaper} = {}) {
        if (path && this.renderedWallpaperPath !== path) {
            utils.loadBackgroundImage({
                $elem: this.$wallpaperContainer,
                url: path,
                preloadClass: 'bodyBg_state_loading',
                loadedClass: 'bodyBg_state_loaded',
                cacheTTL: (userWallpaper ? null : WP_CACHE_TTL)
            });
            this.renderedWallpaperPath = path;
        }

        if (name && desc) {
            this.$wallpaperName.addClass('wallpaper-name_visible');
            this.$wallpaperName.text(name);
            this.$descPopup.find(".wallpaper-desc-popup__name").text(name);
            this.$descPopup.find(".wallpaper-desc-popup__desc").text(desc);

            const getEmbeddedSharePath = p => p.match(new RegExp(`/${LOCAL_WP_DIR}/(.+)`))[1];
            const sharePath = (embedded
                ? `${WP_STATIC_HOST}wp/${getEmbeddedSharePath(path)}`
                : path
            );
            this._initShare({sharePath, name, desc});
        } else {
            this.$wallpaperName.removeClass('wallpaper-name_visible');
        }

    }

    _renderWallpaperList() {
        const wallpaperListHtml = this.wallpapers.map(wallpaperThumbTmpl).join('');
        this.$wallpaperListContainer.html(wallpaperListHtml);
        Ps.initialize(this.$wallpaperListContainer.get(0));
        $(".wallpaper-thumb").lazyload({
            container: this.$wallpaperListContainer
        });
    }

    _loadRemoteWallpapers() {
        this.libraryReady = this.configFetcher.get().then(result => {
            const remoteLibrary = (result
                ? result.map(pathResolver.bind({}, WP_STATIC_HOST))
                : []
            );
            this.wallpapers = this.wallpapers.concat(remoteLibrary);
            this._renderWallpaperList();
        });
    }

    _onThumbClick(e) {
        const wallpaperName = $(e.target).data('name');
        const wallpaperData = this._getWpData(wallpaperName);
        this.setters[MODES.currentPicture](wallpaperData);
    }

    _initShare({path, name, desc}) {
        if (this.share) {
            this.share.destroy();
        }

        this.share = Ya.share2('wallpaper-share', {
            content: {
                url: `${SITE_URL}?wp=${encodeURIComponent(path)}&desc=${encodeURIComponent(desc)}`,
                title: 'GetTab Extension',
                description: `${name}`,
                image: path
            },
            theme: {
                bare: true,
                lang: 'en',
                services: 'facebook,twitter'
            }
        });
    }

    _getWpData(wallpaperName) {
        return _.find(this.wallpapers, {
            name: wallpaperName
        });
    }

    resetWallpaper() {
        const wp = this.currentWallpaper;
        this.setters[MODES.currentPicture](wp);
    }

    setUserWallpaper() {
        this.setters[MODES.currentPicture]({
            userWallpaper: true
        });
    }

}

const wallpaper = new Wallpaper();
export default wallpaper;
