import page, {EVENTS} from '../page/page';
import './settings-panel.css';

class Settings {
    constructor() {
        this.$elem = $('.leftcol');

        this.$panel = $(".settings-panel");
        this.$settings = $(".settings-item");

        this._bindEvents();
        this._loadSettingsState();
    }

    _loadSettingsState() {
        page.inited().then(() => {
            Array.from(this.$settings).forEach(toggle => {
                const blockName = $(toggle).data('setting');
                this._changeToggleState(blockName, page.isBlockVisible(blockName));
            });
        });
    }

    _bindEvents() {
        $(".open-settings-panel").on('click', () => this._showPanel());
        $(window).on(EVENTS.hideModals, () => this._hidePanel());

        this.$settings.on('click', e => {
            const setting = $(e.currentTarget).data('setting');

            this._changeToggleState(setting);
            page.toggleBlockVisibility(setting);
        });
    }

    _changeToggleState(setting, state) {
        this.$settings
            .filter(`[data-setting='${setting}']`)
            .find('.settings-item__toggle')
            .toggleClass('settings-item__toggle_active', state);
    }

    _showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass("settings-panel_active");
    }

    _hidePanel() {
        this.$panel.removeClass("settings-panel_active");
    }


}

window.blocks.settings = new Settings();