var Legacy;
if (typeof parent.Legacy !== 'undefined') Legacy = parent.Legacy;
else Legacy = new function () {
	var _Legacy = this;
	var exe_file = '';
	var exe = null;
	var delm = Fs.delm;
	var devtools = false;

	this._console = {
		log : Debug.msg,
		error : Debug.err
	};

	this.is_exe = function () {
		return exe;
	};

	this.start = function () {
		Debug.clear();

		var pkg = Project.get_package();

		var main = is(pkg['main'], 'index.html');

		if (exe && exe_file === main) {

			if (pkg['devtools'] && !devtools) {
				try {
					exe.showDevTools();
					devtools = true;
				} catch (e) {
					Debug.err('Ошибка запуска консоли разработчика');
				}
			}

			if (typeof pkg['debug_on_top'] !== 'undefined') {
				exe.setAlwaysOnTop(!!pkg['debug_on_top']);
			}

			Joint.join();

			exe.reload();

			if (!is(pkg['liveedit'])) {
				exe.focus();
			}

			return;
		}

		if (exe && exe_file !== main) {
			_Legacy.stop();
		}

		$select('_btn_run_debug');

		if (!pkg['devtools']) {
			Debug.clear();
			Debug.open();
		}

		$show_hide('_btn_stop_debug', 'inline');

		Debug.msg('Запуск проекта...');

		exe_file = main;

		var opts = {
			width: pkg['width'] || 400,
			height: pkg['height'] || 150
		};

		if (!pkg['devtools']) {
			opts['inject_js_start'] = 'classes/debugger.js';
			opts['inject_js_end'] = 'classes/legacy_loader.js';
		}

		Joint.join();

		// RUN
		IDE.GUI.Window.open('file://'+Project.path+'/'+main, opts, function (w) {
			exe = w;
			W.focus();

			if (typeof pkg['debug_on_top'] !== 'undefined') {
				exe.setAlwaysOnTop(!!pkg['debug_on_top']);
			}

			var old_pos = Project.get('old_win_pos');
			if (old_pos && old_pos.x && old_pos.y) {
				exe.moveTo(int(old_pos.x), int(old_pos.y));
			}

			if (pkg['devtools']) {
				try {
					exe.showDevTools();
					devtools = true;
				} catch (e) {
					Debug.err('Ошибка запуска консоли разработчика');
				}
			}

			exe.on('navigation', function (frame, url, policy) {
				policy.ignore();
				$go(url);
			});

			exe.on('new-win-policy', function (frame, url, policy) {
				policy.ignore();
				$go(url);
			});

			if (!pkg['devtools']) {
				exe.on('loaded', function () {
					exe.window._Legacy.Legacy = Legacy;
					exe.window._Legacy.run();
				});
			}

			exe.on('close', function () {
				try {
					exe.closeDevTools();
					devtools = false;
				} catch (e) {
				}

				Project.set('old_win_pos', {x: exe.window.screenLeft, y: exe.window.screenTop});
				Project.save_project();

				this.hide();
				this.close(true);
				exe = false;
				Debug.msg('Процесс остановлен');
				Legacy.stop();
			});

		});

	};

	this.stop = function () {
		$unselect('_btn_run_debug');
		$show_hide('_btn_stop_debug', 'none');

		if (Sett.get('debug_auto_close'))
			Debug.close();

		IDE.focus();

		if (exe) {
			exe.close();
		}
	};

};