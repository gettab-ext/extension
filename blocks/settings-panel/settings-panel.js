import page, {EVENTS} from '../page/page';
import './settings-panel.css';

class Settings {
    constructor() {
        this.$elem = $('.leftcol');

        this.$panel = $(".settings-panel");

        this._$togglers = $(".leftcol label[data-toggle]").toArray().map(e => $(e));

        this._bindEvents();
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

    _bindEvents() {

        $(".open-settings-panel").on('click', () => this.showPanel());
        $(window).on(EVENTS.hideModals, () => this.hidePanel());

        this._$togglers.forEach($toggle => {
            const toggleContainer$ = $toggle.parent();
            toggleContainer$.on('click', () => this._onToggleClick($toggle));
        });

    }

    showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass("settings-panel_active");
    }

    hidePanel() {
        console.log('remove Class');
        this.$panel.removeClass("settings-panel_active");
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