import page, {EVENTS} from '../page/page';
import './wallpaper.css';
import _ from 'lodash';
import utils from '../utils/utils';
import settings from '../settings/settings';

const WALLPAPERS = [{
    "name": "Default",
    "desc": "Dark mountain theme",
    "path": "wallpapers/1.jpg",
    "thumb": "wallpapers/1_thumb.jpg"
}, {
    "name": "Peak",
    "desc": "Apple peak theme",
    "path": "../wallpapers/2.jpg",
    "thumb": "wallpapers/2_thumb.jpg"
}, {
    "name": "Birdsview",
    "desc": "From a height",
    "path": "wallpapers/3.jpg",
    "thumb": "wallpapers/3_thumb.jpg"
}];

const WALLPAPERS_STORAGE_KEY = 'wallpaper_settings';
const DEFAULT_WALLPAPPER = WALLPAPERS[0];

const wallpaperThumbTmpl = ({name, path, thumb}) => (`
    <div class="wallpaper-thumb" data-name="${name}" style="background-image: url('${thumb}') ">
        <div class="wallpaper-thumb__fav"><div class="icon icon-add-favorites"></div></div>
    </div>
`);

class Background {

    constructor() {
        this.$wallpaperContainer = $(".bodyBg");
        this.$wallpaperListContainer = $("#scroller_base");
        this.$settingPanel = $('.gallery-box');

        this._bindEvents();
        this._fillWallpaperList();
        this._loadWallpaperSettings();
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
    }

    _showPanel() {
        page.onModalShow();
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

    _fillWallpaperList() {
        const wallpaperListHtml = WALLPAPERS.map(wallpaperThumbTmpl).join('');

        this.$wallpaperListContainer.html(wallpaperListHtml);
    }

    _loadWallpaperSettings() {
        settings.inited().then(() => {
            const wallpaperData = settings.get(WALLPAPERS_STORAGE_KEY) || DEFAULT_WALLPAPPER;
            this._loadWallpaper(wallpaperData.path);
        });
    }

    _setWallpaper(wallpaperName) {

        const wallpaperData = _.find(WALLPAPERS, {
            name: wallpaperName
        });

        this._loadWallpaper(wallpaperData.path);

        settings.set(WALLPAPERS_STORAGE_KEY, wallpaperData);
    }

    _loadWallpaper(wallpaperPath) {
        utils.loadBackgroundImage(this.$wallpaperContainer, wallpaperPath, 'bodyBg_state_loaded', 'bodyBg_state_loading');
    }

    _onThumbClick(e) {
        const wallpaperName = $(e.target).data('name');
        this._setWallpaper(wallpaperName);
    }

}

window.blocks.background = new Background();
