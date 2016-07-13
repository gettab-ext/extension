import page, {EVENTS} from '../page/page';
import './settings-panel.css';
import settings from '../settings/settings';

class Settings {
    constructor() {
        this.$elem = $('.leftcol');

        this._$togglers = $(".leftcol label[data-toggle]").toArray().map(e => $(e));

        this._bindHandlers();
        this._loadSettingsState();
    }

    _loadSettingsState() {
        page.inited().then(() => {
            this._$togglers.forEach($toggle => {
                const blockName = $toggle.data('toggle');

                if (page.isBlockVisible(blockName)) {
                    $toggle.addClass('active');
                } else {
                    $toggle.removeClass('active');
                }
            });
        });
    }

    _bindHandlers() {

        $('#leftMenuSwitch').click( function(){
            $(window).trigger(EVENTS.modalShow);
            $('.modal.active:not(.leftcol)').removeClass('active');
            $('.leftcol').toggleClass('active');
        });

        this._$togglers.forEach($toggle => {
            const toggleContainer$ = $toggle.parent();
            toggleContainer$.on('click', () => this._onToggleClick($toggle));
        });

    }

    _onToggleClick($toggle) {
        const blockName = $toggle.data('toggle');

        if (page.isBlockVisible(blockName)) {
            $toggle.removeClass('active');
            page.setBlockVisibility(blockName, false);
        } else {
            $toggle.addClass('active');
            page.setBlockVisibility(blockName, true);
        }

        return false;
    }
}

window.blocks.settings = new Settings();