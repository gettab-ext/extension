/* global chrome */

import './tableau.css';

import utils from '../utils/utils';
import CONST from '../utils/constants';
import permissions from '../utils/permissions';
import Fetcher from '../utils/fetcher';
import stat from '../utils/stat';
import _ from 'lodash';

const REQUIRED_PERMISSIONS = {
    permissions: [ 'topSites' ],
    origins: [ 'chrome://favicon/' ]
};

const LINK_COUNT = 8;
const THUMB_FETCH_TIMEOUT = 15 * 1000;
const THUMB_INFO_TTL = 14 * 7 * 24 * 60 * 60 * 1000;

const tableauItem = ({title, href, icon, bgColor, iconMode}) => `
    <a href="${href}" class="tableau-item tableau-item_icon-mode_${iconMode}" style="background-color: ${bgColor};">
        <div class="tableau-item__icon" style="background-image: url('${icon}')"></div>
        <div class="tableau-item__title">
            ${title}
        </div>
    </a>
`;

const getDomain = (url) => {
    var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return matches && matches[1].replace(/^www\./, '');
};

class Tableau {

    constructor() {
        this.removedUrls = [];

        this.$block = $(".tableau");
        this.$list = $(".tableau__list");

        this.get(LINK_COUNT, this.render.bind(this));

        this.bindEvents();
    }

    bindEvents() {
        $(".tableau__permissions").on('click', () => permissions.request());
        this.$list.on('click', '.tableau-item', () => {
            stat.send('tableau.click');
        });
    }

    render(error, mostVisited) {
        if (error) {
            this.renderDisabled(error);
        } else if(mostVisited.length === 0) {
            this.renderDisabled('NO_RESULTS');
        } else {
            this.renderEnabled(mostVisited);
        }

    }

    renderDisabled(error) {
        if (error === 'PERMISSION_ERROR') {
            this.$block.addClass('tableau_mode_permissions-required');
        }
        if (error === 'NO_RESULTS') {
            this.$block.addClass('tableau_mode_no-sites');
        }
        this.$block.addClass('tableau_inited');
    }

    renderEnabled(sites) {

        const renderThumb = site => {
            return new Promise(resolve => {
                const domain = getDomain(site.url);

                this.getThumb(domain).then(thumbData => {
                    const iconMode = (thumbData.logo
                        ? 'logo'
                        : 'icon'
                    );

                    resolve(tableauItem({
                        href: site.url,
                        title: site.title || site.url,
                        icon: thumbData.logo || site.icon || CONST.defaultFavIcon,
                        bgColor: thumbData.bgColor,
                        iconMode
                    }));
                });
            });
        };

        Promise.all(sites.map(renderThumb)).then(rendered => {
            this.$list.html(rendered.join(''));
            this.$block.addClass('tableau_inited');
        });
    }

    queryTopSites(limit, callback = utils.noop) {
        chrome.topSites.get(data => {
            var urls = [];

            for (var i = 0; i < data.length && (limit < 0 || urls.length < limit); ++i) {
                // Check removed URLs

                if(this.removedUrls.indexOf(data[i].url) !== -1)
                    continue;

                urls.push({
                    url:   data[i].url,
                    title: data[i].title,
                    icon:  'chrome://favicon/' + data[i].url
                });
            }

            callback(false, urls);
        });
    };

    get(limit, callback) {

        // Argument juggling
        if(arguments.length === 1) {
            callback = limit;
            limit = -1;
        }

        callback = callback || utils.noop;

        chrome.permissions.contains(REQUIRED_PERMISSIONS, result => {
            if (!result) {
                callback('PERMISSION_ERROR');
                return;
            }

            if (this.removedUrls !== null) {
                this.queryTopSites(limit, callback);
                return;
            }

            chrome.storage.local.get('FRAMEWORK_SHIM_MOST_VISITED_REMOVED', items => {

                if(chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError);
                    return;
                }

                if(items.hasOwnProperty('FRAMEWORK_SHIM_MOST_VISITED_REMOVED'))
                    this.removedUrls = items.FRAMEWORK_SHIM_MOST_VISITED_REMOVED;
                else
                    this.removedUrls = [];

                this.queryTopSites(limit, callback);
            });
        });
    }

    remove(url, callback = utils.noop) {
        // Remove one
        if (typeof url === 'string') {
            url = this.removedUrls.concat([url]);

            chrome.storage.local.set({'FRAMEWORK_SHIM_MOST_VISITED_REMOVED': url}, () => {
                callback(chrome.runtime.lastError || false);
            });

            return;
        }

        // Remove all: List URLs witch are not currently removed
        mostVisited.get(urls => {
            var more = this.removedUrls.concat([]);

            for (var i = 0; i < urls.length; ++i)
                more.push(urls.url);

            chrome.storage.local.set({ 'FRAMEWORK_SHIM_MOST_VISITED_REMOVED': more }, () => {
                callback(chrome.runtime.lastError || false);
            });
        });
    }

    restore(callback = utils.noop) {
        chrome.storage.local.set({ 'FRAMEWORK_SHIM_MOST_VISITED_REMOVED': [] }, () => {
            callback(chrome.runtime.lastError || false);
        });
    }

    getThumb(domain) {
        const URL = `https://api.browser.yandex.ru/dashboard3/get/get?nodes=${domain}&brandID=yandex&lang=en`;
        const thumbFetcher = new Fetcher({
            url: URL,
            ttl: THUMB_INFO_TTL,
            timeout: THUMB_FETCH_TIMEOUT,
        });

        return thumbFetcher.get().then(data => {
            return {
                bgColor: _.get(data, '[0].bgcolor'),
                logo: _.get(data, '[0].resources.logo_main')
            };
        });

    }

}

const tableau = new Tableau();
export default tableau;
