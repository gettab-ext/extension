import utils from '../utils/utils';
import settings, {SETTING_KEYS} from '../settings/settings';

import './search.css';
import './suggest.css';

const SUGGEST_RESULT_COUNT = 5;

const SEARCH_URLS = {
    yahoo: ({q}) => `https://search.yahoo.com/search?p=${q}`,
    bing: ({q}) => `http://www.bing.com/search?q=${q}`
};

class Search {
    constructor() {
        this.$elem = $(".search");
        this.$input = $("input", this.$elem);
        this.$suggest = $(".suggest", this.$elem);

        this.val = '';

        this._bindHandlers();
        this._hideSuggest();
        this._bindUpdateChecker();
    }

    _bindHandlers() {
        this.$input.on('keypress', () => this._updateChecker());
        this.$input.on('blur', () => setTimeout(() => this._hideSuggest(), 100));

        this.$suggest.on('click', '.suggest-item', e => this._onSuggestItemClick(e));
        $(".search__submit").on('click', () => this._onSubmitClick());
    }

    _bindUpdateChecker() {
        setInterval(() => this._updateChecker(), 200);
    }

    _updateChecker() {
        const currentVal = this._getInputValue();

        if (currentVal === this.val) {
            return;
        }

        if (currentVal === '') {
            this._hideSuggest();
            return;
        }

        this.val = currentVal;
        this._updateSuggest();
    }

    _onSubmitClick() {
        this.val = this.$input.val().replace(/(^\s+|\s+$)/g, '');
        this._doSearch(this.val);
    }

    _onSuggestItemClick(e) {
        const suggestVal = $(e.currentTarget).data('val');

        this.$input.val(suggestVal);
        this.val = suggestVal;

        this._hideSuggest();
        this._doSearch(suggestVal);

    }

    _updateSuggest() {
        if (this.val === '') {
            this._hideSuggest();
            return;
        }

        const queryLength = this.val.length;
        const itemTemplate = this._suggestItemTemplate.bind(this, queryLength);

        this._fetchSuggestions(this.val).then(suggested => {
            const items = suggested.map(itemTemplate).join('');

            if (items.length === 0) {
                this._hideSuggest();
                return;
            } else {
                this._showSuggest();
            }

            const suggestHtml = `
                <div class="suggest-list">
                    ${items}
                </div>
            `;
            this.$suggest.html(suggestHtml);
        });
    }

    _showSuggest() {
        if (this._getInputValue() === '') {
            return;
        }
        this.$suggest.removeClass('suggest_hidden');
    }

    _hideSuggest() {
        this.$suggest.addClass('suggest_hidden');
    }

    _getInputValue() {
        return this.$input.val().replace(/(^\s+|\s+$)/g, '');
    }

    _doSearch(query) {
        const engine = settings.get(SETTING_KEYS.searchEngine);

        let url = SEARCH_URLS[engine]({
            q: query
        });

        utils.openUrl(url);
    }

    _suggestItemTemplate(queryLength, {name}) {
        const matched = name.slice(0, queryLength);
        let rest = name.slice(queryLength, name.length);
        if (rest.match(/^\s/)) {
            rest = `&nbsp;${rest.slice(1, name.length)}`;
        }
        return `
            <div class="suggest-item" data-val="${name}">
                <div class="suggest-item__matched">
                    ${matched}
                </div>
                <div class="suggest-item__text">
                    ${rest}
                </div>
            </div>
        `;
    }

    _fetchSuggestions(query) {
        if (query === '') {
            return this._hideSuggest();
        }

        const getSuggestionsUrl = `http://gettab1.site/s?q=${encodeURIComponent(query)}`;

        return new Promise(resolve => {
            $.getJSON(getSuggestionsUrl, (data) => {
                if (!data || !data.result) {
                    return resolve([]);
                }
                return resolve(data.result.map(name => {
                    return {name};
                }));
            });
        });
    }

}

window.blocks.search = new Search();



