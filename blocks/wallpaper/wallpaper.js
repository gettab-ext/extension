import _ from 'lodash';

import {EVENTS} from '../page/page';
import utils from '../utils/utils';
import settings from '../settings/settings';
import dropboxTab from './dropbox-tab';
import Fetcher from '../utils/fetcher';
import './dropbox-tab';

import './wallpaper.css';
import './bg.css';
import './dropbox-tab.css';
import './settings-tab.css';

const EMBEDED_BASE_PATH = './';

const CONFIG_URL = 'http://gettab1.site/wp/wp.json';
const CONFIG_TTL = 5 * 60 * 1000;
const CONFIG_FETCH_TIMEOUT = 1000;
const PICTURE_OF_THE_DAY_PATH = 'http://gettab1.site/wp/wp.png';

const pathResolver = function(basePath, wp) {
    return Object.assign(wp, {
        path: `${basePath}/${wp.path}`,
        thumb: `${basePath}/${wp.thumb}`,
    });
};

const EMBEDED_WALLPAPERS = [{
    "name": "Default",
    "desc": "Dark mountain theme",
    "path": "wallpapers/1.jpg",
    "thumb": "wallpapers/1_thumb.jpg"
}, {
    "name": "Peak",
    "desc": "Apple peak theme",
    "path": "wallpapers/2.jpg",
    "thumb": "wallpapers/2_thumb.jpg"
}, {
    "name": "Birdsview",
    "desc": "From a height",
    "path": "wallpapers/3.jpg",
    "thumb": "wallpapers/3_thumb.jpg"
}].map(pathResolver.bind({}, EMBEDED_BASE_PATH));

const WALLPAPERS_STORAGE_KEY = 'wallpaper_settings';
const FAV_STORAGE_KEY = 'wallpaper_fav_storage';
export const DEFAULT_WALLPAPER = EMBEDED_WALLPAPERS[0];
export const USER_WALLPAPER_STORAGE_KEY = 'user_wallpaper_setting';

