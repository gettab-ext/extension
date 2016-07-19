import settings from '../settings/settings';
import wallpaper, {USER_WALLPAPER_STORAGE_KEY, wallpaperThumbTmpl} from './wallpaper';

const ACCEPTED_TYPES = ['jpeg', 'png', 'bmp'];

const ERROR_CODES = {
    wrongType: 'wrong_type',
    smallImage: 'small_image'
};

const isBigImg = (img, callback) => {
    var i = new Image();
    i.src = img;

    i.onload = function () {
        callback(i);
    };
};

class Dropbox {
    constructor() {

        this.$elem = $(".dropbox");
        this.bindEvents();
        this.renderInitialState();
    }

    bindEvents() {
        $('.dropbox__browse-input').on("change", e => {
            this.readerEvent(e.target.files[0]);
        });
    }

    renderError(errorCode) {
        console.log('renderErrpr', errorCode);
        this.$elem.removeClass('dropbox_state_preloading');
        this.$elem.addClass('dropbox_state_error');
    }

    loadStart() {
        this.$elem.addClass('dropbox_state_preloading');
    }

    readerEvent(f) {
        var reader = new FileReader();
        reader.onloadstart = this.loadStart();
        reader.onload = this.load.bind(this, f);
        reader.readAsDataURL(f);
    }

    onUserWallpaperLoad(image) {
        settings.set(USER_WALLPAPER_STORAGE_KEY, image)
            .then(() => wallpaper.setUserWallpaper());
    }

    load(file, e) {
        const img = e.target.result;
        const type = file.type.split('/');

        if (!file.type.match('image.*') ||
            type[0] !== 'image' ||
            !ACCEPTED_TYPES.includes(type[1])
        ) {
            return this.renderError(ERROR_CODES.wrongType);
        }

        isBigImg(img, imageElem => {
            if (imageElem.width < 1024 || imageElem.height < 600) {
                return this.renderError(ERROR_CODES.smallImage);
            }

            this.onUserWallpaperLoad(img);
        });
    }

    renderInitialState() {
        settings.inited().then(() => {
            if (settings.get(USER_WALLPAPER_STORAGE_KEY)) {
                this.renderHaveImageState();
            } else {
                this.renderDropboxState();
            }
        });
    }

    renderHaveImageState() {
        const userWallpaperData = settings.get(USER_WALLPAPER_STORAGE_KEY);
        const userWallpaperThumb = wallpaperThumbTmpl({
            thumb: userWallpaperData
        });

    }

}

const dropbox = new Dropbox();
export default dropbox;