/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	function Store(name, callback) {
		//callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback && callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Finds items based on a query given as a JS object
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback	 The callback to fire when the query has
	 * completed running
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		/* 		if (!callback) {
					return;
				} */


		var todos;
		callback && (todos = JSON.parse(localStorage[this._dbName]).todos, callback.call(this, todos.filter(function (todo) {

			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		})));
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () { };
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 *
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (updateData, callback, id) {

		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var newId = "";

		callback = callback || function () { };

		function generateId() {
			// Generate an ID
			var charset = "0123456789";
			for (var i = 0; i < 10; i++) {
				newId += charset.charAt(Math.floor(Math.random() * charset.length));
			}
			return newId;
		}

		const assignationId = (bool, newId) => {
			updateData.id = bool ? parseInt(generateId()) : parseInt(newId);
			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}


		// If an ID was actually given, find the item and update each property
		if (id) {
			for (var i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (var key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {

			// Assign an ID
			// creer une verification des ids pour eviter les conflits
			let arrayIdTodo = [];
			if (data.todos.length > 0) {
				let id;

				for (let todo of data.todos) {
					arrayIdTodo.push(todo.id.toString());
				}

				this.duplicate(arrayIdTodo);

				let toContinue = true;
				while (toContinue) {
					newId = "";
					id = generateId();
					if (!arrayIdTodo.includes(id)) {
						toContinue = false;
					}
				}
				assignationId(false, id);
			} else {
				assignationId(true);
			}
		}
	};

	Store.prototype.duplicate = function (array) {
			let arr = array;
			// empty object
			let map = {};
			let result = false;
			for (let i = 0; i < arr.length; i++) {
				// check if object contains entry with this element as key
				if (map[arr[i]]) {
					result = true;
					// terminate the loop
					break;
				}
				// add entry in object with the element as key
				map[arr[i]] = true;
			}
			if (result) {
				console.log('Array contains duplicate elements');
			} else {
				console.log('Array does not contain duplicate elements');
			}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;
		var todoId;

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == id) {
				todoId = todos[i].id;
			}
		}

		for (var i = 0; i < todos.length; i++) {
			if (todos[i].id == todoId) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Will drop all storage and start fresh
	 *
	 * @param {function} callback The callback to fire after dropping the data
	 */
	Store.prototype.drop = function (callback) {
		var data = { todos: [] };
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);