
/**
 * Fichier : view.js
 * @class View
 */
/*global qs, qsa, $on, $parent, $delegate */
(function (window) {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - render(command, parameterObject)
	 *     Renders the given command with the options
	 * @constructor
	 * @name View
	 * @param {Object} [template] The template for items
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
		this.$divToggle = qs('.div-toggleAll');

		this.$progressBar = qs('.progress-bar');
		this.$pourcentProgress = qs('#pourcentProgress');
	}

	/**
	* remove item from the list
	* @method
	* @private
	* @name View._removeItem
	* @param {string} [id] The ID of the item to remove
	*/
	View.prototype._removeItem = function (id) {
		const elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	* Show or hide the clear completed button
	* @method
	* @private
	* @name View._clearCompletedButton
	* @param {any} [completedCount] The number of completed todos.
	* @param {boolean} [visible] Set the visibility of the button
	*/
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'flex' : 'none';
	};

	/**
	 * Set filter
	 * @method
	 * @private
	 * @name View._setFilter
	 * @param {string} [currentPage] The current active route
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * set the view of a element completed
	 * @method
	 * @private
	 * @name View._elementComplete
	 * @param {number} [id] The ID of the item
	 * @param {object} [completed] The state of complete or not
	 */
	View.prototype._focus = function () {
		qs('.new-todo').focus();
	};

	View.prototype._elementComplete = function (id, completed) {
		const listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};

	/**
	* The edit view of an item 
	* @method
	* @private
	* @name View._editItem
	* @param {number} [id] The Id of the item
	* @param {string} [title] The Title of the item
	*/
	View.prototype._editItem = function (id, title) {
		const listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		const input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	* The edit view of an item done
	* @method
	* @private
	* @name View._editItemDone
	* @param {number} [id] The Id of the item
	* @param {string} [title] The Title of the item
	*/
	View.prototype._editItemDone = function (id, title) {
		const listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		const input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};


	/**
	* Render view
	* @method
	* @public
	* @name View.render
	* @param {string} [viewCmd] Name of the command
	* @param {object} [parameter] Parameters of the command
	*/
	View.prototype.render = function (viewCmd, parameter) {
		const self = this;
		const viewCommands = {
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
			checkboxToggleVisibility: function () {
				self.$divToggle.style.visibility = parameter.visible ? 'visible' : 'hidden';
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
			},
			progressBar: function () {
				self.$progressBar.style.width = `${parameter}%`;
				self.$pourcentProgress.innerText = `${parameter}%`;
			}
		};
		viewCommands[viewCmd]();
	};

	/**
	* View of Id item
	* @method
	* @private
	* @name View._itemId
	* @param {object} [element] The obejct to find parent node
	* @returns {number} The Id of the item
	*/
	View.prototype._itemId = function (element) {
		const li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * Handler Item Edit Done
	 * @method
	 * @private
	 * @name View._bindItemEditDone
	 * @param {function} [handler] function to fire
	 */
	View.prototype._bindItemEditDone = function (handler) {
		const self = this;
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

	/**
	* Handler Item Edit Cancel
	* @method
	* @private
	* @name View._bindItemEditCancel
	* @param {function} [handler] function to fire 
	*/
	View.prototype._bindItemEditCancel = function (handler) {
		const self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({ id: self._itemId(this) });
			}
		});
	};


	/**
	* Handler
	* @method
	* @public
	* @name View.bind
	* @param {string} [event] Event name
	* @param {function} [handler] function to fire  
	*/
	View.prototype.bind = function (event, handler) {
		var self = this;

		switch (event) {
			case 'newTodo':
				$on(self.$newTodo, 'change', function () {
					handler(self.$newTodo.value);
				});
				break;
			case 'removeCompleted':
				$on(self.$clearCompleted, 'click', function () {
					handler();
				});
				break;
			case 'toggleAll':
				$on(self.$toggleAll, 'click', function () {
					handler({ completed: this.checked });
				});
				break;
			case 'itemEdit':
				$delegate(self.$todoList, 'li label', 'dblclick', function () {
					handler({ id: self._itemId(this) });
				});
				break;
			case 'itemRemove':
				$delegate(self.$todoList, '.destroy', 'click', function () {
					handler({ id: self._itemId(this) });
				});
				break;
			case 'itemToggle':
				$delegate(self.$todoList, '.toggle', 'click', function () {
					handler({
						id: self._itemId(this),
						completed: this.checked
					});
				});
				break;
			case 'itemEditDone':
				self._bindItemEditDone(handler);
				break;
			case 'itemEditCancel':
				self._bindItemEditCancel(handler);
				break;
			default:
				return;
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
