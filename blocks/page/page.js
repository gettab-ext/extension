import './page.css';
import '../most-visited/most-visited';

import settings from '../settings/settings';
import _ from 'lodash';

const BLOCKS_DEFAULT = {
    'search': {
        visible: true
    },
    'most-visited': {
        visible: true
    },
    'logo': {
        visible: true
    },
    'greetings': {
        visible: true
    },
    'apps': {
        visible: false
    },
    'bookmarks': {
        visible: true
    },
    'recently-closed': {
        visible: true
    },
    'music': {
        visible: true
    },
    'weather': {
        visible: true
    },
    'todo': {
        visible: true
    }
};

export const EVENTS = {
    settingsUpdated: 'settings_updated',
    modalShow: 'modal_show',
    hideModals: 'hide_modals'
};

const BLOCK_SETTINGS_STORAGE_KEY = 'blockSettings';

class Page {
    constructor() {

        $(window).on(EVENTS.settingsUpdated, () => this._onBlockSettingsUpdated());
        $(window).on(EVENTS.modalShow, () => this.onModalShow());

        this._inited = settings.inited().then(() => this._loadBlockSettings());

        this._bindCommonEvents();

        $(".top-right").addClass('top-right_inited');
    }

    _loadBlockSettings() {
        this._blocks = settings.get(BLOCK_SETTINGS_STORAGE_KEY) || BLOCKS_DEFAULT;
        this._updateBlockVisibility();
    }

    _onBlockSettingsUpdated() {
        settings.set(BLOCK_SETTINGS_STORAGE_KEY, this._blocks);
        this._updateBlockVisibility();
    }

    _updateBlockVisibility() {
        _.forOwn(this._blocks, (blockProps, blockName) => {
            this.getBlockElem(blockName).toggleClass('hidden', !blockProps.visible);
        });
    }

    _bindCommonEvents() {
        $('.bodyBg').click(() => this.hideModals());
    }

    inited() {
        return this._inited;
    }

    setInited() {
        this._inited.then(() => {
            $(".top-right").addClass('top-right_inited');
            $(".page").addClass('page_visible');
        });
    }

    isBlockVisible(blockName) {
        return this._blocks[blockName] && this._blocks[blockName].visible || false;
    }

    setBlockVisibility(blockName, state) {
        if (!this._blocks[blockName]) {
            this._blocks[blockName] = {};
        }
        this._blocks[blockName].visible = !!state;
        this._onBlockSettingsUpdated();
    }

    toggleBlockVisibility(blockName) {
        if (this.isBlockVisible(blockName)) {
            this.setBlockVisibility(blockName, false);
        } else {
            this.setBlockVisibility(blockName, true);
        }
    }

    getBlockElem(blockName) {
        return $(`[data-block="${blockName}"]`);
    }

    hideModals() {
        $(window).trigger(EVENTS.hideModals);
        $('.modal.active').removeClass('active');
    }

    onModalShow() {
        this.hideModals();
    }

}

const page = new Page();

export default page;
