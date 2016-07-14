import {EVENTS} from '../page/page';

import './apps.css';

class Apps {
    constructor() {

        this.$panel = $(".apps");

        this.init();

    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        $("#show-apps-button").on('click', () => this.showPanel());
        $(".apps__close").on('click', () => this.hidePanel());
        $(window).on(EVENTS.hideModals, () => this.hidePanel());
    }

    showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass('apps_active');
    }

    hidePanel() {
        this.$panel.removeClass('apps_active');
    }
}

const apps = new Apps();

