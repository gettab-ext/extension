import _ from 'lodash';

import {EVENTS} from '../page/page';
import utils from '../utils/utils';
import settings from '../settings/settings';

import './wallpaper.css';
import './bg.css';
import './dropbox.css';
import './dropbox';

const EMBEDED_BASE_PATH = './';
const CONFIG_URL = 'http://gettab1.site/wp/wp.json';

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
const DEFAULT_WALLPAPER = EMBEDED_WALLPAPERS[0];
export const USER_WALLPAPER_STORAGE_KEY = 'user_wallpaper_setting';

export const wallpaperThumbTmpl = ({name, path, thumb}) => (`
    <div class="wallpaper-thumb" data-name="${name}" style="background-image: url('${thumb}') ">
        <!--<div class="wallpaper-thumb__fav">-->
            <!--<div class="icon icon-add-favorites"></div>-->
        <!--</div>-->
    </div>
`);

class Wallpaper {

    constructor() {
        this.$wallpaperContainer = $(".bodyBg");
        this.$wallpaperListContainer = $("#scroller_base");
        this.$settingPanel = $('.gallery-box');

        this.wallpapers = EMBEDED_WALLPAPERS;

        this._bindEvents();
        this._renderWallpaperList();
        this._loadWallpaperSettings();
        this._loadRemoteWallpapers();
    }

    _bindEvents() {
        $('.gallerySw').click(() => this._showPanel());

        $(".gallery-tab-list__button").click(e => {
            const $tabButton = $(e.target);
            const tabId = $tabButton.data('tab');
            this._onTabButtonClick(tabId, $tabButton);
        });

        this.$wallpaperListContainer.on('click', '.wallpaper-thumb', e => this._onThumbClick(e));
        $(".gallery-close", this.$settingPanel).click(() => this._hidePanel());
        $(window).on(EVENTS.hideModals, () => this._hidePanel());

        $(".wallpaper-thumb__fav").on('click', e => this._onFavClick(e));
    }

    _showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$settingPanel.addClass('gallery-box_active');
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

            if (!wallpaperData.userWallpaper) {
                this._loadWallpaper(wallpaperData.path);
            } else {
                const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
                this._loadWallpaper(userWallpaperData);
            }
        });
    }

    _setWallpaper(wallpaperName) {
        const wallpaperData = _.find(this.wallpapers, {
            name: wallpaperName
        });

        this._loadWallpaper(wallpaperData.path);

        settings.set(WALLPAPERS_STORAGE_KEY, wallpaperData);
    }

    setUserWallpaper() {
        this._loadWallpaper(settings.get(USER_WALLPAPER_STORAGE_KEY));
        settings.set(WALLPAPERS_STORAGE_KEY, {
            userWallpaper: true
        });
    }

    _loadWallpaper(wallpaperPath) {
        utils.loadBackgroundImage(this.$wallpaperContainer, wallpaperPath, 'bodyBg_state_loaded', 'bodyBg_state_loading');
    }

    _loadRemoteWallpapers() {
        $.getJSON(`${CONFIG_URL}?rnd=${Math.random() * 1000}`).then(response => {
            this.wallpapers = this.wallpapers.concat(
                response.list.map(pathResolver.bind({}, response.basePath))
            );
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