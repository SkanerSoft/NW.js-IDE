var $ = function (id) {
	return D.getElementById(id);
};

var int = function (v) {
	return parseInt(v);
};

var is = function (d) {
	if (typeof d !== 'undefined' && d) return d;
	return '';
};

var Ed = new function () {
	var Ed = this;
	var selected = null;
	var dragged = null;

	var cats = {
		'input' : 'Ввод',
		'output' : 'Вывод',
		'containers' : 'Контейнеры',
		'web' : 'WEB',
		'media' : 'Мультимедиа'
	};

	var objects = [
		{'create' : 'button', 'cat' : 'input'},
		{'create' : 'color', 'cat' : 'input'},
		{'create' : 'checkbox', 'cat' : 'input'},
		{'create' : 'input', 'cat' : 'input'},
		{'create' : 'area', 'cat' : 'input'},
		{'create' : 'link', 'cat' : 'input'},
		{'create' : 'list', 'cat' : 'input'},
		{'create' : 'listbox', 'cat' : 'input'},
		{'create' : 'range', 'cat' : 'input'},

		{'create' : 'panel', 'cat' : 'containers'},
		{'create' : 'tabs', 'cat' : 'containers'},

		{'create' : 'header', 'cat' : 'output'},
		{'create' : 'paragraph', 'cat' : 'output'},
		{'create' : 'label', 'cat' : 'output'},
		{'create' : 'image', 'cat' : 'output'},
		{'create' : 'progress', 'cat' : 'output'},

		{'create' : 'video', 'cat' : 'media'},
		{'create' : 'frame', 'cat' : 'web'},
		{'create' : 'webview', 'cat' : 'web'}
	];

	var patterns = {
		'frame' : {
			'tag' : 'span',
			'attr' : 'src:',
			'inner' : '<table width="100%" height="100%" style="border:1px dashed;"><tr><td align="center" valign="moddle">IFRAME<br><src style="font-size:small;font-weight:bold;"></src></table>'
		},

		'webview' : {
			'tag' : 'span',
			'attr' : 'src:',
			'inner' : '<table width="100%" height="100%" style="border:1px dashed;"><tr><td align="center" valign="moddle">WebView<br><src style="font-size:small;font-weight:bold;"></src></table>'
		},

		'button' : {
			'tag' : 'span',
			'attr' : 'type:button',
			'inner' : 'Кнопка'
		},

		'tabs' : {
			'tag' : 'span',
			'attr' : 'closing:false;close_notify:',
			'inner' : ''
		},

		'progress' : {
			'tag' : 'span',
			'attr' : 'value:0',
			'inner' : '<b></b>'
		},

		'range' : {
			'tag' : 'span',
			'attr' : 'min:0;max:100;int:true;value:0',
			'inner' : '<b></b>'
		},

		'input' : {
			'tag' : 'input',
			'attr' : 'type:text;value:'
		},

		'image' : {
			'tag' : 'img',
			'attr' : 'alt:Изображение'
		},

		'video' : {
			'tag' : 'video',
			'attr' : ''
		},

		'color' : {
			'tag' : 'input',
			'attr' : 'type:color;value:#000000'
		},

		'link' : {
			'tag' : 'a',
			'attr' : 'href:;title:',
			'inner' : 'Ссылка'
		},

		'checkbox' : {
			'tag' : 'label',
			'attr' : '',
			'inner' : '<b></b><span></span>'
		},

		'list' : {
			'tag' : 'span',
			'attr' : '',
			'inner' : '<label style="margin-right:10px"></label>&#9662;'
		},

		'listbox' : {
			'tag' : 'span',
			'attr' : '',
			'inner' : ''
		},

		'area' : {
			'tag' : 'textarea',
			'attr' : ''
		},

		'panel' : {
			'tag' : 'div',
			'attr' : 'container:true'
		},

		'span' : {
			'tag' : 'span',
			'attr' : 'container:true'
		},

		'label' : {
			'tag' : 'span',
			'attr' : 'edit:true',
			'inner' : 'Метка'
		},

		'paragraph' : {
			'tag' : 'p',
			'attr' : 'edit:true',
			'inner' : 'Параграф'
		},

		'header' : {
			'tag' : 'span',
			'attr' : 'edit:true',
			'inner' : 'Заголовок'
		}

	};

	var def_css = {
		'all' : 'padding:5px 10px;margin:5px;',
		'panel' : '',
		'image' : '!margin:5px;',
		'frame' : '!display:inline-block;width:400px;height:200px;border:1px solid;',
		'webview' : '!display:inline-block;width:400px;height:200px;border:1px solid;',
		'span' : 'display:inline-block;',
		'label' : 'display:inline-block;',
		'header' : 'display:block;font-weight:bold;font-size:20px;text-align:center;',
		'color' : '!margin:5px;',
		'list' : '',
		'checkbox' : '!margin: 5px;',
		'progress' : '!margin: 5px;',
		'listbox' : '!margin: 5px;',
		'range' : '!margin: 5px;',
		'tabs' : '!margin: 5px;'
	};

	var global_css = '';

	var css_templates = {
		'all' : {
			' --- ' : '',
			'Задний фон' : 'background-color:#455774;color:#AAC4DE;',
			'Скругленные углы' : 'border-radius:10px;',
			'Рамка' : 'border:1px solid #aaaaaa;',
			'Содержимое по центру' : 'text-align:center;',
			'Шрифт (sans-serif)' : 'font-family: sans-serif;'
		},

		'panel' : {
			'Горизонтальный список' : 'display:flex;|flex-direction;flex-wrap;justify-content',
			'Вертикальный список' : 'display:flex;flex-direction:column;|justify-content;flex-wrap',
			'Сетка с переносами' : 'display: flex;flex-wrap:wrap;justify-content:space-around;|flex-direction',
			'Сетка с заполнением' : 'display: flex;flex-wrap:wrap;justify-content:space-between;|flex-direction'
		}


	};

	var settings_tags = {
		'global' : 'title:title;skin:skin:list:green;user_skin:css file',
		'all' : 'id:ID;css_class:class name;group:group',
		'frame' : 'src:src',
		'webview' : 'src:src',
		'label' : 'innerHTML:text:multi',
		'paragraph' : 'innerHTML:text:multi',
		'header' : 'innerHTML:text:multi',
		'input' : 'value:value;placeholder:placeholder',
		'color' : 'value:color:color',
		'area' : 'value:value;placeholder:placeholder;rows:rows;cols:cols',
		'button' : 'innerHTML:value',
		'tabs' : 'closing:closing:bool;close_notify:close notify:;tabs:tabs:area;selected:selected:from:tabs',
		'image' : 'src:src',
		'progress' : 'value:value:number:100',
		'link' : 'href:href;innerHTML:text;target:target:list:_self,_blank,_parent,_top',
		'checkbox' : 'label:label;checked:checked:bool',
		'list' : 'list:list:area',
		'listbox' : 'list:list:area',
		'range' : 'min:min:number;max:max:number;value:value:number;int:int:bool',
		'video' : 'src:src;autoplay:autoplay:bool;controls:controls:bool;loop:loop:bool;preload:preload:bool'
	};
	
	var _on_create_call = {
		'range' : function (o) {
			callback_edit['range'](o, 'value', o.dataset['value']);
		}
	};

	var callback_edit = {

		'tabs' : function (o, key, val) {

			var __upd = function (o, key, val) {
				if (typeof val === 'undefined') return;
				var data = val.toString().trim().split(';');
				o.innerHTML = '';
				_for(data, function (pg) {
					if (!pg) return;
					pg = pg.trim().split(':');
					var tab = $create('span');
					var name = $create('span');

					tab.dataset['tab'] = '';
					tab.dataset['uid'] = pg[0];

					name.innerHTML = pg[1] ? pg[1] : pg[0];
					name.className = 'name';

					tab.appendChild(name);

					if (o.dataset['closing'] === 'true') {
						var close = D.createElement('span');
						close.innerHTML = '&#10006;';
						close.className = 'close';
						tab.appendChild(close);
					}

					o.appendChild(tab);
				});
			};

			if (key === 'tabs') __upd(o, key, val);
			if (key === 'closing') __upd(o, 'tabs', o.dataset['tabs']);
			if (key === 'selected') {
				_for(o.children, function (ch) {
					ch.dataset['tab'] = '';
					if (ch.dataset['uid'] === val)
						ch.dataset['tab'] = 'selected';
				});
			}
		},

		'checkbox' : function (o, key, val) {
			if (key === 'label') {
				o.children[1].innerHTML = val;
			}
		},

		'range' : function (o, key, val) {
			if (key === 'value') {
				var pr = o.firstChild;
				var width = o.clientWidth - parseInt(pr.offsetWidth);
				val = int(val);
				var min = int(o.dataset['min']);
				var max = int(o.dataset['max']);
				var pos = (width/(max-min)) * val;
				pr.style.left = int(pos) + 'px';
			}
		},

		'progress' : function (o, key, val) {
			if (key === 'value') {
				val = int(val);
				val = val < 0 ? 0 : (val > 100 ? 100 : val);
				o.getElementsByTagName('b')[0].style.width = val+'%';
			}
		},

		'frame' : function (o, key, val) {
			if (key === 'src') {
				o.getElementsByTagName('src')[0].innerHTML = val;
			}
		},

		'webview' : function (o, key, val) {
			if (key === 'src') {
				o.getElementsByTagName('src')[0].innerHTML = val;
			}
		},

		'list' : function (o, key, val) {
			if (key === 'list') {
				var name = val.toString().split(';')[0].split(':');
				name = (name[1] ? name[1] : name[0]).trim();
				o.getElementsByTagName('label')[0].innerHTML = name;
			}
		},

		'listbox' : function (o, key, val) {
			if (key === 'list') {
				var list = val.toString().split(';'), inner = '';
				_for(list, function (l) {
					if (!l) return;
					l = l.toString().split(':');
					inner += '<span>'+(l[1] ? l[1] : l[0])+'</span>';
				});
				o.innerHTML = inner;
			}
		}


	};


	var templates = Fs.read_file('pages/ui_editor/templates.json', 'json');

	var _init = function () {

		var tree = {};

		for (var i in cats) {
			if (!cats.hasOwnProperty(i)) continue;
			var c = $create('div');
			c.className = '_ui_cat';
			var name = $create('span');
			name.innerHTML = cats[i];
			name.style.cssText = 'flex: 1;';
			c.appendChild(name);

			var opcl = $create('span');
			opcl.innerHTML = '&#9660;';
			c.appendChild(opcl);
			opcl.className = '_ui_opcl';

			var items = $create('div');
			items.className = '_ui_cat_items';
			items.style.height = 0;

			opcl.items = name.items = items;
			opcl.opcl = name.opcl = opcl;
			opcl.onclick = name.onclick = function (e) {
				if (int(this.items.offsetHeight) > 0) {
					this.items.style.height = 0;
					this.opcl.style.transform = 'rotate(0)';
				} else {
					this.items.style.height = this.items.scrollHeight + 'px';
					this.opcl.style.transform = 'rotate(-180deg)';
				}
			};

			tree[i] = items;

			$('_ui_objects').appendChild(c);
			$('_ui_objects').appendChild(items);
		}

		for (var i in objects) {
			if (!objects.hasOwnProperty(i)) continue;
			var o = objects[i];
			var c = $create('div');
			c.className = '_ui_cat_item';
			var name = $create('div');
			name.innerHTML = '<img draggable="false" onerror="$show_hide(this, \'none\');" src="ui_editor/icons/'+o.create+'.png"><br>'+o.create;
			c.appendChild(name);

			c.draggable = true;

			c.create = o.create;
			c.onclick = function (e) {
				_create(this.create);
			};

			c.ondragstart = function (e) {
				this.create_drag = true;
				dragged = this;
			};

			tree[o.cat].appendChild(c);
		}

		window.onkeydown = function (e) {
			console.log(e.keyCode);

			if (e.keyCode === 46) {
				e.preventDefault();
				return Ed.delete();
			}

			// if (e.keyCode === 37) {
			// 	e.preventDefault();
			// 	return Ed.move();
			// }

			// if (e.keyCode === 39) {
			// 	e.preventDefault();
			// 	return Ed.move(true);
			// }

		};

		// Create Templates List //
		// var list = document.createElement('div');
		// _for(templates, function (tpl, name) {
		// 	var o = document.createElement('div');
		// 	o.innerHTML = name;
		// 	o.className = '_ui_btn';
		// 	var t = tpl;
		//
		// 	o.onclick = function () {
		// 		if (!confirm('Применить шаблон? Это затрёт всю созданную форму!')) return;
		// 		Ed.load(UI.decode(t));
		// 	};
		//
		// 	list.appendChild(o);
		// });
		// $('_ui_form_templates').appendChild(list);
		///////////////////////////

		// $('_ui_form_templates').style.height = 0;
		$('_ui_settings').style.height = 'auto';

		$('_ui_editor').onclick = function () {
			unselect();
		};
	};

	var _pos = function (el) {
		var b = $('body').getBoundingClientRect();
		var p = el.getBoundingClientRect();

		return {
			width : p.width,
			height : p.height,
			x : $('body').scrollLeft + p.x - b.x - 3,
			y : $('body').scrollTop + p.y - b.y - 3
		};
	};

	var tgl_class = function (o, cl, bl) {
		var rcl = new RegExp(' ?'+cl);
		if (bl === false) return o.className = o.className.replace(rcl, '');
		var ist = o.className.toString().match(rcl);
		if (ist && bl !== true) return o.className = o.className.replace(rcl, '');
		if (!ist) o.className += ' '+cl;
		return true;
	};

	var _fix_height = function (o) {
		o.style.height = o.offsetHeight + 'px';
	};

	var _tgl_height = Ed.tgl_height = function (o, s) {
		if (typeof o === 'string') o = $(o);

		if (o.style.height === '' || o.style.height === 'auto')
			o.style.height = o.offsetHeight + 'px';

		if (s) {
			o.style.height = o.scrollHeight + 'px';
			setTimeout(function () {
				o.style.height = 'auto';
			}, 200);
			return true;
		} else {
			if (int(o.offsetHeight) > 0) {
				o.style.height = 0;
				return false;
			} else {
				o.style.height = o.scrollHeight + 'px';
				setTimeout(function () {
					o.style.height = 'auto';
				}, 200);
				return true;
			}
		}
	};

	var _upd = function (tag, func) {
		if (!settings_tags[tag]) return '';
		var h = '';
		var all = settings_tags[tag].split(';');
		func = func ? func : 'set';
		var ref = selected ? selected : ed;
		_for(all, function (s) {
			if (!s) return;
			s = s.split(':');
			var val = is(ref.dataset[s[0]]).replace(/"/g, '&#34;');
			if (!s[2]) h += '<tr><td>'+s[1]+'<td><input type="text" data-field="'+s[0]+'" oninput="Ed.'+func+'(this);" value="'+val+'">';
			else if (s[2] === 'multi') h += '<tr><td>'+s[1]+'<td><div class="_ui_edit_in_table"><input type="text" data-field="'+s[0]+'" oninput="Ed.'+func+'(this);" value="'+val+'"><button onclick="Ed.hand_edit();">&#9997;</button></div>';
			else if (s[2] === 'bool') h += '<tr><td>'+s[1]+'<td align="left"><select data-field="'+s[0]+'" onchange="Ed.'+func+'(this, \'bool\');"><option>true</option><option '+(val !== 'true' ? 'selected' : '')+'>false</option></select>';
			else if (s[2] === 'color') h += '<tr><td>'+s[1]+'<td><input type="color" data-field="'+s[0]+'" oninput="Ed.'+func+'(this);" value="'+val+'">';
			else if (s[2] === 'number') {
				var max = s[3] ? 'max="'+s[3]+'"' : '';
				h += '<tr><td>'+s[1]+'<td><input type="number" '+max+' data-field="'+s[0]+'" oninput="Ed.'+func+'(this);" value="'+val+'">';
			} else if (s[2] === 'list') {
				var list = s[3].split(',');
				var opts = '<select data-field="'+s[0]+'" onchange="Ed.'+func+'(this);"><option value=""> --- </option>';
				_for(list, function (l) {
					opts += '<option'+(val === l ? ' selected' : '')+'>'+l+'</option>';
				});
				opts += '</select>';
				h += '<tr><td>'+s[1]+'<td>'+opts;
			} else if (s[2] === 'area') {
				h += '<tr><td>'+s[1]+'<td><textarea placeholder="value: text;" rows="5" data-field="'+s[0]+'" oninput="Ed.'+func+'(this);">'+val+'</textarea>';
			} else if (s[2] === 'from') {
				var list = is(ref.dataset[s[3]]).split(';');
				var opts = '<select data-field="'+s[0]+'" onchange="Ed.'+func+'(this);"><option value=""> --- </option>';
				_for(list, function (l) {
					if (!l) return;
					l = l.split(':')[0].trim();
					opts += '<option'+(val === l ? ' selected' : '')+'>'+l+'</option>';
				});
				opts += '</select>';
				h += '<tr><td>'+s[1]+'<td>'+opts;
			}
		});
		return h;
	};

	var update_global = Ed.update_global = function () {
		var h = '<table>';
		var set = $('_ui_settings');
		$('css_settings_area').value = global_css;
		tgl_class($('_ui_root_btn'), '_ui_tree_select', true);

		h += _upd('global', 'set_global');
		h += '</table>';

		set.innerHTML = h;
		update_global_control();
		_tgl_height('_ui_settings', true);

		var _upd_css_templates = function (key) {
			if (!css_templates[key]) return;
			$('_ui_templates_css').options.length = 0;
			_for(css_templates[key], function (css, rule) {
				var o = $create('option');
				o.text = rule;
				o.value = key+':'+rule;
				$('_ui_templates_css').appendChild(o);
			});
		};

		_upd_css_templates('all');


		$('events_settings_area').value = '';
	};

	var global_set_css = function (css) {
		global_css = css;
		ed.style.cssText = ed.dataset['css'] = css;
	};

	var update_global_control = function () {
		$('_ui_name_object').innerHTML = 'Root';

		var h = '';

		h += '<div class="_ui_btn" onclick="Ed.import();">Импорт шаблона</div>';
		h += '<div class="_ui_btn" onclick="if (confirm(\'Скачать шаблон?\')) Ed.export();">Экспорт шаблона</div>';

		$('_ui_control').innerHTML = h;
	};

	var update_control = function () {
		var h = '<div style="display:flex;align-items:stretch;justify-content:center">';

		h += '<span class="btn" title="Удалить узел" onclick="Ed.delete();">&#10006;</span>';
		h += '<span class="btn" title="Клонировать" onclick="Ed.clone();">&#10010;</span>';
		h += '<span class="btn" title="Переместить узел влево" onclick="Ed.move();">&#9668;</span>';
		h += '<span class="btn" title="Переместить узел вправо" onclick="Ed.move(true);">&#9658;</span>';
		h += '<span class="btn" title="Переместить узел на уровень выше" onclick="Ed.move_up();">&#9650;</span>';
		h += '<span class="btn" title="Выделить родителя" onclick="Ed.select_parent()">&#8624;</span>';

		$('_ui_control').innerHTML = h+'</div>';
	};

	var update = this.update = function () {
		_fix_height($('_ui_settings'));
		var sel = selected;
		if (!sel) return update_global();
		tgl_class($('_ui_root_btn'), '_ui_tree_select', false);
		$('_ui_name_object').innerHTML = sel.dataset['tag'];
		update_control();
		var set = $('_ui_settings');
		var css = $('css_settings_area');
		var h = '<table>';

		h += _upd('all');
		h += _upd(sel.dataset['tag']);

		h += '</table>';
		set.innerHTML = h;

		if (sel.dataset['css'])
			css.value = sel.dataset['css'].toString().replace(/[\r]/g, '').replace(/;/g, ';\n').replace(/:/g, ': ').replace(/\s{2,}/g, ' ');
		else
			css.value = '';

		var evs;
		if (evs = selected.dataset['events']) {
			evs = evs.replace(/;/g, ';\n').replace(/:/g, ': ');
			$('events_settings_area').value = evs;
		} else {
			$('events_settings_area').value = '';
		}

		if ($('_ui_settings').offsetHeight > 0)
			_tgl_height('_ui_settings', true);

		// TEMPLATES CSS //
		var _upd_css_templates = function (key, append) {
			if (!css_templates[key]) return;
			if (!append) $('_ui_templates_css').options.length = 0;
			_for(css_templates[key], function (css, rule) {
				var o = $create('option');
				o.text = rule;
				o.value = key+':'+rule;
				$('_ui_templates_css').appendChild(o);
			});
		};

		_upd_css_templates('all');
		_upd_css_templates(selected.dataset['tag'], true);
		///////////////////
	};

	Ed._set_global = function (key, val) {
		Ed.set_global({dataset : {field:key}, value:val}, 'string');
	};

	Ed.set_global = function (o, type) {
		var val = o.value;
		var key = o.dataset['field'];

		if (type === 'bool')
			val = val === 'true';

		if (key === 'title')
			$('_ui_title').innerHTML = val ? val : '&nbsp;';

		if (key === 'skin') {
			if (!val) val = 'default';
			$('_ui_css_skin').innerHTML = '';
			if (Fs.is_file('pages/ui_editor/skins/'+val+'.css'))
				$('_ui_css_skin').innerHTML = Fs.read_file('pages/ui_editor/skins/'+val+'.css');
		}

		_set(ed, key, val);
	};

	Ed.add_css_tpl = function (id) {
		id = id.split(':');
		var cssed = $('css_settings_area');
		var css = css_templates[id[0]][id[1]];
		css = css.split('|');

		var dels = css[0].split(';');
		_for(dels, function (d) {
			if (!d) return;
			d = d.split(':');
			var r = new RegExp('\n?'+d[0]+'\s?:.*?;', 'gi');
			cssed.value = cssed.value.replace(r, '');
		});

		if (css[1]) {
			dels = css[1].split(';');
			_for(dels, function (d) {
				if (!d) return;
				var r = new RegExp('\n?'+d+'.*?;', 'gi');
				cssed.value = cssed.value.replace(r, '');
			});
		}

		css = css[0].replace(/:/g, ': ').replace(/;/g, ';\n');
		cssed.value += css;
		cssed.oninput();
		$('_ui_templates_css').value = 'all: --- ';
	};

	Ed.set_e = function (evs) {
		if (!selected) return;
		evs = evs.replace(/[\r\n\s]/g, '');
		selected.dataset['events'] = evs;
	};

	var _set = function (o, a, v) {
		o.dataset[a] = v;
		o[a] = v;
	};

	var set = Ed.set = function (o, type) {
		if (!selected) return;
		var val = o.value;
		var key = o.dataset['field'];

		if (type === 'bool')
			val = val === 'true';

		if (key === 'id') {
			val = val.toString();
			if ($(val)) return console.log('ID '+val+' уже занято или запрещено!');
			selected.in_tree._name.children[0].innerHTML = selected.dataset['tag'] + (val ? ' ('+val+')' : '');
		}

		_set(selected, key, val);

		if (callback_edit[selected.dataset['tag']]) {
			callback_edit[selected.dataset['tag']](selected, key, val);
		}
	};

	var set_css = Ed.set_css = function (css) {
		if (!selected) return global_set_css(css);
		css = css.split('|');
		selected.dataset['css'] = css[0].replace(/[\n\r]/g, '');
		selected.style.cssText = selected.dataset['css'].replace(/vw|vh/g, '%').replace(/fixed/g, 'absolute');

		if (callback_edit[selected.dataset['tag']]) {
			callback_edit[selected.dataset['tag']](selected, 'css', selected.dataset['css']);
		}
	};

	var select = Ed.select = function (o) {
		if (selected && selected !== o) unselect(true);
		selected = o;
		tgl_class(o, '_ui_box', true);
		tgl_class(o.in_tree._name, '_ui_tree_select', true);
		update();
	};

	var unselect = Ed.unselect = function (not_update) {
		if (selected) {
			tgl_class(selected, '_ui_box', false);
			tgl_class(selected.in_tree._name, '_ui_tree_select', false);

			selected = null;
		}
		if (!not_update) update_global();
	};

	var _set_css = function (o, s) {
		o.dataset['css'] = s;
		o.style.cssText = s.replace(/vw|vh/g, '%').replace(/fixed/g, 'absolute');
	};

	var _set_attr = function (o, a, v) {
		if (v === null) {
			delete o.dataset[a];
			delete o[a];
			o.removeAttribute(a);
			return;
		}
		o.setAttribute(a, v);
		o[a] = v;
		o.dataset[a] = v;
	};

	var _set_dropper = function (o) {
		o.ondrop = function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (!dragged) return;
			if (dragged === this.parentNode) return;
			if (dragged === this) return;

			if (this.dataset['container']) {
				if (dragged.create_drag) _create(dragged.create);
				else {
					this.appendChild(dragged);
					this.in_tree.childs.appendChild(dragged.in_tree);
				}
				tgl_class(this, 'can_drop', false);
			} else {
				if (this.parentNode.dataset['container']) {
					if (dragged.create_drag) _create(dragged.create, this);
					else {
						this.parentNode.insertBefore(dragged, this);
						this.parentNode.in_tree.childs.insertBefore(dragged.in_tree, this.in_tree);
					}
					tgl_class(this, 'not_can_drop', false);
					tgl_class(this.parentNode, 'can_drop', false);
				}
			}

			dragged = null;
		};

		o.ondragover = function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (!dragged) return;
			if (dragged === this) return;
			if (this.dataset['container']) {
				tgl_class(this, 'can_drop', true);
			} else {
				if (this.parentNode.dataset['container']) {
					tgl_class(this, 'not_can_drop', true);
					tgl_class(this.parentNode, 'can_drop', true);
				}
			}
		};

		o.ondragleave = function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (!dragged) return;
			if (this.dataset['container']) {
				tgl_class(this, 'can_drop', false);
			} else {
				if (this.parentNode.dataset['container']) {
					tgl_class(this, 'not_can_drop', false);
					tgl_class(this.parentNode, 'can_drop', false);
				}
			}
		};
	};

	var _sel_update = function () {
		if (!selected) return;

		if (selected.tag === 'checkbox') {
			selected.checked = selected.dataset['checked'] === 'true';
		}

		return false;
	};


	// DOM Events //////////////////////////////////////////
	var _clear_e = function (o, es) {
		_for(es, function (e) {
			o['on'+e] = null;
		});
	};

	var _set_e = function (o, e, f) {
		o['on'+e] = f;
	};

	var _block_e = function (o, e) {
		o['on'+e] = function (e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		};
	};

	var _block_es = function (o, es) {
		_for(es, function (e) {
			_block_e(o, e);
		});
	};
	////////////////////////////////////////////////////////

	// SELECT NODE & CONTROL ///////////////////////////////
	Ed.select_parent = function () {
		if (selected && selected.parentNode.dataset['tag'])
			select(selected.parentNode);
	};

	Ed.hand_edit = function () {
		if (!selected || !selected.edit) return;
		_set_attr(selected, 'contenteditable', true);
		selected.focus();
		D.execCommand('selectAll', false, true);

		_set_e(selected, 'blur', function () {
			_set_attr(selected, 'contenteditable', false);
			_clear_e(['blur', 'keydown']);
			this.dataset['innerHTML'] = this.innerHTML = this.innerHTML.replace(/[\n\t\r]/g, '');
		});

		_set_e(selected, 'keydown', function (e) {
			e.stopPropagation();
			if (e.keyCode === 13) {
				e.preventDefault();
				D.execCommand('insertHTML', false, '<br><br>');
			}
		});

	};

	Ed.delete = function () {
		if (!selected) return;
		if (!confirm('Действительно удалить?')) return;
		selected.parentNode.removeChild(selected);
		selected.in_tree.parentNode.removeChild(selected.in_tree);
		unselect();
	};

	Ed.move = function (right) {
		if (!selected) return;
		var c;
		if (!right) {
			c = selected.previousSibling;
			if (c) {
				selected.parentNode.insertBefore(selected, c);
				selected.in_tree.parentNode.insertBefore(selected.in_tree, c.in_tree);
			}
		} else {
			c = selected.nextSibling;
			if (c) c = c.nextSibling;
			if (c) {
				selected.parentNode.insertBefore(selected, c);
				selected.in_tree.parentNode.insertBefore(selected.in_tree, c.in_tree);
			} else {
				selected.parentNode.appendChild(selected);
				selected.in_tree.parentNode.appendChild(selected.in_tree);
			}
		}
	};

	Ed.move_up = function () {
		if (!selected) return;
		if (!selected.parentNode.parentNode || selected.parentNode.id === '_ui_body') return;
		selected.parentNode.parentNode.appendChild(selected);
		selected.in_tree.parentNode.parentNode.appendChild(selected.in_tree);
	};

	Ed.clone = function () {
		if (!selected) return;
		var cl = selected.cloneNode(true);
		selected.parentNode.appendChild(cl);

		_set_edit(cl);
		cl.in_tree = _add_in_tree(cl, selected.parentNode);

		if (cl.children.length) {
			var _sch = function (o) {
				var list = o.children;
				_for(list, function (l) {
					if (l.dataset['tag']) {
						_set_edit(l);
						l.in_tree = _add_in_tree(l, l.parentNode);
						if (l.children.length) _sch(l);
					}
				});
			};
			_sch(cl);
		}

		select(cl);
		Ed.move(true);
	};
	////////////////////////////////////////////////////////


	// CREATE NEW NODE /////////////////////////////////////
	var _nodes_count = 0;

	var _add_in_tree = function (o, prt) {
		var tree = (prt && prt.in_tree) ? prt.in_tree.childs : $('_ui_tree');
		var in_tree = $create('div');

		var name = $create('div');
		name.className = 'as_flex hnd';

		name.node = o;
		name.onclick = function (e) {
			Ed.select(this.node);
		};

		in_tree._name = name;

		var label = $create('div');
		label.className = 'flex _ui_btn';
		label.innerHTML = o.dataset['tag']+(o.id ? ' ('+o.id+')' : '');

		var opener = $create('div');
		opener.innerHTML = '&#9662;';
		opener.className = '_ui_btn';

		var chlds = $create('div');
		chlds.className = '_ui_tree_items';
		chlds.style.display = 'none';
		in_tree.childs = chlds;

		opener.onclick = function (e) {
			e.stopPropagation();
			if ($show_hide(chlds))
				opener.style.transform = 'rotate(-180deg)';
			else
				opener.style.transform = 'rotate(0)';
		};

		$append(label, name);

		if (o.dataset['container'])
			$append(opener, name);

		$append(name, in_tree);
		$append(chlds, in_tree);
		$append(in_tree, tree);
		_nodes_count+= 1;
		return in_tree;
	};

	var _create = function (tag, ref) {
		var p = patterns[tag];
		var o = $create(p.tag);
		_set(o, 'tag', tag);

		if (p.inner) _set(o, 'innerHTML', p.inner);

		if (p.attr) {
			var a = p.attr.split(';');
			for (var i = 0; i < a.length; i++) {
				var b = a[i].split(':');
				_set_attr(o, b[0], b[1]);
			}
		}

		var css = def_css.all;

		if (def_css[tag])
			if (def_css[tag][0] === '!') {
				css = def_css[tag].slice(1);
			} else
				css += def_css[tag];

		_set_css(o, css);
		_set_edit(o);

		var adder = ed;

		if (ref) {
			select(ref);
		}

		if (selected) {
			if (selected.dataset['container']) {
				adder = selected;
			} else if (selected.parentNode.dataset['container']) {
				adder = selected.parentNode;
			}
		}

		if (ref) adder.insertBefore(o, selected);
		else adder.appendChild(o);

		o.in_tree = _add_in_tree(o, adder);

		select(o);
		o.scrollIntoView();

		if (_on_create_call[tag]) _on_create_call[tag](o);
	};
	///////////////////////////////////////////////////////

	var _set_edit = function (o) {
		// drag & drop /////////////////
		_set_attr(o, 'draggable', true);

		o.ondragstart = function (e) {
			e.dataTransfer.setData('text/plain', 'dragging');
			e.stopPropagation();
			dragged = this;
		};

		o.ondragend = function (e) {
			e.stopPropagation();
			dragged = null;
		};

		_set_dropper(o);
		///////////////////////////////

		o.onclick = function (e) {
			e.stopPropagation();
			if (selected === this) return _sel_update();
			select(this);
			this.blur();
			_sel_update();
			return false;
		};
	};












	// SETTINGS EDITOR ////////////////////////////////////
	var ed = $('_ui_body');

	ed.focus();
	D.execCommand('enableObjectResizing', false, true);

	var paste = function (txt) {
		ed.focus();
		D.execCommand('insertHTML', false, txt);
	};

	_set_attr(ed, 'container', true);
	_set_dropper(ed);
	ed.in_tree = {
		childs : $('_ui_tree')
	};
	///////////////////////////////////////////////////////








	// COMPILE ////////////////////////////////////////////
	Ed.get_json = function () {
		var json = {
			global : {},
			body : null
		};

		json.global['title'] = $('_ui_title').innerHTML;
		json.global['base_css'] = Fs.read_file('pages/ui_editor/skins/base.css').toString()+'\n';
		json.global['skin_css'] = $('_ui_css_skin').innerHTML;
		json.global['user_skin'] = ed.dataset['user_skin'];

		var _go = function (el) {
			var o = {};

			_for(el.dataset, function (val, key) {
				o[key] = val;
			});

			if (el.children.length) {
				o['children'] = [];
				_for(el.children, function (el) {
					if (el.dataset['tag'])
						o['children'].push(_go(el));
				});
			}

			return o;
		};

		json.body = _go(ed);

		// return json
		return JSON.stringify(json);
	};

	Ed.get = function () {
		return UI.encode(Ed.get_json());
	};
	///////////////////////////////////////////////////////


	// Open ///////////////////////////////////////////////
	Ed.load = function (json) {
		var loaded_arr = [];

		ed.innerHTML = '';
		json = JSON.parse(json);

		global_set_css(json.body['css']);
		$('_ui_title').innerHTML = ed.dataset['title'] = json.global['title'];
		if (json.body['skin']) ed.dataset['skin'] = json.body['skin'];

		$('_ui_css_skin').innerHTML = json.global['skin_css'];
		if (json.body['user_skin']) ed.dataset['user_skin'] = json.body['user_skin'];

		_go = function (el, prt) {
			var t = el['tag'] || 'panel';
			var o = $create(patterns[t]['tag']);

			_for(el, function (val, key) {
				if (key === 'children') return;
				if (key === 'css') _set_css(o, val);
				_set_attr(o, key, val);
				if (callback_edit[o.dataset['tag']])
					callback_edit[o.dataset['tag']](o, key, val);
			});

			o.in_tree = _add_in_tree(o, prt);

			if (el['children']) _for(el['children'], function (ch) {
				ch = _go(ch, o);
				o.appendChild(ch);
			});

			_set_edit(o);
			loaded_arr.push([t, o]);
			return o;
		};

		_for(json.body.children, function (ch) {
			ed.appendChild(_go(ch));
		});

		_for(loaded_arr, function (la) {
			if (_on_create_call[la[0]])
				_on_create_call[la[0]](la[1]);
		});
	};

	Ed.open = function (data) {
		Ed.load(UI.decode(data));
		unselect();
	};
	///////////////////////////////////////////////////////


	// Import / Export /////////////////////////////////////
	Ed.import = function () {
		var f = D.createElement('input');
		f.type = 'file';
		f.onchange = function () {
			var r = new FileReader();
			r.onload = function (e) {
				Ed.load(UI.decode(e.target.result));
			};
			r.readAsText(this.files[0]);
		};
		f.click();
	};

	Ed.export = function () {
		var a = D.createElement('a');
		a.href = 'data:text/json,'+UI.encode(Ed.get_json());
		a.download = 'template.ui';
		$B.appendChild(a);
		a.click();
	};
	////////////////////////////////////////////////////////


	_init();
};