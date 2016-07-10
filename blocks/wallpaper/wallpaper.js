import page from '../page/page';
import './wallpaper.css';

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

const wallpaperThumbTmpl = ({name, path, thumb}) => (`
    <div class="wallpaper-thumb" data-name="${name}" style="background-image: url('${thumb}') ">
        <div class="wallpaper-thumb__fav"></div>
    </div>
`);

class Background {

    constructor() {

        this._bindEvents();
        this._fillWallpaperList();

        this.$wallpaperContainer = $(".bodyBg");

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

    }

    _fillWallpaperList() {
        const wallpaperListContainer = $("#scroller_base");
        const wallpaperListHtml = WALLPAPERS.map(wallpaperThumbTmpl).join('');

        wallpaperListContainer.html(wallpaperListHtml);
    }

    _setWallpaper() {



    }

}

window.blocks.background = new Background();
