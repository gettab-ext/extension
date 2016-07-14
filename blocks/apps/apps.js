/* global chrome, $ */
import {EVENTS} from '../page/page';
import utils from '../utils/utils';

import './apps.css';

const REQUIRED_PERMISSIONS = {
    permissions: [ 'management' ],
    origins: []
};

const makeIcons = (app) => {
    if (typeof app.icons !== 'object') {
        app.icons = [
            { size: 16,  url: 'chrome://extension-icon/' + app.id + '/16/0'  },
            { size: 48,  url: 'chrome://extension-icon/' + app.id + '/48/0'  },
            { size: 128, url: 'chrome://extension-icon/' + app.id + '/128/0' }
        ];
    }

    return app;
};

const CUSTOM_APPS = [
    makeIcons({
        is_custom : true,
        id        : 'ahfgeienlihckogmohjhadlkjgocpleb',
        name      : 'Web Store',
        url       : 'https://chrome.google.com/webstore',
        enabled   : true
    })
];

const getAll = function(callback = utils.noop) {
    chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result) {

        if (!result) {
            callback('PERMISSION_ERROR', null);
            return;
        }

        chrome.management.getAll(function(results) {
            var apps = CUSTOM_APPS.concat();

            for (var i = 0; i < results.length; i++) {
                if (!results[i].isApp) {
                    continue;
                }

                apps.push(makeIcons(results[i]));
            }

            callback(false, apps);
        });
    });
};

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

export default apps;

