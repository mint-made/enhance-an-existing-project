/*global NodeList */

(function (window) {
	'use strict';

	// Get element(s) by CSS selector:

	/**
	 * Search and select a <b>single</b> element from the document or specified scope
	 * @param {string} selector with which to search the scope or document
	 * @param {HTMLElement} scope within which to search e.g. within the (ul.todo-list) element. If no scope is present, the query selector will instead search within the document
	 * @name qs
	 */
	window.qs = function (selector, scope) {
		console.log("qs, typof", selector, typeof (selector));
		return (scope || document).querySelector(selector);
	};
	/**
	 * Search and select <b>multiple</b> elements from the document or specified scope
	 * @param {string} selector with which to search the scope or document
	 * @param {HTMLElement} scope scope within which to search e.g. within the (ul.todo-list) element. If no scope is present, the query selector will instead search within the document
	 * @name qsa
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/** 
	 * This function adds an addEventListener wrapper:
	 * @param {object} target the html element that that event listener is added to
	 * @param {string} type the event type e.g. "click", "mouseover", "change"
	 * @param {function} callback the event listener callback function to be called when the event is triggered
	 * @param {boolean} useCapture optional parameter that changes the order in which multiple handlers for the same event are executed
	 * @name $on
	 * 
	 * @example $on(qs(".toggle-all"), "click", function(status) { 
	 * 	self.toggleAll(status.completed); //status = {completed: boolean}
	 * }); //callback is triggered when .toggle-all has an event: "click"
	 */
	window.$on = function (target, type, callback, useCapture) {
		console.log("$on", target, type, callback, "useCapture", useCapture, "typof target", typeof (target));
		target.addEventListener(type, callback, !!useCapture);
	};
	/** 
	 * Attach a handler to event for all elements that match the selector,
	 * now or in the future, based on a root element
	 * @param {object} target the html element that that event listeners will be added within, used as a scope for $qsa
	 * @param {string} selector to select elements with using the $qsa function
	 * @param {string} type the event type e.g. "click", "mouseover", "change"
	 * @param {function} handler the event listener callback function to be called when the event is triggered
	 * @name $delegate
	 * 
	 */
	window.$delegate = function (target, selector, type, handler) {
		console.log("$delegate", target, selector, type, handler);
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};


	/** 
	 * Find the element's parent with the given tag name
	 * @param {object} element html element
	 * @param {string} tagName tag name
	 * @name $parent
	 * @returns {object} parent of the html element passed to the function
	 * @example $parent(qs('a'), 'div');
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
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
