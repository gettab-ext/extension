import page from '../page/page';
import './search.css'

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
            const currentVal = this.$input.val();

            if (currentVal === this.val) {
                return;
            }

            this.val = currentVal;
            this._updateSuggest();

        }, 200);
    }

    _onSuggestItemClick(e) {
        const suggestVal = $(e.target).data('val');

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

        this._getSuggest(this.val).then(suggested => {
            const items = suggested.map(this._suggestItemTemplate).join('');

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

    _suggestItemTemplate({name}) {
        return `
            <div class="suggest-item" data-val="${name}">
                ${name}
            </div>
        `;
    }

    _getSuggest(query) {
        return Promise.resolve([{name: 'There'}, {name: 'are'}, {name: 'many'}, {name: 'variations'}]);
    }

}

window.blocks.search = new Search();



