import page, {EVENTS} from '../page/page';
import storage from '../utils/storage';
import utils from '../utils/utils';

import './todo.css';

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

const STORAGE_KEY = 'gettab-todos';

class Todo {

    constructor() {
        this.$list = $('.todo-list');
        this.$popup = $(".todo");
        this.$input = $('.todo-input__input');
        this.$todoBadge = $(".todo-badge");

        this.init();
    }

    showPopup() {
        $(window).trigger(EVENTS.modalShow);
        this.$popup.addClass('todo_visible');
    }

    hidePopup() {
        this.$popup.removeClass('todo_visible');
    }

    init() {

        storage.get(STORAGE_KEY).then(todos => {
            this.todos = todos || [];

            this.todoTemplate = ({completed, id, title}) => `
                <div class="todo-item todo-item_completed_${completed ? 'yes' : 'no'}" data-id="${id}">
                    <div class="todo-item__toggle" ${completed ? 'checked' : ''}></div>
                    <div class="todo-item__label">
                        ${title}
                    </div>
                    <input class="todo-item__edit" value="${title}">
                    <div class="todo-item__destroy"></div>
                </div>
            `;

            // this.footerTemplate = Handlebars.compile($('#footer-template').html());

            this.bindEvents();
            this.render();
        });
    }

    bindEvents () {
        this.$input.on('keyup', this.create.bind(this));
        // $('#toggle-all').on('change', this.toggleAll.bind(this));
        // $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
        this.$list
            .on('click', '.todo-item', this.toggle.bind(this))
            // .on('dblclick', 'label', this.edit.bind(this))
            // .on('keyup', '.edit', this.editKeyup.bind(this))
            // .on('focusout', '.edit', this.update.bind(this))
            .on('click', '.todo-item__destroy', this.destroy.bind(this));

        $("#open-todo").on('click', () => this.showPopup());
        $(".todo-header__close").on('click', () => this.hidePopup());

        page.bindPopupHide('.todo, #open-todo', () => this.hidePopup());
    }

    render () {
        var todos = this.getFilteredTodos();
        this.$list.html(todos.map(todo => this.todoTemplate(todo)).join(''));
        // $('#main').toggle(todos.length > 0);
        // $('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
        // this.renderFooter();
        // this.$input.focus();
        storage.set(STORAGE_KEY, this.todos);

        if (this.getActiveTodos().length > 0) {
            this.$todoBadge.text(this.getActiveTodos().length);
            this.$todoBadge.addClass('todo-badge_visible');
        } else {
            this.$todoBadge.removeClass('todo-badge_visible');
        }
    }

    /*
    renderFooter () {
        var todoCount = this.todos.length;
        var activeTodoCount = this.getActiveTodos().length;
        var template = this.footerTemplate({
            activeTodoCount: activeTodoCount,
            activeTodoWord: util.pluralize(activeTodoCount, 'item'),
            completedTodos: todoCount - activeTodoCount,
            filter: this.filter
        });

        $('#footer').toggle(todoCount > 0).html(template);
    }
    */

    /*
    toggleAll (e) {
        var isChecked = $(e.target).prop('checked');

        this.todos.forEach(function (todo) {
            todo.completed = isChecked;
        });

        this.render();
    }
    */

    getActiveTodos () {
        return this.todos.filter(function (todo) {
            return !todo.completed;
        });
    }

    getCompletedTodos () {
        return this.todos.filter(function (todo) {
            return todo.completed;
        });
    }

    getFilteredTodos () {
        if (this.filter === 'active') {
            return this.getActiveTodos();
        }

        if (this.filter === 'completed') {
            return this.getCompletedTodos();
        }

        return this.todos;
    }

    /*
    destroyCompleted () {
        this.todos = this.getActiveTodos();
        this.filter = 'all';
        this.render();
    }
    */

    // accepts an element from inside the `.item` div and
    // returns the corresponding index in the `todos` array
    indexFromEl (el) {
        var id = $(el).closest('.todo-item').data('id');
        var todos = this.todos;
        var i = todos.length;

        while (i--) {
            if (todos[i].id === id) {
                return i;
            }
        }
    }

    create (e) {
        var $input = $(e.target);
        var val = $input.val().trim();

        if (e.which !== ENTER_KEY || !val) {
            return;
        }

        this.todos.push({
            id: utils.uuid(),
            title: val,
            completed: false
        });

        $input.val('');

        this.render();
    }

    toggle (e) {
        var i = this.indexFromEl(e.target);
        this.todos[i].completed = !this.todos[i].completed;
        this.render();
    }

    edit (e) {
        var $input = $(e.target)
            .closest('.todo-item')
            .addClass('todo-item_editing')
            .find('.todo-item__edit');

        $input
            .val($input.val())
            .focus();
    }

    editKeyup (e) {
        if (e.which === ENTER_KEY) {
            e.target.blur();
        }

        if (e.which === ESCAPE_KEY) {
            $(e.target).data('abort', true).blur();
        }
    }

    update (e) {
        var el = e.target;
        var $el = $(el);
        var val = $el.val().trim();

        if (!val) {
            this.destroy(e);
            return;
        }

        if ($el.data('abort')) {
            $el.data('abort', false);
        } else {
            this.todos[this.indexFromEl(el)].title = val;
        }

        this.render();
    }

    destroy (e) {
        this.todos.splice(this.indexFromEl(e.target), 1);
        this.render();
        return false;
    }

}

const todo = new Todo();
export default todo;
