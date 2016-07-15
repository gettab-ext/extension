import page from '../page/page';
import './search.css';
import './suggest.css';

const SUGGEST_RESULT_COUNT = 5;

class Search {
    constructor() {
        this.$elem = page.getBlockElem('search');
        this.$input = $("input", this.$elem);
        this.$suggest = $(".suggest", this.$elem);

        this.val = '';

        this._bindHandlers();
        this._hideSuggest();
    }

    _bindHandlers() {
        this._bindUpdateChecker();

        $(this.$suggest).on('click', '.suggest-item', e => this._onSuggestItemClick(e));

    }

    _bindUpdateChecker() {
        setInterval(() => {
            const currentVal = this.$input.val().replace(/(^\s+|\s+$)/g, '');

            if (currentVal === this.val) {
                return;
            }

            this.val = currentVal;
            this._updateSuggest();

        }, 200);
    }

    _onSuggestItemClick(e) {
        const suggestVal = $(e.currentTarget).data('val');

        this.$input.val(suggestVal);
        this.val = suggestVal;

        this._hideSuggest();
        this._doSearch();

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
        this.$suggest.removeClass('suggest_hidden');
    }

    _hideSuggest() {
        this.$suggest.addClass('suggest_hidden');
    }

    _doSearch() {
        console.log('Search', this.val);
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

        const getSuggestionsUrl = `https://www.mystart.com/api/get_alternative_searchterms/?q=${encodeURIComponent(query)}&limit=${SUGGEST_RESULT_COUNT}`;
        const itemMapper = item => {
            return {
                name: item
            };
        };

        return new Promise(resolve => {
            $.getJSON(getSuggestionsUrl, (data) => {
                if (typeof data !== 'object') {
                    return resolve([]);
                }
                if (typeof data.searchresults !== 'object') {
                    return resolve([]);
                }
                if (typeof data.searchresults.AlsoTryData !== 'object') {
                    return resolve([]);
                }
                return resolve(data.searchresults.AlsoTryData.map(itemMapper));
            });
        });
    }

}

window.blocks.search = new Search();



