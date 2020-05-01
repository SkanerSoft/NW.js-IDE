var UI = new function () {
	var UI = this;
	var App = nw.App;
	var WIN = nw.Window.get();

	// Globals ////////////////////////////////
	var _events = {
		'UI"inited' : [],
		'UI:loaded' : [],
		'UI:close' : [],
		'UI:focus' : [],
		'UI:blur' : [],

		'UI:update' : [],

		'keydown' : [],
		'keypress' : [],
		'keyup' : [],

		'mousedown' : [],
		'mouseup' : [],
		'mousemove' : [],
		'mousewheel' : [],
		'click' : [],
		'contextmenu' : [],
		'dblclick' : []
	};

	var _ids = {};
	var _all = []; // objects

	var _mouse = UI.mouse = {
		// pos : []
	};

	var _keys = UI.pressed_keys = {
		// keyCode : 'keyName'
	};

	var _nullf = function () {};

	var int = function (v) { return parseInt(v); };

	var _range = function (val, min, max) {
		return val < min ? min : (val > max ? max : val);
	};

	var _create = function (tag) {
		return document.createElement(tag);
	};

	var _for = function (obj, clb) {
		var i;
		for (i in obj) {
			if (!obj.hasOwnProperty(i)) continue;
			var r = clb(obj[i], i);
			if (r === 'break') break;
		}
	};

	var _set_attr = function (o, k, v) {
		o.setAttribute(k, v);
		o[k] = v;
	};

	var _not_attr = {
		'draggable' : 1,
		'children' : 1,
		'events' : 1,
		'contenteditable' : 1,
		'edit' : 1
	};

	var _tag = function (node) {
		return (node && node.dataset['tag']) ? node.dataset['tag'] : '';
	};

	var rgb2hex = function (color) {
		var clr = color.toString().match(/(\d+),\s?(\d+),\s?(\d+)/i);
		var r = int(clr[1]), g = int(clr[2]), b = int(clr[3]);
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	};

	var _update_control = function (control, tag) {
		if (UI.controls[tag]) {
			_for(UI.controls[tag], function (clb, key) {

				if (key === '_hooks') {
					_for(clb, function (hook) {
						control.hooks[hook] = [];
					});
					return;
				}

				control[key] = clb;
			});
		}
	};

	var _control = function (tag) {
		return UI.controls[tag] ? UI.controls[tag] : null;
	};

	///////////////////////////////////////////
	// File System ////////////////////////////
	var fs = UI._fs = require('fs');
	var _read = function (path, flag) {
		if (!flag) return fs.readFileSync(path).toString();
	};

	var _write = function (path, data, onerr) {
		try {
			fs.writeFileSync(path, data);
		} catch (e) {
			if (typeof onerr === 'function')
				onerr(e.message);
		}
	};

	UI.Files = new function () {
		var Files = this;

		Files.readText = function (path) {
			return _read(path);
		};

		Files.writeText = function (path, text, onerr) {
			_write(path, (text ? text.toString() : ''), onerr);
		};

	};
	///////////////////////////////////////////
	// Dialog /////////////////////////////////

	UI.Dialog = new function () {
		var Dialog = this;

		Dialog.file = function (def, clb) {
			var f = _create('input');
			f.type = 'file';
			f.addEventListener('change', function (e) {
				e.preventDefault();
				clb(this.value);
			});
			f.click();
		};

		Dialog.save = function (def, clb) {
			var f = _create('input');
			f.type = 'file';
			f.nwsaveas = def ? def : '';
			f.addEventListener('change', function (e) {
				e.preventDefault();
				clb(this.value);
			});
			f.click();
		};

	};

	///////////////////////////////////////////
	// Dev Tools //////////////////////////////

	UI.devTools = function () {
		try {
			WIN.showDevTools();
		} catch (e) {
			console.log('Ошибка запуска консоли разработчика. Проверьте, что используете SDK версию NW.js');
		}
	};








	///////////////////////////////////////////
	// Nodes //////////////////////////////////
	var control_count = 0;
	var controls = UI.controls = {};
	var NodeControl = function (id, _node) {
		var NC = this;
		NC.node = id ? _ids[id] : (_node ? _node : null);
		NC.tag = _tag(NC.node);

		var local_events = NC.hooks = {};

		NC._data = function (key, val) {
			if (!key) return NC.node.dataset;
			if (!val) return NC.node.dataset[key];
			return NC.node.dataset[key] = val;
		};

		NC.parent = function () {
			return _get_control(null, NC.dom().parentNode);
		};

		NC.dom = function () {
			return NC.node;
		};

		NC.del = function () {
			if (id) delete _ids[id];
			NC.node.parentNode.removeChild(NC.node);
		};

		NC.text = function (set) {
			set = set.toString();
			if ('value' in NC.node) {
				if (set) NC.node.value = set;
				return NC.node.value;
			} else if ('innerHTML' in NC.node) {
				if (set) NC.node.innerHTML = set;
				return NC.node.innerHTML;
			}
		};

		NC.inner = function (set) {
			if (set && 'innerHTML' in NC.node)
				return NC.node.innerHTML = set;
		};

		NC.value = function (set) {
			if ('value' in NC.node) {
				if (set) NC.node.value = set;
				return NC.node.value;
			} else return '';
		};

		NC.on = function (event, clb, name) {
			if (local_events[event]) {
				local_events[event].push({
					name : name || '',
					clb : clb
				});
				return;
			}
			var t = NC.tag;
			if (t = _control(t)) if (t = t['events']) if (t[event]) event = t[event];
			NC.node.addEventListener(event, function (e) {
				clb(e, NC, NC.dom());
			});
		};

		NC.off = function (event, name) {
			if (local_events[event]) _for(local_events[event], function (e, i) {
				if (e.name === name)
					local_events[event].splice(i, 1);
			});
		};

		NC.event = function (event, e1, e2, e3, e4) {
			if (local_events[event]) {
				_for(local_events[event], function (e) {
					e.clb(e1, e2, e3, e4);
				});
			}
		};

		NC.css = function (set) {
			if (!set) {
				var css = {};
				var _css = NC.node.style.cssText.split(';');
				_for(_css, function (_c) {
					if (!_c) return;
					_c = _c.split(':');
					if (_c[1].match(/rgb/i)) _c[1] = rgb2hex(_c[1]);
					css[_c[0]] = _c[1];
				});
				return css;
			} else {
				_for(set, function (val, key) {
					NC.node.style[key] = val;
				});
			}
		};

		NC.attr = function (set) {
			if (!set) {
				var attr = {};
				_for(NC.node.attributes, function (a) {
					attr[a.name] = a.value;
				});
				return attr;
			} else {
				_for(set, function (val, key) {
					NC.node.setAttribute(key, val);
					NC.node[key] = val;
				});
			}
		};

		if (NC.node.dataset['tag'] && UI.controls[NC.node.dataset['tag']])
			_update_control(NC, NC.node.dataset['tag']);

		var uid = 'uid_'+control_count;
		controls[uid] = this;
		NC.node.dataset['_uid'] = uid;
		control_count += 1;
	};

	var _get_control = function (id, node) {
		if (!node && id && _ids[id]) node = _ids[id];
		if (!node) return null;
		var uid = node.dataset['_uid'];
		if (uid && controls[uid]) return controls[uid];
		return new NodeControl(id, node);
	};
	///////////////////////////////////////////


	// Application ////////////////////////////
	UI.Application = new function () {
		var A = this;

		A.title = function (set) {
			if (set) document.title = set;
			return document.title;
		};

		A.close = function () {
			UI.event('UI.close');
			App.quit();
		};

	};
	///////////////////////////////////////////

	// UI /////////////////////////////////////
	UI.for = function (arr, clb) {
		_for(arr, clb);
	};

	UI.get = function (id) {
		if (!_ids[id]) return null;
		return _get_control(id);
	};

	UI.find = function (type) {
		var list = [];
		_for(_all, function (o) {
			if (o.type === type)
				list.push(_get_control(null, o.node));
		});
		return list;
	};


	UI.group = function (g) {
		var list = [];
		_for(_all, function (o) {
			if (o.node.group === g)
				list.push(_get_control(null, o.node));
		});
		return list;
	};

	UI.create = function (tag, attr, css, events) {
		var html_tag = UI.types[tag]['tag'];
		var p = UI.types[tag]['attr'];
		var o = document.createElement(html_tag);

		var def_css = UI.default_css['all'];
		def_css += UI.default_css[tag];
		o.style.cssText = def_css;

		if (p) {
			var all = p.split(';');
			_for(all, function (a) {
				var b = a.split(':');
				_set_attr(o, b[0], b[1]);
			});
		}

		if (attr) _for(attr, function (val, key) {
			_set_attr(o, key, val);
		});

		if (css) _for(css, function (val, key) {
			o.style[key] = val;
		});

		if (events) _for(events, function (val, key) {
			o['on'+key] = val;
		});

		_all.push({
			type : tag,
			node : o
		});

		return _get_control(null, o);
	};

	UI.append = function (o, prt, ref, next) {
		o = o.dom();

		if (!prt) prt = document.body;
		else prt = _ids[prt];

		if (ref) {
			ref = _ids[ref];
			prt.insertBefore(o, (next ? ref.nextSibling : ref));
			return;
		}

		prt.appendChild(o);
	};

	UI.on = function (event, clb, name) {
		if (!_events[event]) _events[event] = [];
		_events[event].push({
			name : name || '',
			clb : clb
		});
	};

	UI.off = function (event, name) {
		if (_events[event]) _for(_events[event], function (evt, i) {
			if (evt.name === name)
				_events[event].splice(i, 1);
		});
	};

	UI.event = function (event, e, e2, e3, e4, e5, e6, e7, e8) {
		if (_events[event]) _for(_events[event], function (evt) {
			evt.clb(e, e2, e3, e4, e5, e6, e7, e8);
		});
	};
	//////////////////////////////////////////////

	var _init = function (file) {
		var created = [];
		var head = document.getElementsByTagName('head')[0];
		var body = document.body;
		var json = JSON.parse(UI.decode(_read(file)));

		body.dataset['tag'] = 'root';

		body.style.cssText = json.body['css'];

		if (!body.style.padding) body.style.padding = 0;
		if (!body.style.margin) body.style.margin = 0;

		document.title = json.global['title'];

		var w = parseInt(body.style.width);
		var h = parseInt(body.style.height);

		var skin = document.createElement('style');
		skin.innerHTML = json.global['base_css']+'\n'+json.global['skin_css'];
		head.appendChild(skin);

		if (json.global['user_skin'])
			UI.import_css(json.global['user_skin']);

		if (w) {
			WIN.width = w;
			body.style.width = 'auto';
		}

		if (h) {
			WIN.height = h;
			body.style.height = 'auto';
		}

		_go = function (el) {
			var t = el['tag'] || 'panel';
			var o;

			if (UI.controls[t] && UI.controls[t]._create)
				o = UI.controls[t]._create(el);
			else {
				o = document.createElement(UI.types[t]['tag']);
				_for(el, function (val, key) {
					if (_not_attr[key]) return;

					if (UI.attributes[t] && UI.attributes[t][key])
						key = UI.attributes[t][key];

					if (key === 'css') return o.style.cssText = val;
					if (key === 'css_class') return o.className = val;
					if (key === 'innerHTML') return o.innerHTML = val;
					if (key === 'tag') return o.dataset['tag'] = val;
					_set_attr(o, key, val);
				});
			}

			if (el['id'])
				_ids[el['id']] = o;

			if (el['children']) _for(el['children'], function (ch) {
				o.appendChild(_go(ch));
			});

			if (el['events']) {
				var all = el['events'].split(';');
				_for(all, function (func) {
					func = func.split(':');
					o['on'+func[0]] = function (e) {
						UI.event(func[1], e);
					};
				});
			}

			_all.push({
				type : t,
				node : o
			});

			if (UI.controls[t] && UI.controls[t]._created)
				created.push([t, o]);

			return o;
		};

		body.innerHTML = '';

		_for(json.body.children, function (ch) {
			body.appendChild(_go(ch));
		});

		_for(created, function (cr) {
			UI.controls[cr[0]]._created(cr[1]);
		});
	};

	UI.init = function (file) {
		_init(file);
		UI.event('UI:inited');
	};

	UI.attributes = {
		'button' : {
			'innerHTML' : 'value'
		}
	};

	UI.types = {
		'frame' : {
			'tag' : 'iframe'
		},

		'webview' : {
			'tag' : 'webview'
		},

		'button' : {
			'tag' : 'input',
			'attr' : 'type:button;value:Кнопка'
		},

		'tabs' : {
			'tag' : 'span',
			'attr' : 'closing:false;close_notify:'
		},

		'progress' : {
			'tag' : 'span',
			'inner' : '<b></b>'
		},

		'input' : {
			'tag' : 'input',
			'attr' : 'type:text;value:'
		},

		'image' : {
			'tag' : 'img'
		},

		'video' : {
			'tag' : 'video'
		},

		'color' : {
			'tag' : 'input',
			'attr' : 'type:color;value:#000000'
		},

		'link' : {
			'tag' : 'a'
		},

		'list' : {
			'tag' : 'select'
		},

		'listbox' : {
			'tag' : 'span'
		},

		'checkbox' : {
			'tag' : 'span',
			'inner' : '<b></b><span></span>'
		},

		'area' : {
			'tag' : 'textarea'
		},

		'panel' : {
			'tag' : 'div'
		},

		'span' : {
			'tag' : 'span'
		},

		'label' : {
			'tag' : 'span'
		},

		'paragraph' : {
			'tag' : 'p'
		},

		'header' : {
			'tag' : 'span'
		},

		'range' : {
			'tag' : 'span',
			'inner' : '<b></b>'
		}
	};

	UI.default_css = {
		'all' : 'padding:5px 10px;margin:5px;',
		'panel' : '',
		'image' : '!margin:5px;',
		'frame' : '!display:inline-block;width:400px;height:200px;',
		'webview' : '!display:inline-block;width:400px;height:200px;',
		'span' : 'display:inline-block;',
		'label' : 'display:inline-block;',
		'header' : 'display:block;font-weight:bold;font-size:20px;text-align:center;',
		'color' : '!margin:5px;',
		'checkbox' : '!margin: 5px;',
		'progress' : '!margin: 5px;',
		'tabs' : '!margin: 5px;',
		'range' : '!margin: 5px;'
	};

	UI.controls = {

		'tabs' : {
			_hooks : ['change'],

			_create : function (el) {
				var _tabs = '';
				var o = _create('span');
				o.dataset['tag'] = 'tabs';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'closing') return o.dataset[key] = val;
					if (key === 'close_notify') return o.dataset[key] = val;
					if (key === 'selected') return o.dataset['for_select'] = val;
					if (key === 'tabs') return _tabs = val;
					_set_attr(o, key, val);
				});

				if (_tabs) {
					var data = _tabs.trim().split(';');
					_for(data, function (pg) {
						if (!pg) return;
						pg = pg.trim().split(':');
						var tab = _create('span');
						var name = _create('span');

						tab.dataset['tab'] = '';
						tab.dataset['uid'] = pg[0];

						name.innerHTML = pg[1] ? pg[1] : pg[0];
						name.className = 'name';

						tab.appendChild(name);

						if (o.dataset['closing'] === 'true') {
							var close = _create('span');
							close.innerHTML = '&#10006;';
							close.className = 'close';
							tab.appendChild(close);
						}

						o.appendChild(tab);
					});
				}

				return o;
			},

			_created : function (o) {
				var NC = _get_control('', o);
				NC._update();
				if (o.dataset['for_select']) {
					_for(o.children, function (ch) {
						if (ch.dataset['uid'] === o.dataset['for_select'])
							ch.click();
					});
					delete o.dataset['for_select'];
				}
			},

			_update : function () {
				var NC = this, node = this.node;
				var _index = 0, selected = null;

				_for(node.children, function (ch) {
					ch.dataset['index'] = _index;
					ch.onclick = function (e) {
						var old = '';
						if (selected) {
							selected.dataset['tab'] = '';
							old = selected.dataset['uid'];
						}
						selected = this;
						selected.dataset['tab'] = 'selected';
						selected.parentNode.dataset['selected_index'] = this.dataset['index'];
						selected.parentNode.dataset['selected_uid'] = this.dataset['uid'];
						NC.event('change', this.dataset['uid'], old);
					};

					if (ch.children[1]) {
						ch.children[1].onclick = function (e) {
							e.stopPropagation();
							var tr = true;
							if (node.dataset['close_notify'])
								tr = confirm(node.dataset['close_notify']);
							if (tr)
								NC.close(ch.dataset['uid']);
						};
					}

					_index += 1;
				});
			},

			close : function (uid) {
				var NC = this, node = this.node;
				_for(node.children, function (ch) {
					if (ch.dataset['uid'] === uid) {
						node.removeChild(ch);
						NC._update();
					}
				});
			},

			value : function (set) {
				var NC = this, node = this.node;

				if (set) _for(node.children, function (ch) {
					if (ch.dataset['uid'] === set) {
						ch.click();
						this.event('change', set);
					}
				});

				return node.dataset['selected_uid'];
			},
			index : function () { return this.node.dataset['selected_index'] },
			count : function () { return this.node.children.length }


		},

		'range' : {
			_hooks : ['change'],

			_create : function (el) {
				var o = _create('span');
				o.dataset['tag'] = 'range';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'value') return o.dataset[key] = val;
					if (key === 'min') return o.dataset[key] = val;
					if (key === 'max') return o.dataset[key] = val;
					if (key === 'int') return o.dataset[key] = val;
					_set_attr(o, key, val);
				});
				return o;
			},

			_created : function (o) {
				var NC = _get_control('', o);
				NC._update();

				var _x = null;
				var _old = 0;

				var node = NC.node;

				node.firstChild.onmousedown = function (e) {
					_x = _mouse.pos[0];
					_old = int(node.dataset['value']);

					UI.on('UI:update', function () {
						var _set = _mouse.pos[0] - _x;
						NC._set(_old + _set);
					}, 'range_x');

					UI.on('mouseup', function () {
						UI.off('UI:update', 'range_x');
					});
				};

			},

			_set : function (val) {
				var node = this.node;
				var pr = node.firstChild;
				val = parseInt(val);
				var max = node.clientWidth - parseInt(pr.offsetWidth);
				val = val < 0 ? 0 : (val > max ? max : val);
				pr.style.left = val + 'px';
				node.dataset['value'] = val;
				this.event('change', this.value());
			},

			_update : function () {
				var node = this.node;
				var pr = node.firstChild;
				var width = node.clientWidth - parseInt(pr.offsetWidth);
				var val = int(node.dataset['value']);
				var min = int(node.dataset['min']);
				var max = int(node.dataset['max']);
				var pos = (width/(max-min)) * val;
				pr.style.left = int(pos) + 'px';
				node.dataset['value'] = pos;
			},

			value : function (set) {
				var node = this.node;
				var val = int(node.dataset['value']);
				var min = int(node.dataset['min']);
				var max = int(node.dataset['max']);

				if (set) {
					set = _range(set, min, max);
					this.node.dataset['value'] = set;
					this._update();
					this.event('change', set);
					return set;
				}

				var pr = node.firstChild;
				var width = node.clientWidth - parseInt(pr.offsetWidth);

				var pers = (val/width)*100;

				if (node.dataset['int'] === 'true')
					return Math.ceil((pers/100)*(max-min)+min);

				return (pers/100)*(max-min)+min;
			}

		},

		'progress' : {
			_create : function (el) {
				var o = _create('span');
				o.dataset['tag'] = 'progress';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'value') return o.dataset[key] = val;
					_set_attr(o, key, val);
				});
				o.firstChild.style.width = o.dataset['value'] + '%';
				return o;
			},

			_set : function (set) {
				set = int(set);
				set = set < 0 ? 0 : (set > 100 ? 100 : set);
				this.node.firstChild.style.width = set+'%';
				this.node.dataset['value'] = set;
			},
			value : function (set) {
				if (typeof set !== 'undefined') this._set(set);
				return int(this.node.dataset['value']);
			},
			add : function (set) {
				this._set(this.value()+set);
			}

		},

		'checkbox' : {
			_create : function (el) {
				var o = _create('span');
				o.dataset['tag'] = 'checkbox';
				o.innerHTML = '<b></b><span></span>';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'checked') return o.dataset[key] = val;
					if (key === 'label') return o.children[1].innerHTML = val;
					_set_attr(o, key, val);
				});

				o.addEventListener('click', function (e) {
					this.dataset['checked'] = this.dataset['checked'] === 'true' ? 'false' : 'true';
				});

				return o;
			},

			text : _nullf,
			value : function (set) {
				if (set === true) this.node.dataset['checked'] = 'true';
				else if (set === false) this.node.dataset['checked'] = 'false';
				return this.node.dataset['checked'] === 'true';
			},
			check : function () {
				this.node.dataset['checked'] = this.node.dataset['checked'] === 'true' ? 'false' : 'true';
			}
		},

		'list' : {
			_create : function (el) {
				var o = _create('select');
				o.dataset['tag'] = 'list';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'innerHTML') return;

					if (key === 'list') {
						val = val.toString().split(';');
						_for(val, function (v) {
							v = v.toString().trim().split(':');
							if (!v[0]) return;
							var opt = _create('option');
							opt.value = v[0].trim();
							opt.text = (v[1] ? v[1] : v[0]).trim();
							o.appendChild(opt);
						});
						return;
					}
					_set_attr(o, key, val);
				});
				return o;
			},

			add : function (opts) {
				var node = this.node;
				_for(opts, function (text, value) {
					var o = _create('option');
					o.value = value;
					o.text = text;
					node.appendChild(o);
				});
			},
			values : function (opts) {
				if (opts) {
					var node = this.node;
					node.options.length = 0;
					_for(opts, function (text, value) {
						var o = _create('option');
						o.value = value;
						o.text = text;
						node.appendChild(o);
					});
					return;
				}
				var list = {};
				_for(this.node.options, function (l) {
					list[l.value] = l.text;
				});
				return list;
			},
			options : function () { return this.node.options },
			count : function () { return this.node.options.length },
			index : function () { return this.node.options.selectedIndex },
			remove : function (index) { this.node.remove(index ? index : this.node.options.selectedIndex) },
			clear : function () { this.node.options.length = 0 },
			value : function () { return this.node.value },
			text: function () { return this.node.options[this.node.options.selectedIndex].text }
		},

		'listbox' : {
			_create : function (el) {
				var o = _create('span');
				o.dataset['tag'] = 'listbox';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'innerHTML') return;

					if (key === 'list') {
						var list = val.toString().split(';'), inner = '';
						_for(list, function (l) {
							if (!l) return;
							l = l.toString().split(':');
							var opt = _create('span');
							opt.dataset['value'] = l[0].trim();
							opt.innerHTML = (l[1] ? l[1] : l[0]).trim();
							o.appendChild(opt);
						});
						return;
					}

					_set_attr(o, key, val);
				});
				return o;
			},

			_created : function (o) {
				_get_control('', o)._update();
			},

			_update : function () {
				var NC = this;
				NC.node.innerHTML += ''; // это костыль
				var list = NC.node.children;
				NC.selected = null;
				_for(list, function (el, i) {
					delete el.dataset['selected'];
					el.dataset['index'] = i;
					el.onmouseup = function (e) {
						if (NC.selected) delete NC.selected.dataset['selected'];
						NC.selected = this;
						NC.selected.dataset['selected'] = 'true';
						NC.node.dataset['index'] = this.dataset['index'];
					};
				});
			},

			add : function (opts) {
				var node = this.node;
				_for(opts, function (text, value) {
					var o = _create('span');
					o.dataset['value'] = value;
					o.innerHTML = text;
					node.appendChild(o);
				});
				this._update();
			},

			remove : function (index) {
				this.node.removeChild(this.node.children[index]);
				this._update();
			},
			index : function () { return int(this.node.dataset['index']) },
			count : function () { return this.node.children.length },
			clear : function () { this.node.innerHTML = ''; this._update() },
			value : function () { return this.node.children[this.node.dataset['index']].dataset['value'] },
			text : function () { return this.node.children[this.node.dataset['index']].innerHTML },
			set_text : function (index, text) { this.node.children[index].innerHTML = text },
			set_value : function (index, value) { this.node.children[index].dataset['value'] = value },


		},

		'frame' : {
			_create : function (el) {
				var o = _create('iframe');
				o.dataset['tag'] = 'frame';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'innerHTML') return;
					_set_attr(o, key, val);
				});
				return o;
			},

			reload : function () { this.node.src = this.node.src; },
			get_html : function () { return this.node.contentDocument; },
			load : function (url) { this.node.src = url; }
		},

		'webview' : {
			_create : function (el) {
				var o = _create('webview');
				o.dataset['tag'] = 'webview';
				_for(el, function (val, key) {
					if (_not_attr[key]) return;
					if (key === 'css') return o.style.cssText = val.replace();
					if (key === 'css_class') return o.className = val;
					if (key === 'innerHTML') return;
					_set_attr(o, key, val);
				});
				return o;
			},

			events : {'load' : 'loadstop', 'open' : 'loadstart'},

			reload : function () { this.node.reload(); },
			get_html : function () { this.node.contentDocument; },
			load : function (url) { this.node.src = url; }
		}


	};

	UI.encode = function (str) {
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
		}));
	};

	UI.decode = function (str) {
		return decodeURIComponent(atob(str).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
	};

	UI.parse_css = function (css) {
		var rules = {
			'all' : '*[data-tag]',
			'button' : '*[data-tag="button"]',
			'area' : '*[data-tag="area"]',
			'list' : '*[data-tag="list"]',
			'color' : '*[data-tag="color"]',
			'label' : '*[data-tag="label"]',
			'header' : '*[data-tag="header"]',
			'paragraph' : '*[data-tag="paragraph"]',
			'frame' : '*[data-tag="frame"]',
			'webview' : '*[data-tag="webview"]',
			'video' : '*[data-tag="video"]',
			'panel' : '*[data-tag="panel"]',
			'image' : '*[data-tag="image"]',
			'input' : '*[data-tag="input"]',
			'link' : '*[data-tag="link"]',

			'checkbox' : '*[data-tag="checkbox"]',
			'checkbox_checker' : '*[data-tag="checkbox"] b',
			'checkbox_label' : '*[data-tag="checkbox"] span',
			'checkbox_checked' : '*[data-tag="checkbox"][data-checked="true"] b',
			'checkbox_checked_label' : '*[data-tag="checkbox"][data-checked="true"] span',

			'progress' : '*[data-tag="progress"]',
			'progress_filler' : '*[data-tag="progress"] b',

			'listbox' : '*[data-tag="listbox"]',
			'listbox_item' : '*[data-tag="listbox"] span',

			'range' : '*[data-tag="range"]',
			'range_slider' : '*[data-tag="range"] b'
		};

		css = css.toString();
		_for(rules, function (to, from) {
			var f = new RegExp('\\.\\b'+from+'\\b', 'gi');
			if (css.match(f)) {
				css = css.replace(f, to);
			}
		});

		return css;
	};

	UI.import_css = function (file) {
		var css = _read(file);
		var skin;
		if (!(skin = document.getElementById('__import_css'))) {
			skin = document.createElement('style');
			skin.id = '__import_css';
			document.head.appendChild(skin);
		}
		skin.innerHTML = UI.parse_css(css);
	};

	// INIT EVENTS /////////////////////////////////////////////////////////
	var _upd_mouse_pos = function (e) {
		_mouse.pos = [e.pageX, e.pageY];
	};

	// window
	window.addEventListener('load', function (e) {
		UI.event('UI:loaded', e);
	});

	window.addEventListener('blur', function (e) {
		UI.event('UI:blur', e);
	});

	window.addEventListener('focus', function (e) {
		UI.event('UI:focus', e);
	});

	// mouse
	window.addEventListener('mousemove', function (e) {
		_upd_mouse_pos(e);
		UI.event('mousemove', e);
	});

	window.addEventListener('mousedown', function (e) {
		_upd_mouse_pos(e);
		UI.event('mousedown', e);
	});

	window.addEventListener('mouseup', function (e) {
		_upd_mouse_pos(e);
		UI.event('mouseup', e);
	});

	window.addEventListener('click', function (e) {
		UI.event('click', e);
	});

	window.addEventListener('wheel', function (e) {
		UI.event('wheel', e, e.deltaX, e.deltaY);
	});

	window.addEventListener('contextmenu', function (e) {
		_upd_mouse_pos(e);
		UI.event('contextmenu', e);
	});

	window.addEventListener('dblclick', function (e) {
		UI.event('dblclick', e);
	});

	// keyboard
	window.addEventListener('keydown', function (e) {
		_keys[e.keyCode] = e.key;
		UI.event('keydown', e);
	});

	window.addEventListener('keypress', function (e) {
		UI.event('keypress', e);
	});

	window.addEventListener('keyup', function (e) {
		delete _keys[e.keyCode];
		UI.event('keyup', e);
	});

	var _ui_update = function () {
		UI.event('UI:update');
		requestAnimationFrame(_ui_update);
	};

	_ui_update();

	////////////////////////////////////////////////////////////////////////
};




