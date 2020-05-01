var NodeJS;
if (typeof parent.NodeJS !== 'undefined') NodeJS = parent.NodeJS;
else NodeJS = new function () {
	var delm = Fs.delm;
	var cp = require('child_process');
	var fork = cp.fork;

	var exe = null;


	this.stop = function () {
		if (!exe) return;
		exe.kill();
	};

	this.start = function () {
		if (exe) return exe.kill();

		Debug.clear();
		Debug.open();

		Joint.join();

		if (!Fs.is_file(Project.path+'/package.json')) return Debug.err('Отсутствует файл package.json в корне проекта');
		// var starter = JSON.parse(Fs.read_file(Project.path+'/package.json'))['main'];
		var starter = Project.path;
		if (!starter) return Debug.err('Отсутствует или не указано поле "main" в файле package.json');
		// if (!Fs.is_file(Project.path+'/'+starter)) return Debug.err('Отсутствует файл '+starter);

		$select('_btn_run_debug');
		Debug.msg('Запуск проекта...');
		$show_hide('_btn_stop_debug', 'inline');

		exe = fork('system/node.js', [
			starter,
			'--enable-logging=stderr',
			IDE.is_win()
		], {
			silent : true
		});

		exe.stdout.on('data', function(data) {
			Debug.msg(data);
		});

		exe.on('message', function(data) {
			Debug.msg(data);
		});

		exe.on('uncaughtException', function (data) {
			Debug.err(data);
		});

		exe.on('close', function (data) {
			Debug.msg('Процесс остановлен. Код выхода '+(data ? data : '0'));
			$show_hide('_btn_stop_debug', 'none');
			exe = null;
			$unselect('_btn_run_debug');
		});

		exe.on('error', function (data) {
			Debug.err('Ошибка запуска '+data);
			$show_hide('_btn_stop_debug', 'none');
			exe = null;
			$unselect('_btn_run_debug');
		});

	};

};