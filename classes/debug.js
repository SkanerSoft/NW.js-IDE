var Debug;
if (typeof parent.Debug !== 'undefined') Debug = parent.Debug;
else Debug = new function () {
	var delm = Fs.delm;
	var cp = require('child_process');
	var spawn = cp.spawn;

	var exe = null;

	var parse = function (str) {
		str = str.toString().replace(/^.*?(WARNING|INFO|CONSOLE).*?\]/, 'log: ');
		if (str.match(/source: chrome-extension/)) {
			str = str.replace(new RegExp('source.*?'+delm+'+.*?'+delm), '');
		}
		return str;
	};

	var message = function (text, _class) {
		var d = $create('div');
		d.className = 'debug_message'+(_class ? ' '+_class : '');
		d.innerHTML = parse(text);
		$('debug').appendChild(d);

		$('debug').scrollTop = $('debug').scrollHeight;
	};

	var _activate = function () {
		if (!$('_btn_console_debug')) return;
		var v = $('debug').style.display !== 'none';
		if (v) {
			if (!$('_btn_console_debug').className.match(/running/)) $('_btn_console_debug').className += ' running';
		} else {
			$('_btn_console_debug').className = $('_btn_console_debug').className.replace(' running', '');
		}
	};

	var clear = this.clear = function () {
		$('debug').innerHTML = '';
	};

	this.open_close = function () {
		$show_hide('debug');
		_activate();
	};

	this.open = function () {
		$show_hide('debug', 'block');
		_activate();
	};

	this.close = function () {
		$show_hide('debug', 'none');
		_activate();
	};

	this.msg = function (str) {
		message(str);
	};

	this.err = function (str) {
		message(str, 'debug_error');
	};

	this.stop = function () {
		if (!exe) return;
		exe.kill();
	};

	this.start = function () {
		if (exe) return;
		var nw_path = IDE.get_conf('nw_path');

		if (!nw_path || !Fs.is_file(nw_path)) {
			this.open();
			this.err('Не найден исполняймый файл nw.js. Пожалуйста, проверьте настройки IDE');
			return;
		}

		$show_hide('_btn_stop_debug', 'inline');
		$show_hide('debug', 'block');
		$('_btn_run_debug').className += ' running';
		_activate();

		clear();

		message('Запуск проекта...');

		Joint.join();

		exe = spawn(nw_path, [Project.path, '--enable-logging=stderr']);

		exe.stdout.on('data', function (data) {
			message(data);
		});

		exe.stderr.on('data', function (data) {
			message(data);
		});

		exe.on('close', function (data) {
			message('Процесс остановлен. Код выхода '+data);
			$show_hide('_btn_stop_debug', 'none');
			exe = null;
			$('_btn_run_debug').className = $('_btn_run_debug').className.replace(' running', '');
			if (Sett.get('debug_auto_close'))
				Debug.close();
		});

		exe.on('error', function (data) {
			message('Ошибка запуска '+data.toString().replace(/spawn/, 'команда').replace(/ENOENT/, 'не найдена').replace(/Error/, ''));
			$show_hide('_btn_stop_debug', 'none');
			exe = null;
			$('_btn_run_debug').className = $('_btn_run_debug').className.replace(' running', '');
			if (Sett.get('debug_auto_close'))
				Debug.close();
		});

	};
};