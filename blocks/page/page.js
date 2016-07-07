import './page.css';
import '../most-visited/most-visited';

const _ = require('lodash');

const blocks = {
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
    }
};

class Page {
    constructor() {

        $(window).on('settings_updated', () => this._onSettingsUpdated());
        this._updateBlockVisibility();

    }


    _onSettingsUpdated() {
        this._updateBlockVisibility();
    }

    _updateBlockVisibility() {
        _.forOwn(blocks, (blockProps, blockName) => {
            Page.getBlockElem(blockName).toggleClass('hidden', !blockProps.visible);
        });
    }

    static isBlockVisible(blockName) {
        return blocks[blockName].visible;
    }

    static setBlockVisibility(blockName, state) {
        blocks[blockName].visible = !!state;
        $(window).trigger('settings_updated');
    }

    static getBlockElem(blockName) {
        return $(`[data-block="${blockName}"]`);
    }
}

window.page = new Page();
window.blocks = {};

export default Page;