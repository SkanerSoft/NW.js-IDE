var Session;
if (typeof parent.Session !== 'undefined') Session = parent.Session;
else Session = new function () {
	var data = {};

	this.set = function (key, val) {
		data[key] = val;
	};

	this.get = function (key) {
		return data[key];
	};

	this.cash_file = function (path) {
		if (!data[path]) data[path] = Fs.read_file(path, 'json');
		return data[path];
	};

};