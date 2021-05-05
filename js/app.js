/*global app, $on */
(function () {
	'use strict';

	/**
	 * Sets up a brand new Todo list.
	 *
	 * @param {string} name The name of your new to do list.
	 */
	function Todo(name) {
		this.storage = new app.Store(name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.view = new app.View(this.template);
		this.controller = new app.Controller(this.model, this.view);
	}

	var todo = new Todo('todos-vanillajs');

	function setView() {
		todo.controller.setView(document.location.hash);
	}

	function showProgressBar(){
		todo.controller.progressBar();
	}

	function focus(){
		todo.view._focus();
	}

	$on(window, 'load', setView); // exécute setView quand la page aura fini de charger 
	$on(window, 'hashchange', setView); // exécute setView si l'url change
	$on(window, 'load', showProgressBar);
	$on(window, 'load', focus); // permet d'appliquer un focus dès le lancement de l'application
})();
