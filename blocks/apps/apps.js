/* global chrome */

import {EVENTS} from '../page/page';
import utils from '../utils/utils';
import permissions from '../utils/permissions';
import tabs from '../utils/tabs';

import './apps.css';
import './app.css';

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

const appTmpl = ({appId, iconUrl, title}) => `
    <div class="app" data-app="${appId}">
        <div class="app__icon" style="background-image: url('${iconUrl}')"></div>
        <div class="app__title">
            ${title}
        </div>
    </div>
`;

const TAB_ICON_SIZE = 128;

class Apps {
    constructor() {

        this.$panel = $(".apps");
        this.$appList = $(".apps__list");

        this.bindEvents();

        this.getAll((error, apps) => this.render(error, apps));
    }

    bindEvents() {

        $("#show-apps-button").on('click', () => this.showPanel());
        $(".apps__close").on('click', () => this.hidePanel());
        $(window).on(EVENTS.hideModals, () => this.hidePanel());

        $(".apps__permissions__button").on('click', () => permissions.request());

        $(".apps__list").on('click', '.app', e => {
            const appId = $(e.target).data('app');
            this.launch(appId);
        });
    }

    showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass('apps_active');
    }

    hidePanel() {
        this.$panel.removeClass('apps_active');
    }

    getAll(callback = utils.noop) {
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
    }

    findOne(id, callback) {
        this.getAll(function(error, apps) {
            if(error) {
                callback(error, null);
                return;
            }

            for(var i = 0; i < apps.length; ++i) {
                if(apps[i].id === id) {
                    callback(false, apps[i]);
                    return;
                }
            }

            // Not found
            callback('NOT_FOUND', null);
        });
    }

    launch(id, callback = utils.noop) {
        this.findOne(id, function(error, app) {

            if (error) {
                callback(error, id);
                return;
            }

            if (app.is_custom) {
                tabs.create({ url: app.url, active: true }, function(error, tab) {
                    callback(error, id);
                });
                return;
            }

            chrome.management.setEnabled(id, true, function() {
                if (chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError, id);
                    return;
                }

                chrome.management.launchApp(id, function() {
                    callback(chrome.runtime.lastError || false, id);
                });
            });
        });
    }

    render(error, apps) {
        if (error) {
            this.renderDisabled(error);
        } else if(apps.length === 0) {
            this.renderDisabled('NO_RESULTS');
        } else {
            this.renderEnabled(apps);
        }
    }

    renderDisabled(error) {

        if (error === 'PERMISSION_ERROR') {
            this.$panel.addClass('apps_mode_permissions-required');
        }
        if (error === 'NO_RESULTS') {
            this.$panel.addClass('apps_mode_no-apps');
        }

    }

    renderEnabled(apps) {

        const appsHtml = apps.map(app => this.renderApp(app)).join('');
        this.$appList.html(appsHtml);

    }

    renderApp(app) {
        const iconIndex = this.getBestIcon(app.icons);

        return appTmpl({
            appId: app.id,
            title: app.name || app.shortName,
            iconUrl: (app.icons[iconIndex].url + (app.enabled ? '' : '?grayscale=true'))
        });
    }

    getBestIcon(icons) {
        if (!icons || icons.length === 0) {
            return -1;
        }

        var bestI = 0;
        for(var i = 0; i < icons.length; ++i) {
            if (Math.abs(icons[i].size - TAB_ICON_SIZE) < Math.abs(icons[bestI].size - TAB_ICON_SIZE)) {
                bestI = i;
            }
        }

        return bestI;
    }
}

const apps = new Apps();

export default apps;

