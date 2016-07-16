/* global chrome */
import {EVENTS} from '../page/page';
import utils from '../utils/utils';
import CONST from '../utils/constants';

import './bookmarks.css';
import './bookmarks-copy.css';

const REQUIRED_PERMISSIONS = {
    permissions: ['bookmarks'],
    origins: ['chrome://favicon/']
};

const makeNode = (tree) => {
    var isDir = tree.children && typeof tree.children === 'object';

    return {
        is_root:   false,
        is_dir:    isDir,

        id:        tree.id,
        index:     tree.index,
        title:     tree.title,
        parent_id: tree.parentId,
        children:  [],
        url:       isDir ? null : tree.url,
        icon:      isDir ? null : 'chrome://favicon/' + tree.url
    };
};

const parseTree = (tree, isRoot) => {
    var isDir = tree.children && typeof tree.children === 'object';

    var result = makeNode(tree);
    result.is_root = isRoot || false;

    if(isDir) {
        for(var i = 0; i < tree.children.length; ++i)
            result.children.push(parseTree(tree.children[i]));
    }

    return result;
};

var bookState = {
    selected: 0,
    expanded: {}
};

var renderTree = function(roots) {

    var tab = $('.bookmarks__list').empty();
    var rootNode = $('<ul>').addClass('root');

    for(var i = 0; i < roots.length; ++i) {
        roots[i].root_index = i;
        rootNode.append(generateTree(roots[i]));
    }

    tab.append(rootNode);
    selectRootLi(bookState.selected);
};

var generateTree = function(tree) {

    var li = $('<li>');
    li.attr('data-bookmarks-id', tree.id);


    // Folder
    if(tree.is_dir) {
        li.addClass('folder');

        var div = $('<div>').text(tree.title); {
            div.click(function() {
                if(typeof tree.root_index === 'number') {
                    selectRootLi(tree.root_index);
                } else {
                    bookState.expanded[li.attr('data-bookmarks-id')] = !bookState.expanded[li.attr('data-bookmarks-id')];
                    li.toggleClass('selected');
                }
            });
            li.append(div);
        }

        var ul = $('<ul>');
        ul.addClass('folder');
        if(tree.children && tree.children.length) {
            for(var i = 0; tree.children && i < tree.children.length; ++i)
                ul.append(generateTree(tree.children[i]));
        }
        if(bookState.expanded['' + tree.id]) {
            li.addClass('selected');
        }
        li.append(ul);
    }
    // Link
    else {
        li.addClass('item');

        var a = $('<a>').text(tree.title); {
            a.css('background-image', 'url(' + (tree.icon || CONST.defaultFavIcon) + '), url(../images/icons/favicon-bg-24.png)');
            a.css('background-size', '16px 16px, 24px 24px');
            a.attr({
                href:  tree.url,
                title: tree.url
            });

            a.click(function(e) {
                e.preventDefault();
                utils.openLinkFromEvent(e);
            });

            li.append(a);
        }
    }

    return li;
};

var selectRootLi_TIMER = null;

var selectRootLi = function(liIndex) {
    var root = $('.bookmarks__list ul.root');
    var rootLis = $('> li', root);
    var len = rootLis.length;
    var oldLi = $('> li.selected', root);
    var newLi = $(rootLis[liIndex]);

    bookState.selected = liIndex;
    // Selected category was clicked, open another one
    if(newLi.hasClass('selected')) {
        if(liIndex + 1 < rootLis.length) {
            bookState.selected = liIndex + 1;
            return selectRootLi(liIndex + 1);
        } else if(liIndex - 1 >= 0) {
            bookState.selected = liIndex - 1;
            return selectRootLi(liIndex - 1);
        } else {
            return;
        }
    }

    if(selectRootLi_TIMER !== null)
        clearTimeout(selectRootLi_TIMER);

    oldLi.removeClass('selected');
    newLi.addClass('selected');

    // This with set flexible dimension that will scale properly on window resize, since it's using 'auto', it can't use CSS transitions
    var setFlexibleCss = function() {
        selectRootLi_TIMER = null;
        rootLis.css('transition', 'none');

        for(var i = 0; i < len; ++i) {
            $(rootLis[i]).css({
                top:     i  <= liIndex ? 48 * i + 'px' : 'auto',
                bottom:  i  >= liIndex ? 48 * (len - i - 1) + 'px' : 'auto',
                height:  i === liIndex ? 'auto' : '46px'
            });
        }
    };

    // Don't animate
    if(!oldLi.length)
        return setFlexibleCss();

    // With animations
    var i, top, height;

    // #1: Compute absolute starting top and bottom position for all <li>s
    for(i = 0, top = 0; i < len; ++i) {
        height = $(rootLis[i]).height();

        $(rootLis[i]).css({
            top:    top + 'px',
            height: height + 'px',
        });

        top += height + 2;
    }

    // #2: Enable CSS transition
    rootLis.css('transition', 'top .333s, height .333s');

    // #3: Compute absolute ending top and bottom position for all <li>s
    for(i = 0, top = 0; i < len; ++i) {
        height = i === liIndex ? root.height() - (48 * (len - 1)) : 46;

        $(rootLis[i]).css({
            top:    top + 'px',
            height: height + 'px',
        });

        top += height + 2;
    }

    // #4: Wait for the animation to finish and restore flexible CSS
    selectRootLi_TIMER = setTimeout(function() { setFlexibleCss(); }, 400);
};

class Bookmarks {
    constructor() {

        this.$panel = $(".bookmarks");

        this.bindEvents();

        this.getAll((error, bookmarks) => this.render(error, bookmarks));
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

    getAll(callback = utils.noop) {
        chrome.permissions.contains(REQUIRED_PERMISSIONS, function(result) {
            if(!result) {
                callback('PERMISSION_ERROR');
                return;
            }

            chrome.bookmarks.getTree(function(trees) {
                if(chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError.message);
                    return;
                }

                var roots = [];

                for(var i = 0; i < trees[0].children.length; i++)
                    roots.push(parseTree(trees[0].children[i], true));

                callback(false, roots);
            });
        });
    }

    render(error, bookmarks) {
        if (error) {
            this.renderDisabled(error);
        } else if(bookmarks.length === 0) {
            this.renderDisabled('NO_RESULTS');
        } else {
            this.renderEnabled(bookmarks);
        }
    }

    renderDisabled(error) {

        if (error === 'PERMISSION_ERROR') {
            this.$panel.addClass('bookmarks_mode_permissions-required');
        }
        if (error === 'NO_RESULTS') {
            this.$panel.addClass('bookmarks_mode_no-bookmarks');
        }

    }

    renderEnabled(roots) {
        renderTree(roots);
    }
}

const bookmarks = new Bookmarks();
export default bookmarks;