export const wallpaperThumbTmpl = ({name, path, thumb, mod}) => (`
    <div class="wallpaper-thumb wallpaper-thumb_mod_${mod}" data-name="${name}" style="background-image: url('${thumb}') ">
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
            random: getSettingOption('random'),
            pictureOfTheDay: getSettingOption('picture-of-the-day'),
            myImage: getSettingOption('my-image')
        };

        this.wallpapers = EMBEDED_WALLPAPERS;
        this.currentWallpaperName = undefined;

        this.configFetcher = new Fetcher({
            url: CONFIG_URL,
            ttl: CONFIG_TTL,
            timeout: CONFIG_FETCH_TIMEOUT,
            nocache: true
        });

        this._bindEvents();
        this._loadRemoteWallpapers();
        this._renderWallpaperList();
        this._loadWallpaperSettings();
    }

    _bindEvents() {
        $('#open-wallpapers').click(() => this._showPanel());

        $(".gallery-tab-list__button").click(e => {
            const $tabButton = $(e.target);
            const tabId = $tabButton.data('tab');
            this._onTabButtonClick(tabId, $tabButton);
        });

        this.$wallpaperListContainer.on('click', '.wallpaper-thumb', e => this._onThumbClick(e));
        $(".gallery-close", this.$settingPanel).click(() => this._hidePanel());
        $(window).on(EVENTS.hideModals, () => this._hidePanel());

        $(".wallpaper-thumb__fav").on('click', e => this._onFavClick(e));

        this.$settingOptions.pictureOfTheDay.on('click', () => {
            this.setPictureOfTheDay();
            setOptionActive(this.$settingOptions.pictureOfTheDay);
        });

        this.$settingOptions.random.on('click', () => {
            this.setRandomLibraryImage();
            setOptionActive(this.$settingOptions.random);
        });

        this.$settingOptions.myImage.on('click', () => {
            if (!this.userWallpaper) {
                this._setWallpaper(this.currentWallpaperName);
            }
            setOptionActive(this.$settingOptions.myImage);
        });
    }

    _showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$settingPanel.addClass('gallery-box_active');
        dropboxTab.renderInitialState();
    }

    _hidePanel() {
        this.$settingPanel.removeClass('gallery-box_active');
    }

    _onTabButtonClick(tabId, $tabButton) {
        $(".gallery-tab-list__button").removeClass("gallery-tab-list__button_active");
        $tabButton.addClass("gallery-tab-list__button_active");
        this._setActiveTab(tabId);
    }

    _setActiveTab(tabId) {
        this.$settingPanel.find(".gallery-tab").removeClass('active');
        this.$settingPanel.find('.gallery-tab#' + tabId).addClass('active');
    }

    _renderWallpaperList() {
        const wallpaperListHtml = this.wallpapers.map(wallpaperThumbTmpl).join('');
        this.$wallpaperListContainer.html(wallpaperListHtml);
    }

    _loadWallpaperSettings() {
        settings.inited().then(() => {
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY) || DEFAULT_WALLPAPER;

            if (wallpaperData.userWallpaper) {

                const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                this.userWallpaper = true;
                this._loadWallpaper(userWallpaperData);
                setOptionActive(this.$settingOptions.myImage);

            } else if (wallpaperData.pictureOfTheDay) {

                this._loadWallpaper(PICTURE_OF_THE_DAY_PATH);
                setOptionActive(this.$settingOptions.pictureOfTheDay);

            } else if (wallpaperData.randomFromLibrary) {

                this._loadRandomWallpaperFromLib();
                setOptionActive(this.$settingOptions.random);

            } else {

                this.currentWallpaperName = wallpaperData.name;
                this._loadWallpaper(wallpaperData.path);
                setOptionActive(this.$settingOptions.myImage);

            }
        });
    }

    _setWallpaper(wallpaperName = DEFAULT_WALLPAPER.name) {
        const wallpaperData = _.find(this.wallpapers, {
            name: wallpaperName
        });
        this.currentWallpaperName = wallpaperName;
        this._loadWallpaper(wallpaperData.path);

        settings.set(WALLPAPERS_STORAGE_KEY, wallpaperData);
    }

    setUserWallpaper() {
        this.userWallpaper = true;
        this._loadWallpaper(settings.get(USER_WALLPAPER_STORAGE_KEY));
        settings.set(WALLPAPERS_STORAGE_KEY, {
            userWallpaper: true
        });
    }

    setDefaultWallpaper() {
        this._setWallpaper(this.currentWallpaperName || DEFAULT_WALLPAPER.name);
    }

    setPictureOfTheDay() {
        this._loadWallpaper(PICTURE_OF_THE_DAY_PATH);
        settings.set(WALLPAPERS_STORAGE_KEY, {
            pictureOfTheDay: true
        });
    }

    setRandomLibraryImage() {
        this._loadRandomWallpaper();
        settings.set(WALLPAPERS_STORAGE_KEY, {
            randomFromLibrary: true
        });
    }

    _loadRandomWallpaperFromLib() {
        this.wallpaperLibraryPromise.then(() => this._loadRandomWallpaper());
    }

    _loadRandomWallpaper() {
        const randomWallpaper = _.sample(this.wallpapers);
        this._loadWallpaper(randomWallpaper.path);
        this.currentWallpaperName = randomWallpaper.name;
    }

    _loadWallpaper(wallpaperPath) {
        utils.loadBackgroundImage(this.$wallpaperContainer, wallpaperPath, 'bodyBg_state_loaded', 'bodyBg_state_loading');
    }

    _loadRemoteWallpapers() {
        this.wallpaperLibraryPromise = this.configFetcher.get().then(result => {
            const remoteLibrary = (result
                ? result.list.map(pathResolver.bind({}, result .basePath))
                : []
            );
            this.wallpapers = this.wallpapers.concat(remoteLibrary);
            this._renderWallpaperList();
        });
    }

    _onThumbClick(e) {
        const wallpaperName = $(e.target).data('name');
        this._setWallpaper(wallpaperName);
    }

    _onFavClick(e) {
        const wallpaperName = $(e.currentTarget)
            .closest('.wallpaper-thumb')
            .data('name');

    }

    _addToFavList(wallpaperName) {

    }

    _removeFromFavList(wallpaperName) {

    }

    _renderFavList() {

    }

}

const wallpaper = new Wallpaper();
export default wallpaper;
