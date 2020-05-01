var Sett;
if (typeof parent.Sett !== 'undefined') Sett = parent.Sett;
else Sett = new function () {

	var settings = {
		ide_theme : 'ide_violet',
		editor_theme : 'nwjside',
		editor_tab_size : 2,
		editor_use_soft_tabs : true,
		editor_font_size : 14
	};

	this.save = function () {
		Fs.write_file(Fs.home+Fs.delm+'settings.json', JSON.stringify(settings));
	};

	this.load = function () {
		if (Fs.is_file(Fs.home+'/settings.json'))
			settings = JSON.parse(Fs.read_file(Fs.home+'/settings.json').toString());
	};

	this.set = function (key, val) {
		settings[key] = val;
	};

	this.get = function (key) {
		return settings[key];
	};

	this.all = function () {
		return settings;
	};


	var installing = false;
	this.install_nw = function (area, input, _SAVE) {

		var is_mac = !!IDE.platform().match(/darwin/);

		if (is_mac) {
			Debug.open();
			Debug.msg('Для Mac OS систем работает только ручная установка NW.js');
			return;
		}

		if (installing) return;
		installing = true;
		var colors = [
			'#a85650', '#a867a0', '#4e80a8', '#52a848', '#a88c37'
		], i = 0;
		var state = 0;
		var gif = $create('span');
		gif.style.cssText = 'padding: 3px 11px; background: white; border-radius: 50%; transition-duration: 200ms;';

		var state_label = $create('span');
		state_label.style.marginLeft = '5px';

		area.style.paddingTop = '5px';
		area.style.textAlign = 'center';

		area.appendChild(gif);
		area.appendChild(state_label);

		var anim = function () {

			if (state === 2)
				state_label.innerHTML = 'Распаковка NW.js';
			else if (state === 3)
				state_label.innerHTML = 'Готово!';

			gif.style.backgroundColor = colors[i];
			i+=1;
			if (i > colors.length - 1) i = 0;

			if (state === 3) return;
			setTimeout(function () {
				anim();
			}, 1000);
		};

		anim();



		// installing //////////////////
		var getter = new XMLHttpRequest();
		getter.open('GET', 'http://nwjs.ru/dl/versions.json');
		getter.onload = function () {

			var vers = JSON.parse(getter.responseText)['stable'];

			var win32 = 'nwjs-'+vers+'-win-ia32';
			var win64 = 'nwjs-'+vers+'-win-x64';
			var lin32 = 'nwjs-'+vers+'-linux-ia32';
			var lin64 = 'nwjs-'+vers+'-linux-x64';

			var links = {
				win32 : 'http://nwjs.ru/dl/'+vers+'/'+win32+'.zip',
				win64 : 'http://nwjs.ru/dl/'+vers+'/'+win64+'.zip',
				lin32 : 'http://nwjs.ru/dl/'+vers+'/'+lin32+'.tar.gz',
				lin64 : 'http://nwjs.ru/dl/'+vers+'/'+lin64+'.tar.gz'
			};

			var x64 = !!IDE.OS.arch().match(/64/);
			var is_win = IDE.is_win();

			var link = '';
			var arname = x64 ? (is_win ? win64 : lin64) : (is_win ? win32 : lin32);
			var exename = is_win ? 'nw.exe' : 'nw';

			if (is_win) {
				link = links[x64 ? 'win64' : 'win32'];
			} else {
				link = links[x64 ? 'lin64' : 'lin32'];
			}

			var cur_path = Fs.parse_dir(Fs.dp(process.execPath))['back'];

			var to_dir = Fs.dp(cur_path+'/nw_dist');

			Debug.msg('Создание папки '+to_dir+'...');

			Fs.add_dir(to_dir);

			if (Fs.is_dir(to_dir+'/nwjs')) {
				Fs.del_full_dir(to_dir+'/nwjs');
			}

			Debug.msg('Скачивание архива: '+link);
			Fs.download(link, to_dir+'/archiv', function (progress) {
				state = 1;
				state_label.innerHTML = 'Скачивание NW.js ('+progress+'%)';
			}, function () {
				state = 2;
				state_label.innerHTML = 'Готово';
				Debug.msg('Распаковка архива');
				Fs.unpack(to_dir+'/archiv', to_dir, is_win ? 'zip' : 'tar.gz', function () {
					state = 3;
					Fs.del_file(to_dir+'/archiv');
					Fs.rename(to_dir+'/'+arname, to_dir+'/nwjs');
					input.value = to_dir+'/nwjs/'+exename;
					setTimeout(function () {
						area.innerHTML = '';
						installing = false;
						Debug.msg('Установка завершена. Не забудьте сохранить настройки!');
						_SAVE();
					}, 1000);
				});
			}, function (msg) {
				state = 5;
				state_label.innerHTML = 'Ошибка скачивания: '+msg;
			});
		};

		getter.send();
		////////////////////////////////
	};

};