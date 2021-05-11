/*global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	let subject, model, view;

	const setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {
	
			const todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {

				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);

	});


	it('should show entries on start-up', function () {
		// TODO: write test
		const todos = {};
		setUpModel([todos]);
		subject.setView('');
		expect(view.render).toHaveBeenCalledWith('showEntries', [todos]);
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{ title: 'my todo', completed: true }]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = { id: 42, title: 'my todo', completed: true };
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
		const todos = [{ title: 'todo 1', id: 52, completed: false }, { title: 'todo 2', id: 54, completed: true }];

		setUpModel([todos]);
		subject.setView('#/');
		expect(view.render).toHaveBeenCalledWith('setFilter', '');
	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		const todos = [{ title: 'todo 1', id: 52, completed: false }, { title: 'todo 2', id: 54, completed: true }];

		setUpModel([todos]);
		subject.setView('#/active');
		expect(view.render).toHaveBeenCalledWith('setFilter', 'active');
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = { title: 'my todo' };
			setUpModel([todo]);
			subject.setView('');
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = { title: 'my todo' };
			setUpModel([todo]);

			subject.setView('#/');
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			// TODO: write test
			const todo = { title: 'faire la vaisselle', completed: false, id: 50 };
			setUpModel([todo]);
			subject.setView('#/active');
			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show completed entries', function () {
			// TODO: write test
			const todo = [{ title: 'faire la vaisselle', completed: true, id: 50 }, { title: 'préparer le diner', completed: true, id: 49 }];
			setUpModel(todo)
			subject.setView('#/completed');

			// je compte le nombre de tâches terminées
			let todosFiltered;
			model.getCount(function (data) {
				todosFiltered = data;
			})
			
			expect(todosFiltered.completed).toBe(2);
			expect(view.render).toHaveBeenCalledWith('setFilter', "completed");
			expect(view.render).toHaveBeenCalledWith('showEntries', todo);
			expect(view.render).toHaveBeenCalledWith('updateElementCount', todosFiltered.active );
			expect(view.render).toHaveBeenCalledWith('clearCompletedButton', { completed: todosFiltered.completed, visible:todosFiltered.completed > 0 });
			expect(view.render).toHaveBeenCalledWith('toggleAll', { checked: todosFiltered.completed === todosFiltered.total });
			expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', { visible: todosFiltered.total > 0 });
			expect(view.render).toHaveBeenCalledWith('checkboxToggleVisibility', { visible: todosFiltered.total > 0 });
		});
	});

	describe('toggle all', function () {
		const todos = [{ title: 'todo 1', id: 52, completed: false }];

		it('should toggle all todos to completed', function () {
			// TODO: write test
			setUpModel(todos);
			subject.setView('');
			view.trigger('toggleAll', { completed: true });
			expect(model.read).toHaveBeenCalledWith({ completed: !true }, jasmine.any(Function));
			todos[0].completed = true;
			expect(view.render).toHaveBeenCalledWith('elementComplete', { id:todos[0].id, completed:todos[0].completed});
			
		});

		it('should update the view', function () {
			// TODO: write test
			setUpModel(todos);
			subject.setView('');
			view.trigger('toggleAll', { completed: true });
			expect(model.update).toHaveBeenCalledWith(52, { completed: true }, jasmine.any(Function));
		});
	});

	describe('new todo', function () {
		const todo = [{ title: 'todo 1', id: 52, completed: false }];
		it('should add a new todo to the model', function () {
			// TODO: write test
			setUpModel([todo]);
			subject.setView('');
			view.trigger('newTodo', todo[0].title);
			expect(model.create).toHaveBeenCalledWith(todo[0].title, jasmine.any(Function));
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);
			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		it('should remove an entry from the model', function () {
			// TODO: write test
			const todo = { id: 21, title: 'my todo', completed: true };
			setUpModel([todo]);
			subject.setView('');
			view.trigger('itemRemove', { id: 21 });
			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove an entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', { id: 42 });

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {
		it('should remove a completed entry from the model', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({ completed: true }, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 21, completed: true });

			expect(model.update).toHaveBeenCalledWith(21, { completed: true }, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = { id: 42, title: 'my todo', completed: true };
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', { id: 42, completed: false });

			expect(view.render).toHaveBeenCalledWith('elementComplete', { id: 42, completed: false });
		});
	});

	describe('edit item', function () {
		it('should switch to edit mode', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItem', { id: 21, title: 'my todo' });
		});

		it('should leave edit mode on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'new title' });
		});

		it('should persist the changes on done', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: 'new title' });

			expect(model.update).toHaveBeenCalledWith(21, { title: 'new title' }, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', { id: 21, title: '' });

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(view.render).toHaveBeenCalledWith('editItemDone', { id: 21, title: 'my todo' });
		});

		it('should not persist the changes on cancel', function () {
			var todo = { id: 21, title: 'my todo', completed: false };
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', { id: 21 });

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
