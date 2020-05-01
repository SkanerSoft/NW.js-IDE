var Cmd;
if (typeof parent.Cmd !== 'undefined') Cmd = parent.Cmd;
else Cmd = new function () {
	var _Cmd = this;
	var panel = null;
	var back = null;

	var exe = null;

	var delm = Fs.delm;
	var cp = require('child_process');
	var spawn = cp.spawn;

	var list = [
		'ls %project_path%',
		'cat %active_file%',
		'git'
	];

	var proc = function (text) {
		return text.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
	};

	_Cmd.save = function () {
		Project.set('cmd_list', JSON.stringify(list));
	};

	_Cmd.load = function () {
		var l = Project.get('cmd_list');
		if (l) {
			list = JSON.parse(l);
		}
	};

	_Cmd.get = function () {
		return list;
	};

	_Cmd.stop = function () {
		if (!exe) return;
		exe.kill();
	};

	_Cmd.run = function (cmd) {
		if (!cmd) return;

		if (exe) {
			Debug.msg('Команда процессу: '+cmd);
			exe.stdin.write(cmd+'\n');
			// exe.stdin.end();
			return;
		}

		var macros = {
			'%project_path%' : Project.path,
			'%active_file%' : Pages.get_active_file_path()
		};

		cmd = cmd.split(/[\s\t]+/);
		var cmd_str = cmd.shift();

		var cmd_orig = cmd_str;

		var args = [];

		_for(cmd, function (c) {
			_for(macros, function (val, key) {
				c = c.replace(key, val);
			});
			cmd_orig += ' '+c;
			args.push(c);
		});

		Debug.open();
		Debug.msg('Запуск '+cmd_orig+'...');

		exe = spawn(cmd_str, args, {
			cwd : Project.path
		});

		exe.stdin.setEncoding('utf-8');

		exe.stdout.on('data', function (data) {
			Debug.msg(proc(data));
		});

		exe.stderr.on('data', function (data) {
			Debug.msg(proc(data));
		});

		exe.on('message', function (data) {
			Debug.msg(proc(data));
		});

		exe.on('close', function (data) {
			Debug.msg('Процесс остановлен. Код выхода '+data);
			exe = null;
		});

		exe.on('error', function (data) {
			Debug.err('Ошибка запуска '+data.toString().replace(/spawn/, 'команда').replace(/ENOENT/, 'не найдена').replace(/Error/, ''));
			exe = null;
		});

	};

	_Cmd.open_sett = function () {
		// noinspection JSAnnotator
		var cnt = `
			<div style="display: flex;">
				<textarea wrap="off" id="_cmd_edit_list" cols="50" rows="15"></textarea>
				<div style="flex: 1; padding: 0 10px;">
					%project_path% - путь к проекту<br>
					%active_file% - путь к файлу из текущей вкладки<br>
					
				</div>
			</div>
			<br>
			<div align="center"><button id="_cmd_edit_save" class="btn_pad">Сохранить</button></div>
		`;

		Dial.custom_dialog('Настройки макросов CLI', cnt);

		var mks = '';
		_for(list, function (l) {
			mks += l+'\n';
		});

		$('_cmd_edit_list').value = mks;

		$('_cmd_edit_save').onclick = function (e) {
			var mks = $('_cmd_edit_list').value.toString().split(/\n/);
			list = [];
			_for(mks, function (m) {
				m = m.trim();
				if (!m) return;
				list.push(m);
			});
			_Cmd.save();
			Dial.close();
			_Cmd.reopen();
		};
	};

	_Cmd.reopen = function () {
		_Cmd.open();
		_Cmd.open();
	};

	_Cmd.open = function () {
		if (panel) {
			$remove(panel);
			$remove(back);
			$unselect('_cmd');
			return panel = null;
		}

		_Cmd.load();

		back = Dial.back(true, 50);
		var p = $get_pos('_cmd');
		panel = $create('div');
		panel.className = 'cmd';

		// noinspection JSAnnotator
		panel.innerHTML = `
			<div style="display: flex;"><b style="flex: 1;">Выполнить CLI команду</b><button onclick="Cmd.open_sett();" class="btn_pad2">Настроить</button></div>
			<div style="margin-top: 5px; display: flex; flex-direction: column; align-items: stretch; height: 90%;">
				<div class="cmd_list" id="_cmd_list"></div>
				<div class="cmd_line"><input id="_cmd_line" type="text" style="flex: 1;"><button id="_cmd_stop" class="btn_pad">&#9209;</button><button id="_cmd_run" class="btn_pad">&#9658;</button></div>
			</div>
		`;
		$append(panel);

		var c_list = $('_cmd_list');
		var c_line = $('_cmd_line');
		var c_run = $('_cmd_run');

		_for(list, function (l) {
			var c = $create('div');
			c.style.cssText = 'display: flex;';

			var cmd = $create('div');
			cmd.innerHTML = l;
			cmd.className = 'cmd_command btn_pad';

			var run = $create('button');
			run.innerHTML = '&#9658;';
			run.className = 'btn_pad';

			cmd.onclick = function () {
				c_line.value = cmd.innerHTML;
			};

			run.onclick = function () {
				c_line.value = cmd.innerHTML;
				c_run.click();
			};

			$append(cmd, c);
			$append(run, c);
			$append(c, c_list);
		});

		$('_cmd_stop').onclick = function () {
			_Cmd.stop();
		};

		c_run.onclick = function (e) {
			_Cmd.run(c_line.value);
		};

		$pos(panel, W.innerWidth - $size(panel).x, p.bottom);
		$select('_cmd');

		$input_enter(c_line, c_run);

		back.onclick = function () {
			$unselect('_cmd');
			$remove(back);
			$remove(panel);
			panel = null;
		};

	};




};