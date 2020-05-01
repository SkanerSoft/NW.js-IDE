var Net;
if (typeof parent.Net !== 'undefined') Net = parent.Net;
else Net = new function () {

	this.post = function (url, data, func) {
		var ajax = new XMLHttpRequest();
		var fdata = '';

		_for(data, function(val, key) {
			fdata += key + '=' + encodeURIComponent(val) + '&';
		});

		ajax.open('POST', url, true);
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		ajax.onload = function (d) {
			func(d.target.responseText);
		};

		ajax.send(fdata);
	};

};