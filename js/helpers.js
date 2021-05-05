/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * Get element by CSS selector:
	 * @function
	 * @name qs
	 * @param {string} [selector] the CSS selector
	 * @param {object} [scope] the scope where to find the bject
	 * @returns {Object} the element where the selector match
	*/
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * Get elements by CSS selector:
	 * @function
	 * @name qsa
	 * @param {string} [selector] the selector to find objects
	 * @param {object} [scope] the scope where to find objects
	 * @returns {Object} elements where the selector match
	*/
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * addEventListener wrapper:
	 * @function
	 * @name $on
	 * @param {object} [target] the object to bind the event
	 * @param {string} [type] the type of the event to bind
	 * @param {function} [callback] the callback to run when the event fired
	 * @param {boolean|undefined} useCapture force mouse capture
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	/**
	 * Attach a handler to event for all elements that match the selector,
	 * now or in the future, based on a root element
	 * @function
	 * @name $delegate
	 * @param {object} [target] the object to bind the event
	 * @param {string} [selector] the selector to find objects
	 * @param {string} [type] the type of the event to bind
	 * @param {function} [handler] the callback to run when the event fired
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			const targetElement = event.target;
			const potentialElements = window.qsa(selector, target);
			const hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		const useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	/**
	 * Find the element's parent with the given tag name:
	 * $parent(qs('a'), 'div');
	 * @function 
	 * @name $parent
	 * @param {object} [element] Object to find his parent node
	 * @param {string} [tagName] Tag name of the parent node to find
	 * @returns {object} the parent node
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	/**
	 * Allow for looping on nodes by chaining:
	 * qsa('.foo').forEach(function () {})
	 * @alias Array.forEach
	 */
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
