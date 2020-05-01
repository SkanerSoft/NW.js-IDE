var Files;
if (typeof parent.Files !== 'undefined') Files = parent.Files;
else Files = new function () {
	var _Files = this;
	var delm = Fs.delm;
	var current_path = '';

	var clear = this.clear = function () {
		$('files').innerHTML = '';
	};

	var update = this.update = function () {
		clear();
		fill(current_path);
	};

	this.sh = function () {
		$show_hide('files');
		return $('files').style.display !== 'none';
	};

	var fill = this.fill = function (path) {
		Joint.update();

		current_path = path;
		var l = Fs.read_dir(path);
		var i, f;
		var file, name, menu, type, is_joint;

		var list = $create('div');
		var rel_path = path.replace(Project.path, '');
		var back_path = Fs.parse_dir(path)['back'];

		if (rel_path) {
			if (rel_path[0] === delm) rel_path = rel_path.slice(1);

			file = $create('div');
			file.className = 'files_item';

			file.dataset['path'] = back_path;

			file.onclick = function (e) {
				Files.clear();
				Files.fill(this.dataset['path']);
			};

			name = $create('span');
			name.className = 'files_item_name';
			name.innerHTML = '../'+rel_path;

			file.appendChild(name);
			list.appendChild(file);
		}

		for (i=0; i<l.dirs.length; i+=1) {
			f = l.dirs[i];
			file = $create('div');
			file.className = 'files_item';
			file.dataset['path'] = path+'/'+f;

			file.onclick = function (e) {
				Files.clear();
				Files.fill(this.dataset['path']);
			};

			name = $create('span');
			name.className = 'files_item_name';
			name.innerHTML = f;

			menu = $create('span');
			menu.className = 'files_item_menu';
			menu.innerHTML = '&#8226;&#8226;&#8226;';
			menu.dataset['path'] = path+'/'+f;

			menu.onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				Dial.files_item_menu(this, this.dataset['path'], 'folder');
			};

			type = $create('span');
			type.className = 'type_icon type_folder';

			file.appendChild(type);
			file.appendChild(name);
			file.appendChild(menu);
			list.appendChild(file);
		}

		for (i=0; i<l.files.length; i+=1) {
			f = l.files[i];
			if (f === 'ide.json') continue;

			is_joint = Joint.check(f);

			file = $create('div');
			file.className = 'files_item';
			file.dataset['path'] = path+'/'+f;
			file.dataset['name'] = (path+'/'+f).replace(Project.path+"/", '');
			file.dataset['ex'] = Fs.parse(file.dataset['path'])['ex'];

			if (is_joint) file.onclick = function (e) {
				Dial.notify('Данный файл будет перезаписан при запуске (сборке) проекта', 'notify_info', 5000);
				Pages.add_page(this.dataset['path'], this.dataset['name']);
			}; else file.onclick = function (e) {
				Pages.add_page(this.dataset['path'], this.dataset['name']);
			};

			name = $create('span');
			name.className = 'files_item_name';
			name.innerHTML = f+(is_joint ? '+' : '');

			menu = $create('span');
			menu.className = 'files_item_menu';
			menu.innerHTML = '&#8226;&#8226;&#8226;';
			menu.dataset['path'] = path+'/'+f;

			menu.onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				Dial.files_item_menu(this, this.dataset['path'], 'file');
			};

			type = $create('span');
			type.className = 'type_icon type_'+file.dataset['ex']+(is_joint ? ' is_joint' : '');

			file.appendChild(type);
			file.appendChild(name);
			file.appendChild(menu);
			list.appendChild(file);
		}

		$('files').appendChild(list);
		$('files').onclick = function () {};
		if (tools) {
			try {
				$('files').removeChild(tools);
			} catch (e) {}
			tools = null;
		}

		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('files:updated', W, list);
		/////////////////////////////////////////////////////////////////
	};

	this.open_in_os = function () {
		Fs.open_on_os(current_path);
	};

	this.add_dir = function () {
		var cnt = `
			<table>
				<tr>
					<td>Название <td> <input type="text" id="nd_name">
				</tr>
			</table>
			<br>
			<div align="right"><button class="btn_pad" id="nd_action">Добавить</button></div>
		`;

		Dial.custom_dialog('Создать папку', cnt);
		$('nd_action').onclick = function () {
			var fn = $('nd_name').value.trim();
			Fs.add_dir(current_path+'/'+fn);
			Dial.close();
			Files.update();
		};
		$input_enter('nd_name', 'nd_action');
	};

	this.get_path = function () {
		return current_path;
	};

	this.add_file = function () {
		var cnt = `
			<table>
				<tr>
					<td>Название <td> <input type="text" id="nf_name">
				<tr>
					<td>Шаблон<td> <span>
														<select id="nf_templates" style="width: 100%;">
															`+$opts_from_obj(IDE.get_file_templates())+`
														</select>
													</span>
			</table>
			<br>
			<div align="right"><button class="btn_pad" id="nf_action">Добавить</button></div>
		`;

		Dial.custom_dialog('Создать файл', cnt);

		$('nf_action').onclick = function () {
			var fn = $('nf_name').value.trim();
			Fs.write_file(current_path+'/'+fn, Fs.read_file('templates/file_types/'+$('nf_templates').value+'.tpl'));
			Dial.close();
			Files.update();
		};
		$input_enter('nf_name', 'nf_action');
	};

	var tools = null;
	this.show_tools = function () {
		if (tools) {
			return $pos(tools, MOUSE_X, MOUSE_Y);
		}

		var t = tools = $create('div');
		t.className = 'files_tools';

		t.innerHTML = '<button onclick="Files.add_file();">Создать файл</button><br>'+
			'<button onclick="Files.add_dir();">Создать папку</button><br>'+
			'<button onclick="Files.open_in_os();">Открыть в ОС</button>';

		$pos(t, MOUSE_X, MOUSE_Y);
		$('files').appendChild(t);

		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('files:context_opened', W, tools);
		/////////////////////////////////////////////////////////////////

		$('files').onclick = function () {
			if (tools) {
				$('files').removeChild(tools);
				tools = null;
			}
		};
	};

	window.addEventListener('load', function (e) {
		$('files').addEventListener('click', function (e) {
			if (current_path) {
				_Files.update();
			}
		});
	});

};