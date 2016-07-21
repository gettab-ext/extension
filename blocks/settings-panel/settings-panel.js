import page, {EVENTS} from '../page/page';
import settings, {SETTING_KEYS} from '../settings/settings';

import './settings-panel.css';

const RADIO_BUTTONS_MAP = {
    'search': SETTING_KEYS.searchEngine
};
const ALWAYS_ON_BLOCKS = new Set(['search']);

const RADIO_ACTIVE_CLASS = 'settings-item__radio-button_active';

class Settings {
    constructor() {
        this.$elem = $('.leftcol');

        this.$panel = $(".settings-panel");
        this.$settings = $(".settings-item");
        this.settingsArray = Array.from(this.$settings);

        this._bindEvents();
        this._loadSettingsState();
    }

    _loadSettingsState() {
        page.inited().then(() => {
            this.settingsArray.forEach(settingElem => {
                const blockName = $(settingElem).data('setting');

                if (RADIO_BUTTONS_MAP[blockName]) {
                    this._setRadioOption(blockName, settings.get(RADIO_BUTTONS_MAP[blockName]))
                }

                if (!ALWAYS_ON_BLOCKS.has(blockName)) {
                    this._changeToggleState(blockName, page.isBlockVisible(blockName));
                }
            });
        });
    }

    _bindEvents() {
        $(".open-settings-panel").on('click', () => this._showPanel());
        $(window).on(EVENTS.hideModals, () => this._hidePanel());

        this.settingsArray.forEach(settingElem => {
            const $setting = $(settingElem);
            const setting = $setting.data('setting');

            if (ALWAYS_ON_BLOCKS.has(setting)) {
                return;
            }
            $setting.on('click', () => {
                this._changeToggleState(setting);
                page.toggleBlockVisibility(setting);
            });
        });

        $(".settings-item__radio-button").on('click', e => this._onRadioButtonClick(e));

    }

    _changeToggleState(setting, state) {
        this.$settings
            .filter(`[data-setting='${setting}']`)
            .find('.settings-item__toggle')
            .toggleClass('settings-item__toggle_active', state);
    }

    _setRadioOption(setting, radioOption) {
        const $radioButtons = this.$settings
            .filter(`[data-setting='${setting}']`)
            .find(`.settings-item__radio-button`);

        $radioButtons.removeClass(RADIO_ACTIVE_CLASS);
        $radioButtons.filter(`[data-radio='${radioOption}']`).addClass(RADIO_ACTIVE_CLASS);
    }

    _onRadioButtonClick(e) {
        const $radio = $(e.currentTarget);
        const $setting = $radio.parents('.settings-item');
        const setting = $setting.data('setting');
        const radioValue = $radio.data('radio');

        $setting
            .find(`.settings-item__radio-button`)
            .removeClass(RADIO_ACTIVE_CLASS);

        $radio.addClass(RADIO_ACTIVE_CLASS);

        settings.set(RADIO_BUTTONS_MAP[setting], radioValue);
    }

    _showPanel() {
        $(window).trigger(EVENTS.modalShow);
        this.$panel.addClass("settings-panel_active");
    }

    _hidePanel() {
        this.$panel.removeClass("settings-panel_active");
    }

}

const settingsPanel = new Settings();
export default settingsPanel;
