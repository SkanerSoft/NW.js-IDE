var ISWIN = process.argv[4] === 'true';
var delm = ISWIN ? '\\' : '/';

if (ISWIN) {
	var _console = {
		log : function () {
			var a = '', i = 0;
			for (;i<arguments.length; i+=1) {
				if (i) a+= ', ';
				a += arguments[i];
			}
			process.send(a);
		}
	};

	_console.error = _console.log;
	_console.info = _console.log;
	global.console = _console;
}

var _PARSE_ERROR_16 = function (e) {
	var err = '';
	err = e.stack.split('\n');
	return '<b>'+err[0]+'</b>'+err[1];
};

process.on('error', function (e) {
	console.log(_PARSE_ERROR_16(e));
});

process.on('uncaughtException', function (e) {
	console.log(_PARSE_ERROR_16(e));
});

require(process.argv[2]);
