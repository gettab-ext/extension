import Page from '../page/page';
import './settings.css';

class Settings {
    constructor() {
        this.$elem = $('.leftcol');

        this._bindHandlers();
    }

    _bindHandlers() {

        $('#leftMenuSwitch').click( function(){
            $('.modal.active:not(.leftcol)').removeClass('active');
            $('.leftcol').toggleClass('active');
        });

        const togglers$ = Array.from($(".leftcol label[data-toggle]")).forEach($toggle => {
            $toggle = $($toggle);
            const toggleContainer$ = $toggle.parent();
            const blockName = $toggle.data('toggle');

            console.log('bind, ', blockName);
            toggleContainer$.on('click', () => this._onToggleClick($toggle));

            if (Page.isBlockVisible(blockName)) {
                $toggle.addClass('active');
            } else {
                $toggle.removeClass('active');
            }
        })

    }

    _onToggleClick($toggle) {
        const blockName = $toggle.data('toggle');

        console.log('blockName', Page.isBlockVisible(blockName));

        if (Page.isBlockVisible(blockName)) {
            $toggle.removeClass('active');
            Page.setBlockVisibility(blockName, false);
        } else {
            $toggle.addClass('active');
            Page.setBlockVisibility(blockName, true);
        }

        return false;

    }
}

window.blocks.settings = new Settings();