import page from '../page/page';
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
        <div class="wallpaper-thumb__fav"></div>
    </div>
`);

class Background {

    constructor() {
        this.$wallpaperContainer = $(".bodyBg");

        this._bindEvents();
        this._fillWallpaperList();
        this._loadWallpaperSettings();
    }

    _bindEvents() {

        $('.gallerySw').click(function(){
            page.onModalShow();
            $('.gallery_box').toggleClass('active');
        });

        $('.tab_list li').click(function(){
            $(this).parent('.tab_list').find('li').removeClass('active');
            $(this).addClass('active');

            var $idTab = $(this).data('tab');
            $(this).parent('.tab_list').next('.window_list').find('div').removeClass('active');
            $(this).parent('.tab_list').next('.window_list').find('div#' + $idTab).addClass('active');
        });

        $("#scroller_base").on('click', '.wallpaper-thumb', e => this._onThumbClick(e));
    }

    _fillWallpaperList() {
        const wallpaperListContainer = $("#scroller_base");
        const wallpaperListHtml = WALLPAPERS.map(wallpaperThumbTmpl).join('');

        wallpaperListContainer.html(wallpaperListHtml);
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
