/**
 * 
 * @file This is the Todolist application documentation for the OpenClassRooms 8 project - Développeur d'application front-end
 * @author Mathieu GAUBAL-VATILINGON
 */



/** 
 * Initialisation of the application
 * @function
 */
/*global app, $on */
(function () {
	'use strict';

	/**
	 * Sets up a brand new Todo list.
	 *@function Todo
	 * @param {string} name The name of your new to do list.
	 */
	function Todo(name) {
		this.storage = new app.Store(name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.view = new app.View(this.template);
		this.controller = new app.Controller(this.model, this.view);
	}

	const todo = new Todo('todos-vanillajs');

	/**
     * Set the view
	 * exécute setView si l'url change
     * @function setView
     */
	function setView() {
		todo.controller.setView(document.location.hash);
	}

	/**
     * set the showProgressBar
	 * permet d'avoir la progression en pourcentage des tâches accomplies
     * @function showProgressBar
     */
	function showProgressBar(){
		todo.controller.progressBar();
	}

	/**
     * Set the focus
	 * permet d'appliquer un focus dès le lancement de l'application
     * @function focus
     */
	function focus(){
		todo.view._focus();
	}

	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
	$on(window, 'load', showProgressBar);
	$on(window, 'load', focus);
})();
