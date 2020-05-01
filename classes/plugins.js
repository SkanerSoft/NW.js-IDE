var Plugins;
if (typeof parent.Plugins !== 'undefined') Plugins = parent.Plugins;
else Plugins = new function () {
	var _Plugins = this;
	var delm = Fs.delm;

	var list = [];

	_Plugins.call = function (plugin, func_name, opts) {
		if (Fs.is_file(plugin+'/'+func_name+'.js')) {
			var config = Fs.read_file(plugin+'/config.json', 'json');
			var bin = new Function('CONFIG, PATH', 'OPTS', Fs.read_file(plugin+'/'+func_name+'.js').toString());
			bin(config, plugin, opts);
		}
	};

	_Plugins.call_all = function (func_name, opts) {
		_for(list, function (plugin) {
			if (Fs.is_file(plugin+'/'+func_name+'.js')) {
				var config = Fs.read_file(plugin+'/'+'config.json', 'json');
				var bin = new Function('CONFIG, PATH', 'OPTS', Fs.read_file(plugin+'/'+func_name+'.js').toString());
				bin(config, plugin, opts);
			}
		});
	};

	_Plugins.del = function (plugin) {
		plugin = dp(plugin);
		_for(list, function (p, i) {
			if (p === plugin) {
				list.splice(i, 1);
				return 'break';
			}
		});

		Dial.notify('Плагин удален из списка');
		_Plugins.save_all();
		Dial.need_restart();
	};

	_Plugins.add = function (path, clb) {
		if (!Fs.is_file(path+'/'+'package.json')) return Dial.notify('Неверный путь к плагину. Не найден файл package.json', 'notify_no');
		if (in_arr(path, list)) return Dial.notify('Такой плагин уже добавлен', 'notify_no');
		list.push(path);
		_Plugins.save_all();
		clb('success');
	};

	_Plugins.set = function (plugin, key, val) {
		if (Fs.is_file(plugin+'/config.json')) {
			var config = Fs.read_file(plugin+'/config.json', 'json');
			config[key] = val;
			Fs.write_file(plugin+'/config.json', JSON.stringify(config));
		}
	};

	_Plugins.get = function (plugin, key) {
		if (Fs.is_file(plugin+'/config.json')) {
			var config = Fs.read_file(plugin+'/config.json', 'json');
			if (!key) return config;
			return config[key];
		}
		return null;
	};

	_Plugins.save_all = function () {
		Fs.write_file(Fs.home+'/plugins.json', JSON.stringify(list));
	};

	_Plugins.get_all = function () {
		return list;
	};

	if (Fs.is_file(Fs.home+'/plugins.json')) {
		list = JSON.parse(Fs.read_file(Fs.home+'/plugins.json').toString());
	}
};