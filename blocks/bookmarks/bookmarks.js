import {EVENTS} from '../page/page';

import './bookmarks.css';

class Bookmarks {
    constructor() {

        this.$panel = $(".bookmarks");

        this.bindEvents();
    }

    bindEvents() {

        $("#show-bookmarks-button").on('click', () => this.showPanel());
        $(".bookmarks__close").on('click', () => this.hidePanel());
        $(window).on(EVENTS.hideModals, () => this.hidePanel());

    }

    showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass('bookmarks_active');
    }

    hidePanel() {
        this.$panel.removeClass('bookmarks_active');
    }
}

const bookmarks = new Bookmarks();
export default bookmarks;