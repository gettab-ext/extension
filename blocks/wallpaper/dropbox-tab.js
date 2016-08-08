import settings from '../settings/settings';
import wallpaper, {wallpaperThumbTmpl} from './wallpaper';

import {
    USER_WALLPAPER_STORAGE_KEY
} from '../config/const';

const ACCEPTED_TYPES = ['jpeg', 'png', 'bmp'];

const ERROR_CODES = {
    wrongType: 'wrong_type',
    smallImage: 'small_image'
};
const STATES_CLASSES = {
    userWallpaper: 'dropbox-gallery-tab_state_user-wallpaper',
    dropbox: 'dropbox-gallery-tab_state_dropbox'
};

const getImageElem = (img, callback) => {
    var i = new Image();
    i.src = img;

    i.onload = function () {
        callback(i);
    };
};

class DropboxTab {
    constructor() {

        this.$tab = $(".dropbox-gallery-tab");
        this.$elem = $(".dropbox");
        this.$userThumbContainer = $(".user-wallpaper__thumb-container");
        this.$fileInput = $('.dropbox__browse-input');

        this.bindEvents();
        this.renderInitialState();
    }

    bindEvents() {
        this.$fileInput.on("change", e => {
            this.readerEvent(e.target.files[0]);
        });

        this.$tab.on('click', '.wallpaper-thumb_mod_user', () => {
            wallpaper.setUserWallpaper();
        });
        $(".user-wallpaper__replace").on('click', () => {
            this.$fileInput.val('');
            this.renderDropboxState();
        });
        $(".user-wallpaper__delete").on('click', () => {
            this.$fileInput.val('');
            this.deleteUserWallpaper();
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
        try {
            var reader = new FileReader();
            reader.onloadstart = this.loadStart();
            reader.onload = this.load.bind(this, f);
            reader.readAsDataURL(f);
        } catch (e) {
            console.warn(e);
        }
    }

    onUserWallpaperLoad(image) {
        settings.set(USER_WALLPAPER_STORAGE_KEY, image)
            .then(() => {
                wallpaper.setUserWallpaper();
                this.renderHaveImageState();
            });
    }

    load(file, e) {
        const img = e.target.result;
        const type = file.type.split('/');
        this.$elem.removeClass('dropbox_state_preloading');

        if (!file.type.match('image.*') ||
            type[0] !== 'image' ||
            !ACCEPTED_TYPES.includes(type[1])
        ) {
            return this.renderError(ERROR_CODES.wrongType);
        }

        getImageElem(img, imageElem => {
            // FIXME: обработка ошибок
            // if (imageElem.width < 1024 || imageElem.height < 600) {
            //     return this.renderError(ERROR_CODES.smallImage);
            // }

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
            thumb: userWallpaperData,
            mod: 'user'
        });
        this.$userThumbContainer.html(userWallpaperThumb);

        this.$tab.removeClass(STATES_CLASSES.dropbox);
        this.$tab.addClass(STATES_CLASSES.userWallpaper);
    }

    renderDropboxState() {
        this.$tab.addClass(STATES_CLASSES.dropbox);
        this.$tab.removeClass(STATES_CLASSES.userWallpaper);
    }

    deleteUserWallpaper() {
        wallpaper.resetWallpaper();
        settings.set(USER_WALLPAPER_STORAGE_KEY, '');
        this.renderDropboxState();
    }

}

const dropboxTab = new DropboxTab();
export default dropboxTab;
