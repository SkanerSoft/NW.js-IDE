var _Legacy = new function () {
	var log = [];
	var _Legacy = this;

	this.log = function (s) {
		if (_Legacy.Legacy) return _Legacy.Legacy._console.log(s);
		log.push([s, false]);
	};

	this.error = function (s) {
		if (_Legacy.Legacy) return _Legacy.Legacy._console.error(s);
		log.push([s, true]);
	};

	var var_info = function (s) {
		if (typeof s === 'string') return s+' (string)';
		if (typeof s === 'number') return s+' (number)';
		if (typeof s === 'function') return 'Function (function)';
	};

	var dump = function (s, lvl) {
		if (!lvl) lvl = '&nbsp;';
		if (typeof s === 'object') {
			var i, d = '', q1 = '', q2 = '', endl = '';
			for (i in s) {
				if (s[i] === null || s[i] === s) continue;
				if (typeof s[i] === 'object') {
					q1 += 'length' in s[i] ? '[ (array)' : '{ (object)';
					q2 += 'length' in s[i] ? ']' : '}';
					endl = '<br>';
				}
				d += '<br>'+lvl+i+' : '+q1+dump(s[i], lvl+'&nbsp;&nbsp;')+endl+lvl+q2;
			}
			return d;
		} else {
			return var_info(s);
		}
	};

	this.dump = function (s) {
		var a = '', b = '', lvl = '';
		if (typeof s === 'object') {
			a = '{';
			b = '<br>}';
			lvl = '&nbsp;';
		}
		_Legacy.log(a+dump(s, lvl)+b);
	};

	this._console = {
		log : _Legacy.log,
		error : _Legacy.error,
		info : _Legacy.add,
		warn : _Legacy.add,
		dump : _Legacy.dump
	};

	this.run = function () {
		while (log.length) {
			var s = log.shift();
			if (s[1]) _Legacy.Legacy._console.error(s[0]);
			else _Legacy.Legacy._console.log(s[0]);
		}
	};

	_Legacy.Legacy = null;
};

window.console = _Legacy._console;
window.onerror = _Legacy.error;

window.addEventListener('keydown', function (e) {
	if (e.keyCode === 27) {
		window.close();
	}
});