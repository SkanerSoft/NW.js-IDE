var Term;
if (typeof parent.Term !== 'undefined') Term = parent.Term;
else Term = new function () {
	var cp = require('child_process');
	var _Term = this;
	var term = null;
	var delm = Fs.delm;
	var command = '';

	this.log = null;

	var exe = null;

	_Term.system = function (cmd) {
		if (!exe) return;
		if (cmd === 'stop') exe.kill();

	};

	_Term.inter = function (cmd) {
		cmd = cmd.trim();

		if (in_arr(cmd, ['stop', 'restart'])) return _Term.system(cmd);

		if (exe) return;

		var starter = command = Project.path+'/'+cmd;

		if (!Fs.is_file(starter)) return _Term.msg('Файл '+cmd+' не найден', 'terminal_msg_err');

		exe = cp.fork('system/node.js', [
			starter,
			'--enable-logging=stderr',
			IDE.is_win()
		], {
			silent : true
		});

		exe.stdout.on('data', function(data) {
			_Term.msg(data);
		});

		exe.on('message', function(data) {
			_Term.msg(data);
		});

		exe.on('uncaughtException', function (data) {
			_Term.msg(data, 'terminal_msg_err');
		});

		exe.on('close', function (data) {
			_Term.msg('Процесс остановлен. Код выхода '+(data ? data : '0'));
			exe = null;
		});

		exe.on('error', function (data) {
			_Term.msg('Ошибка запуска '+data, 'terminal_msg_err');
			exe = null;
		});
	};

	_Term.cmd = function (c) {
		if (!c) return;
		_Term.msg(c, 'terminal_msg_cmd');
		_Term.inter(c);
	};

	_Term.msg = function (msg, cn) {
		var m = $create('div');
		m.innerHTML = msg;
		if (cn) m.className = cn;
		this.log.appendChild(m);
		this.log.scrollTop = this.log.scrollHeight;
	};

	_Term.open = function () {
		if (term) return term.focus();
		Debug.msg('Терминал открыт');
		$select('_btn_term_debug');

		IDE.GUI.Window.open('pages/term.html', {
			width : 500,
			height : 150
		}, function (w) {
			term = w;
			term.window.parent = IDE.window;
			term.window.Project = Project;

			W.focus();

			term.on('close', function() {
				if (exe) exe.kill();
				term = null;
				_Term.close();
				this.hide();
				Debug.msg('Терминал закрыт');
			});

		});

	};

	_Term.close = function () {
		if (term) {
			term.close();
		}
		$unselect('_btn_term_debug');
	};

};