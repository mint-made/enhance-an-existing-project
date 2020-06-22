/*jshint laxbreak:true */
(function (window) {
	'use strict';

	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	/**
	 * Sets up defaults for all the Template methods such as a default template
	 *
	 * @constructor
	 */
	function Template() {
		this.defaultTemplate
			= '<li data-id="{{id}}" class="{{completed}}">'
			+ '<div class="view">'
			+ '<input class="toggle" type="checkbox" {{checked}}>'
			+ '<label>{{title}}</label>'
			+ '<button class="destroy"></button>'
			+ '</div>'
			+ '</li>';
	}

	/**
	 * Creates an HTML string with the data that is passed to the function and returns it for placement in your app.
	 *
	 * @param {object} data The object containing keys you want to find in the template to replace.
	 * @returns {string} HTML String of an element
	 *
	 * @example
	 * view.show({
	 *	id: 1,
	 *	title: "Washing-up",
	 *	completed: false,
	 * });
	 */
	Template.prototype.show = function (data) {
		var i, l;
		var view = '';

		for (i = 0, l = data.length; i < l; i++) {
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';

			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}

			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		}

		return view;
	};

	/**
	 * Displays a counter of how many to dos are left to complete with the text changed when a single todo remains
	 *
	 * @param {number} activeTodos The number of active todos.
	 * @returns {string} String containing the count
	 * 
	 * @example itemCounter(3); //returns "<strong>3</strong> items left"
	 * itemCounter(1); //returns "<strong>1</strong> item left"
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		var plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};

	/**
	 * Updates the text within the "Clear completed" button depending on number of completed todos
	 *
	 * @param  {number} completedTodos The number of completed todos.
	 * @returns {string} String containing: "" | "Clear completed"
	 * 
	 * @example clearCompletedButton(0) // returns: ""
	 * clearCompletedButton(1) // returns: "Clear completed"
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		console.log("template.clearCompletedButton", completedTodos)
		if (completedTodos > 0) {
			console.log("clear Completed")
			return 'Clear completed';
		} else {
			console.log("")
			return '';
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
