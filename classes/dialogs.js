var Dial;
if (typeof parent.Dial !== 'undefined') Dial = parent.Dial;
else Dial = new function () {
	this.dialog = null;
	var delm = Fs.delm;

	var dialog = function (title, inner, width, height, to_right) {
		if (!width) width = W.innerWidth / 2 + 'px';
		if (!height) height = W.innerHeight / 2 + 'px';

		if (to_right) {
			if (parseInt(width) < 300) width = '300px';
			height = W.innerHeight + 'px';
		}

		var b = $create('div');
		b.className = 'dialog_back';
		b.onclick = function () {
			Dial.close();
		};

		var d = $create('div');
		d.className = 'dialog';
		d.style.width = width;
		d.style.height = height;
		$B().appendChild(b);

		$B().appendChild(d);
		d.innerHTML = '<div class="dialog_top"><span class="dialog_title">'+title+'</span><span onclick="Dial.close();" class="dialog_close">&#10006;</span></div>'+
									'<div class="dialog_field"><div class="dialog_inner">'+inner+'</div></div>';

		(function () {
			var auto_sel = d.getElementsByTagName('input')[0];
			if (auto_sel) {
				auto_sel.focus();
			}
		})();

		if (!to_right) {
			d.style.left = (W.innerWidth-d.offsetWidth) / 2+'px';
			d.style.top = (W.innerHeight-d.offsetHeight) / 2+'px';
		} else {
			d.style.top = 0;
			d.style.left = W.innerWidth - d.offsetWidth + 'px';
		}

		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('dialog:opened', W, d);
		/////////////////////////////////////////////////////////////////

		Dial.dialog = {
			back : b,
			dialog : d
		};
	};

	var back = this.back = function (trans, zi) {
		var b = $create('div');
		b.className = trans ? 'dialog_back_trans' : 'dialog_back';
		if (zi) b.style.zIndex = zi;
		$append(b);
		return b;
	};

	this.color = function (clb, old_color) {
		var i = $create('input');
		i.type = 'color';

		if (old_color)
			i.value = old_color.length < 7 ? '#'+old_color : old_color;

		i.onchange = function (e) {
			clb(this.value);
		};

		i.click();
	};

	this.dir = function (path_def, clb) {
		var i = $create('input');
		i.type = 'file';
		i.nwdirectory = path_def ? path_def : true;
		i.value = '';

		i.onchange = function (e) {
			clb(Fs.dp(this.value));
		};

		i.click();
	};

	this.file = function (path_def, clb) {
		var i = $create('input');
		i.type = 'file';
		i.value = '';

		i.onchange = function (e) {
			clb(Fs.dp(this.value));
		};

		i.click();
	};

	this.save = function (path_def, clb) {
		var i = $create('input');
		i.type = 'file';
		i.value = '';
		i.nwsaveas = 'template.json';

		i.onchange = function (e) {
			clb(Fs.dp(this.value));
		};

		i.click();
	};

	this.custom_dialog = function (n, c, w, h, r) {
		dialog(n, c, w || 'auto', h || 'auto', r);
	};

	this.open_project = function () {
		Dial.dir('/', function (folder) {
			Project.open(folder);
		});
	};

	this.re_type_project = function () {
		'use strict';
		var opts = $opts_from_obj(IDE.get_types(), Project.get_type());
		var cnt = `
			<table class="font" style="margin: 10px;">
				<tr><td>Тип проекта <td> <select id="pr_type" style="width: 100%;">
																	`+opts+`
																</select>
				<tr><td>Наименование <td> <input type="text" id="pr_name" value="`+Project.get('name')+`">
			</table>
			<br>
			<div align="right"><button id="pr_set" class="btn_pad">Сохранить данные</button></div>
		`;

		dialog('Конфигурация проекта', cnt, 'auto', 'auto');

		$('pr_set').onclick = function () {
			Project.set('name', $('pr_name').value);
			Project.set('type', $('pr_type').value);
			Project.save_project();
			Project.reopen();
			Dial.close();
			// RUN EVENT ////////////////////////////////////////////////////
			Events.run('project:retype', W, Project);
			/////////////////////////////////////////////////////////////////
		};
	};

	this.import_template = function () {
		var cnt = '';



		dialog('Импорт шаблона', cnt, 'auto', 'auto');
	};

	this.create_template = function () {
		var cnt = '<table class="full_width">';

		var cats = Fs.read_file(Fs.home+'/templates.json', 'json').cats;
		cnt += '<tr><td>Категория<td><select class="full_width" id="_tpl_cat">';
		_for(cats, function (name, key) {
			cnt += '<option value="'+key+'">'+name+'</option>';
		});
		cnt += '</select>';

		cnt += '<tr><td>Наименование<td><input class="full_width" type="text" id="_tpl_name" value="'+Project.name+'">';
		cnt += '<tr><td>Логотип<td><input class="full_width" type="text" id="_tpl_screen" value="">';
		cnt += '<tr><td>Описание<td><textarea class="full_width" id="_tpl_desc" rows="5"></textarea>';

		var list = Fs.read_dir(Project.path);
		var tpl = {
			files : {}
		};

		_for(list.files, function (l) {
			var b64 = Fs.read_file(Project.path+'/'+l, 'base64');
			tpl.files[l] = b64;
		});

		cnt += '</table>';

		cnt += '<br><div align="center"><button id="_tpl_create" class="btn_pad">Создать шаблон</button></div>';

		dialog('Создание шаблона', cnt, '500px', 'auto');

		$('_tpl_create').onclick = function (e) {
			Dial.save('', function (path) {
				tpl.name = $('_tpl_name').value;
				tpl.desc = $('_tpl_desc').value;
				tpl.screen = $('_tpl_screen').value;
				tpl.cat = $('_tpl_cat').value;
				Fs.write_file(path, tpl, 'json');
				Dial.close();
				Dial.notify('Шаблон сохранен');
			});
		};
	};

	this.use_template = function (key) {
		Dial.close();
		var all = Fs.read_file(Fs.home+'/'+'templates.json', 'json');
		var tpl = all.list[key];
		if (!tpl) return;



		var cnt = '';



		dialog('Использование шаблона', cnt, 'auto', 'auto');
	};

	this.project_templates = function (server) {
		'use strict';
		var _path = Fs.home+'/'+'templates.json';
		var is_local = Fs.is_file(_path);

		var _gen = function (server) {
			var _parse = function (d, cat) {
				var cnt = `<div align="right" id="tpls_top_panel"></div><br>`;
				try {
					var all = JSON.parse(d);
					var cats = all.cats;
					var list = all.list;

					_for(list, function (l, key) {
						if (cat && cat !== l.cat) return;
						cnt += `
						<div class="template">
							<div class="t_left">
								<img src="`+l.screen+`">
							</div>
							<div class="t_right">
								<div class="as_flex">
									<b class="flex">`+l.name+`</b>
									<div>
										<button onclick="Dial.use_template('`+key+`');" class="btn_pad">Использовать</button>
									</div>
								</div>
								<div>`+l.desc+`</div>
							</div>
						</div>
					`;
					});

					// noinspection JSAnnotator
					cnt += ``;
				} catch (e) {
					cnt = 'Ошибка загрузки данных и сервера';
				}
				dialog('Шаблоны проектов', cnt, '90%', '90%');

				$button('tpls_top_panel', 'Обновить список', function () {
					Dial.close();
					Dial.project_templates(true);
				}, false, 'btn_pad');

				$button('tpls_top_panel', 'Импорт шаблона', function () {
					Dial.close();
					Dial.import_template();
				}, false, 'btn_pad');

				$button('tpls_top_panel', 'Создать шаблон из текущего проекта', function () {
					Dial.close();
					Dial.create_template();
				}, false, 'btn_pad');

			};

			if (server) {
				$ajax.get('http://localhost/nwjs.ru/api/get_templates.php', function (d) {
					Fs.write_file(_path, d);
					_parse(d);
				});
			} else {
				_parse(Fs.read_file(_path));
			}
		};

		_gen(!is_local || !!server);
	};

	this.del_file = function (path) {
		var cnt = 'Вы действительно хотите удалить файл?<br><b>'+path+'</b>';
		cnt += '<br><br><div align="center"><button id="_del_btn" class="btn_red btn_pad">Удалить</button></div>';
		dialog('Удалить файл?', cnt, 'auto', 'auto');
		$('_del_btn').onclick = function () {
			Pages.close_page(path);
			var s = Fs.del_file(path);
			Dial.close();
			Files.update();
			if (s)
				Dial.notify('Файл удален!');
		};
	};

	this.need_restart = function () {
		var cnt = 'Для продолжения необходимо перезагрузить IDE. Перезагрузить сейчас?<br>';
		cnt += '<br><br><div align="center"><button id="_del_btn" class="btn_pad">Перезагрузить</button></div>';
		dialog('Требуется перезагрузка', cnt, 'auto', 'auto');
		$('_del_btn').onclick = function () {
			IDE.restart();
		};
	};

	this.rename = function (path) {
		// noinspection JSAnnotator
		var cnt = `
			Введите новое название
			<br>
			<input class="full_width" type="text" value="`+path+`" id="new_name">
			<br><br>
			<div align="right"><button class="btn_pad" id="_rename">Переименовать</button></div>
		`;
		dialog('Переименовать', cnt, '600px', 'auto');
		$('_rename').onclick = function () {
			Fs.rename(path, $('new_name').value);
			Files.update();
			if (Fs.is_file($('new_name').value)) {
				var is_opened = Pages.find(path);
				if (is_opened) {
					Pages.close_page(path);
					Pages.add_page($('new_name').value);
				}
			}
			Dial.close();
		};
		$input_enter('new_name', '_rename');
	};

	this.duplicate = function (path) {
		// noinspection JSAnnotator
		var cnt = `
			Введите имя дублируемого файла
			<br>
			<input class="full_width" type="text" value="`+path+`" id="new_name">
			<br><br>
			<div align="right"><button class="btn_pad" id="_rename">Дублировать</button></div>
		`;
		dialog('Дублировать файл', cnt, '600px', 'auto');
		$('_rename').onclick = function () {
			if (path === $('new_name').value) return;
			Fs.duplicate(path, $('new_name').value);
			Files.update();
			Dial.close();
		};
		$input_enter('new_name', '_rename');
	};

	this.del_dir = function (path) {
		var cnt = 'Вы действительно хотите удалить папку?<br><b>'+path+'</b>';
		cnt += '<br><br><input type="checkbox" id="_as_no_empty"> Удалить даже если не пустая';
		cnt += '<br><br><div align="center"><button id="_del_btn" class="btn_red btn_pad">Удалить</button></div>';
		dialog('Удалить папку?', cnt, 'auto', 'auto');
		$('_del_btn').onclick = function () {
			var full = !!$('_as_no_empty').checked;
			if (!Fs.del_dir(path, full))
				Dial.notify('Не удалось удалить папку!', 'notify_no');
			else
				Dial.notify('Папка удалена!');
			Dial.close();
			Files.update();
		};
	};

	this.new_project = function () {
		'use strict';
		var opts = $opts_from_obj(IDE.get_types());
		// noinspection JSAnnotator
		var cnt = `
			<table class="font" style="margin: 10px;">
				<tr><td>Тип проекта <td> <select id="pr_type" style="width: 100%;">
																	`+opts+`
																</select>
				<tr><td>Наименование <td> <input type="text" id="pr_name">
				<tr><td>Папка хранения <td> <input type="text" value="" id="pr_dir"> <button id="pr_sel_dir">...</button>
			</table>
			<br>
			<div align="right"><button id="pr_create" class="btn_pad">Создать новый проект</button></div>
		`;
		dialog('Новый проект', cnt, 'auto', 'auto');

		$('pr_sel_dir').onclick = function () {
			Dial.dir(true, function (v) {
				$('pr_dir').value = v;
			})
		};

		$('pr_create').onclick = function () {
			if (!$('pr_dir').value) return;
			Project.create({
				name : $('pr_name').value || 'NW.js IDE Project',
				type : $('pr_type').value || 'nw',
				dir : $('pr_dir').value
			});
		};
	};

	this.files_item_menu = function (el, path, type) {
		var b = back(true);
		var fm = $create('div');
		fm.className = 'fies_item_menu_dialog';

		if (type === 'file') {
			$button(fm, 'Переименовать', function (e) {
				Dial.rename(path);
			}, true, 'full_width');
			$button(fm, 'Дублировать', function (e) {
				Dial.duplicate(path);
			}, true, 'full_width');
			$button(fm, 'Удалить', function (e) {
				Dial.del_file(path);
			}, true, 'full_width files_item_close');
		} else {
			$button(fm, 'Переименовать', function (e) {
				Dial.rename(path);
			}, true, 'full_width');
			$button(fm, 'Удалить', function (e) {
				Dial.del_dir(path);
			}, true, 'full_width files_item_close');
		}

		b.onclick = function (e) {
			$stop_events(e);
			$remove(b);
			$remove(fm);
		};

		fm.onclick = function (e) {
			$stop_events(e);
			$remove(b);
			$remove(fm);
		};

		$append(fm);

		var pm = $get_pos(el);
		$pos(fm, pm.right - fm.offsetWidth, pm.y + el.offsetHeight);
	};

	this.close = function () {
		if (this.dialog) {
			$B().removeChild(this.dialog.back);
			$B().removeChild(this.dialog.dialog);
		}
	};

	this.notify = function (inner, className, time) {
		var n = $create('div');
		n.className = is(className, 'notify_ok');
		n.innerHTML = inner;
		n.style.opacity = 0;
		n.style.transitionDuration = '200ms';
		$B().appendChild(n);
		n.style.left = (W.innerWidth - int(n.offsetWidth)) - 10 + 'px';
		n.style.top = (W.innerHeight - int(n.offsetHeight)) - 10 + 'px';
		n.style.opacity = 1;
		setTimeout(function () {
			n.style.opacity = 0;
			setTimeout(function () {
				$B().removeChild(n);
			}, 200);
		}, is(time, 2000));
	};
};