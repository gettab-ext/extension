/* global chrome */

import './most-visited.css';

import utils from '../utils/utils';
import CONST from '../utils/constants';
import permissions from '../utils/permissions';

const REQUIRED_PERMISSIONS = {
    permissions: [ 'topSites' ],
    origins: [ 'chrome://favicon/' ]
};

const LINK_COUNT = 4;

const mostVisitedItem = ({title, href, icon}) => `
    <a href="${href}" class="most-visited-item">
        <div class="most-visited-item__icon" style="background-image: url('${icon}')"></div>
        <div class="most-visited-item__title">
            ${title}
        </div>
    </a>
`;

class MostVisited {

    constructor() {

        this.removedUrls = [];

        this.$block = $(".most-visited");
        this.$list = $(".most-visited__list");

        this.get(LINK_COUNT, this.render.bind(this));

        this.bindEvents();

    }

    bindEvents() {
        $(".most-visited__permissions").on('click', () => permissions.request());
    }

    render(error, mostVisited) {
        if (error) {
            this.renderDisabled(error);
        } else if(mostVisited.length === 0) {
            this.renderDisabled('NO_RESULTS');
        } else {
            this.renderEnabled(mostVisited);
        }
        this.$block.addClass('most-visited_inited');
    }

    renderDisabled(error) {

        if (error === 'PERMISSION_ERROR') {
            this.$block.addClass('most-visited_mode_permissions-required');
        }
        if (error === 'NO_RESULTS') {
            this.$block.addClass('most-visited_mode_no-sites');
        }

    }

    renderEnabled(sites) {

        const listHtml = sites.map(site => {
            return mostVisitedItem({
                href: site.url,
                title: site.title || site.url,
                icon: site.icon || CONST.defaultFavIcon
            });
        }).join('');

        this.$list.html(listHtml);

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

}

const mostVisited = new MostVisited();
export default mostVisited;