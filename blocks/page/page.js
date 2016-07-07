require('./page.css');

import '../most-visited/most-visited';

const _ = require('lodash');

const blocks = {
    'search': {
        visible: true
    },
    'most-visited': {
        visible: true
    }
};

class Page {
    constructor() {

        $(window).on('settings_updated', () => this.onSettingsUpdated());

    }


    onSettingsUpdated() {
        this._updateBlockVisibility();
    }

    _updateBlockVisibility() {
        _.forOwn(blocks, (blockProps, blockName) => {
            this.getBlockElem(blockName).toggleClass('hidden', !blockProps.visible);
        });
    }

    static getBlockElem(blockName) {
        return $(`[data-block="${blockName}"]`);
    }
}

window.page = new Page();
window.blocks = {};

export default Page;