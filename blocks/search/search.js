import utils from '../utils/utils';
import settings, {SETTING_KEYS} from '../settings/settings';
import stat from '../utils/stat';

import './search.css';
import './suggest.css';

const SUGGEST_RESULT_COUNT = 5;
const SUGGESTION_DELAY = 0;

const SEARCH_URLS = {
    yahoo: ({q}) => `https://search.yahoo.com/search?p=${q}`,
    bing: ({q}) => `http://www.bing.com/search?q=${q}`
};

const suggestProviders = {
    bing(query) {
        const url = 'https://api.bing.com/osjson.aspx?JsonType=callback&JsonCallback=?';
        return $.getJSON(url, {
            query: query
        }).then(data => data && data[1] && data[1].slice(0, SUGGEST_RESULT_COUNT));
    },
    google(query) {
        const url = `https://suggestqueries.google.com/complete/search?output=firefox&q=${query}`;
        return $.ajax({
            url,
            dataType: 'jsonp'
        }).then(data => data && data[1] && data[1].slice(0, SUGGEST_RESULT_COUNT));
    },
    yahoo(query) {
        const url = `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=sd1&command=${query}&nresults=${SUGGEST_RESULT_COUNT}&callback=?`;
        return $.ajax({
            url,
            dataType: 'jsonp'
        }).then(data => data && data.r && data.r.map(r => r.k));
    }
};

const DEFAULT_SUGGEST_ENGINE = 'google';

class Search {
    constructor() {
        this.$elem = $(".search");
        this.$input = $("input", this.$elem);
        this.$suggest = $(".suggest", this.$elem);

        this.val = '';
        this.selectedSuggestionIndex = null;

        this._bindHandlers();
        this._hideSuggest();
        // this._bindUpdateChecker();
    }

    _bindHandlers() {
        this.$input.on('focus', () => {
            this.$elem.addClass('search_focused');
        });
        this.$input.on('blur', () => {
            this.$elem.removeClass('search_focused');
            setTimeout(() => this._hideSuggest(), 500);
        });

        this.$suggest.on('click', '.suggest-item', e => this._onSuggestItemClick(e));
        $(".search__submit").on('click', () => this._onSubmitClick());

        let timeout;
        this.$input.keydown(e => {
            switch (e.which) {
                case 27: // Escape
                    this._hideSuggest();
                    break;

                case 38: // Up
                    this._changeSelectedSuggestion('up');
                    e.preventDefault();
                    break;

                case 40: // Down
                    this._changeSelectedSuggestion('down');
                    e.preventDefault();
                    break;

                case 37: // left
                    break;

                default: // Typeahead
                    if (timeout !== null)
                        clearTimeout(timeout);

                    timeout = setTimeout(() => {
                        timeout = null;
                        this._updateChecker();
                    }, SUGGESTION_DELAY);
            }
        });

        $(document).ready(() => {
            this.$input.focus();
        });
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
        stat.send('search.suggest_click');

    }

    _updateSuggest() {
        if (this.val === '') {
            this._hideSuggest();
            return;
        }

        const queryLength = this.val.length;
        const itemTemplate = this._suggestItemTemplate.bind(this, queryLength);

        this.cachedVal = this.val;

        this._fetchSuggestions(this.val).then(suggested => {
            const items = suggested.map(itemTemplate).join('');
            this.suggestions = suggested;

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

            this.selectedSuggestionIndex = -1;
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

    _isSuggestVisible() {
        return !this.$suggest.hasClass('suggest_hidden');
    }

    _looseSelectedSuggestion() {
        this._hideSuggest();
    }

    _changeSelectedSuggestion(direction) {
        if (direction === 'up') {
            if (this.selectedSuggestionIndex === 0) {
                this.$input.val(this.cachedVal);
                this._looseSelectedSuggestion();
            } else {
                this.selectedSuggestionIndex -= 1;
                this._updateSelectedSuggestion();
            }
        } else {
            if (!this._isSuggestVisible()) {
                this._showSuggest();
                this.selectedSuggestionIndex = 0;
                this._updateSelectedSuggestion();
            } else {
                if (this.selectedSuggestionIndex === (this.suggestions.length - 1)) {
                    return;
                } else {
                    this.selectedSuggestionIndex += 1;
                    this._updateSelectedSuggestion();
                }
            }
        }
    }

    _getInputValue() {
        return this.$input.val().replace(/(^\s+|\s+$)/g, '');
    }

    _doSearch(query) {
        const engine = settings.get(SETTING_KEYS.searchEngine);

        stat.send(`search.dosearch.${engine}`);

        let url = SEARCH_URLS[engine]({
            q: query
        });

        utils.openUrl(url);
    }

    _suggestItemTemplate(queryLength, name) {
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

        return new Promise(resolve => {
            suggestProviders[DEFAULT_SUGGEST_ENGINE](query)
                .then(data => resolve(data));
        });
    }

    _updateSelectedSuggestion() {
        const $items = this.$suggest.find(".suggest-item");
        $items.removeClass("suggest-item_selected");
        const $item = $($items[this.selectedSuggestionIndex]);
        const value = $item.data('val');

        this.$input.val(value);
        $item.addClass("suggest-item_selected");
    }

}

const search = new Search();
export default search;

