
/**
 * Fichier : model.js
 * @class Model
 */
/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 * @constructor
     * @name Store
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	function Store(name, callback) {
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
	 * @method
     * @public
     * @name Store.find
	 * @param {object} [query] The query to match against (i.e. {foo: 'bar'})
	 * @param {function} [callback]	 The callback to fire when the query has
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


		let todos;
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
	 * @method
     * @public
     * @name Store.findAll
	 * @param {function} [callback] The callback to fire upon retrieving data
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () { };
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 * @method
     * @public
     * @name Store.save
	 * @param {object} [updateData] The data to save back into the DB
	 * @param {function} [callback] The callback to fire after saving
	 * @param {number} [id] An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (updateData, callback, id) {

		const data = JSON.parse(localStorage[this._dbName]);
		const todos = data.todos;
	
		callback = callback || function () { };

		function generateId() {
			// Generate an ID
			return new Date().getTime();
		}

		// If an ID was actually given, find the item and update each property
		if (id) {
            let todo = todos.find(todo => todo.id === id);
            if (todo) {
                for (let key in updateData) {
                    todo[key] = updateData[key];
                }
            }

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {
			updateData.id = generateId();
			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 * @method
     * @public
     * @name Store.remove
	 * @param {number} [id] The ID of the item you want to remove
	 * @param {function} [callback] The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		const data = JSON.parse(localStorage[this._dbName]);
		const todos = data.todos;
		let todoId;

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
	 * @method
     * @public
     * @name Store.drop
	 * @param {function} [callback] The callback to fire after dropping the data
	 */
	Store.prototype.drop = function (callback) {
		const data = { todos: [] };
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);