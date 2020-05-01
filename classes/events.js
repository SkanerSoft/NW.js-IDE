var Events;
if (typeof parent.Events !== 'undefined') Events = parent.Events;
else Events = new function () {
	var _Events = this;
	var events = {
		'app:init' : [],

		'ide:init' : [],
		'ide:close' : [],

		'dialog:opened' : [],

		'files:updated' : [],
		'files:context_opened' : [],

		'pages:select' : [],
		'pages:closed' : [],
		'pages:added' : [],

		'project:created' : [],
		'project:retype' : [],
		'project:opened' : [],

		'context:opened' : [],
		'context:closed' : [],
		'context:init' : [],

		'page:loaded' : [],
		'editor:init' : [],
		'editor:loaded_tool_list' : [],
		'editor:loaded' : []
	};

	_Events.add = function (event, key, func) {
		if (!events[event]) events[event] = [];
		events[event].push({
			key : key,
			func : func
		});
	};

	_Events.del = function (event, key) {
		if (!key || !events[event]) return;
		_for(events[event], function (_event, i) {
			if (_event['key'] === key) {
				events[event].splice(i, 1);
				return 'break';
			}
		});
	};

	_Events.clear = function (event) {
		if (!events[event]) return;
		delete events[event];
	};

	_Events.run = function (event, p1,p2,p3,p4,p5,p6,p7,p8,p9) {
		if (!events[event]) return;
		_for (events[event], function (_event) {
			if (typeof _event['func'] === 'function') {
				_event['func'](p1,p2,p3,p4,p5,p6,p7,p8,p9);
			}
		});
	};

};