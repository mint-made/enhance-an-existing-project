/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	     * View that abstracts away the browser's DOM completely.
	     * It has two simple entry points:
	     *
	     *   - bind(eventName, hsandler)
	     *     Takes a todo application event and registers the handler
	     *   - render(command, parameterObject)
	     *     Renders the given command with the options
	     */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');
		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};

	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * This function contains 11 different functions that render different parts of the DOM
	 * 
	 * @param {string} viewCmd is used as a key to access the different render functions e.g. "removeItem"
	 * @param {any} parameter provides data for the function e.g. an elementId(number) for the "removeItem" function
	 * 
	 * @example render("showEntries", {id: 54321, completed: true, title: "Shower"}); //parameter(object)
	 * @example render("removeItem", 54321); //parameter(number) - id of element to be removed
	 * @example render("updateElementCount", 5); //parameter(number) - number of active items
	 * @example render("clearCompletedButton", {completed: 3, visible: true}); //parameter(object)
	 * @example render("contentBlockVisibility", {visible: true}); //parameter(object)
	 * @example render("toggleAll", {checked: false}); //parameter(object)
	 * @example render("setFilter", "active"); //parameter(string) - "active", "completed" or ""
	 * @example render("clearNewTodo"); //parameter(undefined) - no parameter required
	 * @example render("elementComplete", {id: 54321, completed: true}); //parameter(object) 
	 * @example render("editItem", {id: 54321, title: "wash-uq"}); //parameter(object)
	 * @example render("editItemDone", {id: 54321, title: "wash-up"}); //parameter(object)
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		console.log("render *", viewCmd, "* paramenter: ", parameter, "type:", typeof (parameter));
		var viewCommands = {
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({ id: self._itemId(this) });
			}
		});
	};
	/**
	 * This function contains 8 different functions, each accessed using a different event parameter as a key. Each function adds an event listener to different DOM elements
	 * @param {string} event is used as a key to access the 8 different functions
	 * @param {function} handler is a callback function that is called when the event listener is triggered
	 * 
	 * @example bind("newTodo", function(title){ 
	 *  self.addItem(title); 
	 * });
	 * @example bind("itemEdit", function(item) {
	 *  self.editItem(item.id);
	 * });
	 * @example bind("itemEditDone", function(item) {
	 *  self.editItemSave(item.id, item.title);
	 * });
	 * @example bind("itemEditCancel", function(item) {
	 *  self.editItemCancel(item.id);
	 * });
	 * @example bind("itemRemove", function(item) {
	 *  self.removeItem(item.id);
	 * });
	 * @example bind("itemToggle", function(item) {
	 *  self.toggleComplete(item.id, item.completed);
	 * });
	 * @example bind("removeCompleted", function() {
	 *  self.removeCompletedItems();
	 * });
	 * @example bind("toggleAll", function(item) {
	 *  self.editItemSave(item.id, item.title);
	 * });
	 */
	View.prototype.bind = function (event, handler) {
		console.log("bind *", event, "* handler: ", handler);
		var self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({ completed: this.checked });
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({ id: self._itemId(this) });
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({ id: self._itemId(this) });
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
