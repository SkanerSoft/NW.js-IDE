var W = window,
		D = document,
		MOUSE_X = 0,
		MOUSE_Y = 0;

var $B = function () {
	return document.body;
};

var $D = function () {
	return D;
};

var $H = function () {
	return D.head;
};

var $log = console.log;

var int = function (num) {
	return parseInt(num);
};

var $ = function (id) {
	return D.getElementById(id);
};

var $del = function (id) {
	id = $el(id);
	if (id) id.parentNode.removeChild(id);
};

var $sh_states = {};
var $show_hide = function (id, vis) {
	id = $el(id);
	if (vis) {
		id.style.display = vis;
		return vis !== 'none';
	}

	if (id.style.display !== 'none') {
		$sh_states[id] = id.style.display;
		id.style.display = 'none';
	} else {
		id.style.display = is($sh_states[id], '');
	}

	return id.style.display !== 'none';
};

var $create = function (tag) {
	return D.createElement(tag);
};

var $is_color = function (str) {
	return !!str.match(/(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i);
};

var is = function (val, def) {
	if (!def) def = '';
	return typeof val !== 'undefined' ? val : def;
};

var $go = function (url) {
	IDE.GUI.Shell.openExternal(url);
};

var in_arr = function (val, arr) {
	var i = arr.length - 1;
	for (;i>=0;i-=1) {
		if (val === arr[i]) return true;
	}
	return false;
};

var _for = function (obj, clb) {
	var i;
	for (i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		var r = clb(obj[i], i);
		if (r === 'break') break;
	}
};

var _for_int = function (start, end, clb) {
	for (;start < end+1; start+=1) {
		clb(start);
	}
};

var $for = function (el, func) {
	var list = el.children, l;
	for (l in list) {
		if (!list.hasOwnProperty(l)) continue;
		var r = func(list[l]);
		if (r === 'break') break;
	}
};

var $call = function (func, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
	if (typeof func === 'function')
		func(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
};

var $el = function (el) {
	if (typeof el === 'string') el = $(el);
	return el;
};

var $ch_sel = function (el) {
	el = $el(el);
	if (!$(id).className.match(/running/))
		$select(el);
	else
		$unselect(el);
};

var $select = function (id) {
	id = $el(id);
	if (!id.className.match(/running/))
		id.className += ' running';
};

var $unselect = function (id) {
	id = $el(id);
	if (id.className.match(/running/))
		id.className = id.className.replace(' running', '');
};

var $pos = function (el, x, y) {
	if (typeof el === 'string') el = $(el);
	el.style.left = x + 'px';
	el.style.top = y + 'px';
};

var $size = function (el, x, y) {
	el = $el(el);
	return {
		x : el.offsetWidth,
		y : el.offsetHeight
	}
};

var $get_pos = function (el) {
	el = $el(el);
	return el.getBoundingClientRect();
};

var $input_enter = function (el, act) {
	if (typeof el === 'string') el = $(el);
	if (typeof act === 'string') act = $(act);
	el.onkeydown = function (e) {
		if (e.keyCode !== 13) return;
		act.click();
	};
};

var $button = function (el, name, click, br, className, hint) {
	var b = $create('button');
	b.innerHTML = name;
	b.onclick = click;
	b.title = hint || '';
	$append(b, el);

	if (className) b.className = className;
	if (br) $append($create('br'), el)

};

var $text = function (text, el) {
	var t = $create('div');
	t.innerHTML = text;
	if (el) $append(t, $el(el));
};

var $append = function (el, prt) {
	if (!prt) prt = $B();
	else prt = $el(prt);
	prt.appendChild(el);
};

var $remove = function (el, prt) {
	if (!prt) prt = $B();
	prt.removeChild(el);
};

var $url = function (url) {
	location.href = url;
};

var $reload = function () {
	location.reload(true);
};

var $opts_from_obj = function (obj, sel) {
	var l = '';
	_for(obj, function (val, key) {
		l += '<option'+(key === sel ? ' selected ' : ' ')+'value="'+key+'">'+val+'</option>';
	});
	return l;
};

var $stop_events = function (e) {
	e.stopPropagation(); e.preventDefault();
};

var $set_theme = function (theme, path, folder) {
	var delm = Fs.delm;
	if (!folder) folder = '';
	else folder += delm;
	var _set = function (theme, path) {
		if (!path) path = './';
		if (!theme) theme = 'ide_violet';
		var head  = $D().getElementsByTagName('head')[0];
		var link  = $create('link');
		link.rel  = 'stylesheet';
		link.type = 'text/css';
		link.href = path+'themes/'+folder+theme+'.css';
		link.media = 'all';
		$append(link, head);
	};
	_set(theme, path);
	setTimeout(function () {
		_set('ide_end', path);
	}, 300);
};

W.addEventListener('contextmenu', function (e) {
	e.preventDefault();
	if (typeof CONTEXT === 'function') {
		CONTEXT();
	}
});

W.addEventListener('mousedown', function (e) {
	MOUSE_X = e.pageX;
	MOUSE_Y = e.pageY;
});

W.addEventListener('drop', $stop_events);
W.addEventListener('dragover', $stop_events);
W.addEventListener('dragleave', $stop_events);

var IDE;
if (typeof parent.IDE !== 'undefined') IDE = parent.IDE;
else IDE = new function () {
	var IDE = this;
	var App = this.App = nw.App;
	var NWW = this.NWW = nw.Window.get();
	var clip = nw.Clipboard.get();
	var gui = require('nw.gui');
	var os = this.OS = require('os');
	var shell = this.shell = nw.Shell;
	// NWW.showDevTools();

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// BUFFER //////////////////////////////////////////////////

	this.get_buffer = function () {
		return clip.get().toString();
	};

	this.to_buffer = function (text) {
		clip.set(text);
	};

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// CONFIG //////////////////////////////////////////////////

	var TYPES = {
		'legacy' : 'HTML5 WEB',
		'nw' : 'HTML5 NW.js Desktop',
		'nwui' : 'NW.js UI Desktop',
		'nodejs' : 'NodeJS Console',
		'build' : 'Builder (deprecated)'
	};

	var FILE_TYPES = {
		'empty' : 'Пустой',
		'html5' : 'HTML5',
		'joint_module' : 'Joint Module'
	};

	this.add_type = function (key, name) {
		TYPES[key] = name;
	};

	this.get_types = function () {
		return TYPES;
	};

	this.get_file_templates = function () {
		return FILE_TYPES;
	};

	var config = {
		all_projects : '',
		active_project : '',
		nw_path : ''
	};

	this.set_conf = function (key, val) {
		config[key] = val;
	};

	this.get_conf = function (key) {
		if (!config[key]) return '';
		return config[key];
	};

	var save_conf = this.save_conf = function () {
		Fs.write_file(Fs.home+'/config.json', JSON.stringify(config));
	};

	this.system_pages = [
		'pages/hello.html'
	];

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// WINDOW OPTIONS //////////////////////////////////////////

	this.restart = function () {
		W.location.reload();
	};

	this.is_win = function () {
		return !!this.platform().toString().match(/win/);
	};

	this.platform = function () {
		return os.platform();
	};

	this.GUI = gui;

	this.close = function () {
		Pages.save_active();
		// RUN EVENT ///////////////
		Events.run('ide:close', W, IDE);
		///////////////////////////
		App.quit();
	};

	var fulled = false;
	this.full = function () {
		if (fulled) {
			NWW.restore();
			fulled = false;
			return;
		}
		NWW.maximize();
		fulled = true;
	};

	this.min = function () {
		NWW.minimize();
	};

	this.set_title = function (name) {
		$('ide_title').innerHTML = 'NW.js IDE v 0.0.8 - ' + name;
	};

	this.focus = function () {
		Pages.focus_active();
	};

	this.window = W;

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// Hot Keys ////////////////////////////////////////////////
	var pressed = {};
	var map = {}; // ControlEnter : function (...)
	IDE.register_key = function (key_arr, clb) {
		map[key_arr.join('')] = clb;
	};

	IDE.update_key = function (W) {
		W.addEventListener('keydown', function (e) {
			pressed[e.key] = true;
			var prs = '';
			_for(pressed, function (p, key) {
				prs += key;
			});
			if (map[prs]) {
				map[prs](e);
				pressed = {};
			}
		});

		W.addEventListener('keyup', function (e) {
			delete pressed[e.key];
		});
	};

	IDE.update_key(W);
	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// INITIALIZATION //////////////////////////////////////////

	this.init_actions = function (type) {


		// init file drop event on tabs panel ////////////////////

		$('tabs').addEventListener('dragover', function (e) {
			$stop_events(e);
			if (!window.dragster) {
				this.className = 'tabs tabs_drop';
			}
		}, false);

		$('tabs').addEventListener('dragleave', function (e) {
			$stop_events(e);
			this.className = 'tabs';
		}, false);

		$('tabs').addEventListener('drop', function (e) {
			$stop_events(e);
			this.className = 'tabs';
			var files = e.target.files || e.dataTransfer.files;
			_for(files, function (file) {
				var path = Fs.dp(file.path);
				var name = Fs.parse(path)['name'];
				Pages.add('pages/editor.html#'+path, name);
			});
		}, false);

		//////////////////////////////////////////////////////////

		$('actions').innerHTML = '';
		var run, stop;

		if (type === 'nw' || type === 'nwui') {
			run = $create('button');
			run.id = '_btn_run_debug';
			run.innerHTML = '&#9658;';
			run.onclick = function (e) {
				Pages.save_active();
				Debug.start();
			};

			stop = $create('span');
			stop.id = '_btn_stop_debug';
			stop.innerHTML = '&nbsp;';
			stop.style.backgroundColor = '#d4473a';
			stop.style.padding = '0px 5px';
			stop.style.marginRight = '10px';
			stop.style.fontSize = '10px';
			stop.style.cursor = 'pointer';
			stop.style.display = 'none';

			stop.onclick = function (e) {
				Debug.stop();
			};

			var build = $create('button');
			build.id = '_btn_build_nw';
			build.innerHTML = '⚙';
			build.style.paddingLeft = build.style.paddingRight = '10px';

			build.onclick = function (e) {
				Pages.add('pages/compile.html', 'Сборка');
			};

			$('actions').appendChild(stop);
			$('actions').appendChild(run);
			$('actions').appendChild(build);
		} else if (type === 'build') {
			run = $create('button');
			run.id = '_btn_run_debug';
			run.innerHTML = '⚙';

			run.onclick = function (e) {
				Pages.save_active();
				Units.build();
			};

			$('actions').appendChild(run);
		} else if (type === 'nodejs') {
			run = $create('button');
			run.id = '_btn_run_debug';
			run.innerHTML = '&#9658;';
			run.title = 'Ctrl+Enter';

			run.onclick = function (e) {
				Pages.save_active();
				NodeJS.start();
			};

			stop = $create('span');
			stop.id = '_btn_stop_debug';
			stop.innerHTML = '&nbsp;';
			stop.style.backgroundColor = '#d4473a';
			stop.style.padding = '0px 5px';
			stop.style.marginRight = '10px';
			stop.style.fontSize = '10px';
			stop.style.cursor = 'pointer';
			stop.style.display = 'none';

			stop.onclick = function (e) {
				NodeJS.stop();
			};

			$('actions').appendChild(stop);
			$('actions').appendChild(run);

		} else if (type === 'legacy') {
			run = $create('button');
			run.id = '_btn_run_debug';
			run.innerHTML = '&#9658;';
			run.title = 'Ctrl+Enter';

			run.onclick = function (e) {
				Pages.save_active();
				Legacy.start();
			};

			stop = $create('span');
			stop.id = '_btn_stop_debug';
			stop.innerHTML = '&nbsp;';
			stop.style.backgroundColor = '#d4473a';
			stop.style.padding = '0px 5px';
			stop.style.marginRight = '10px';
			stop.style.fontSize = '10px';
			stop.style.cursor = 'pointer';
			stop.style.display = 'none';

			stop.onclick = function (e) {
				Legacy.stop();
			};

			$('actions').appendChild(stop);
			$('actions').appendChild(run);
		}



		// Console Button ///////////////////////////////////////////////
		var cons = $create('button');
		cons.id = '_btn_console_debug';
		cons.innerHTML = '&#9776;';
		cons.style.paddingLeft = cons.style.paddingRight = '10px';
		cons.onclick = function (e) { Debug.open_close(); };
		$('actions').appendChild(cons);
		/////////////////////////////////////////////////////////////////

		// Terminal Button //////////////////////////////////////////////
		var term = $create('button');
		term.id = '_btn_term_debug';
		term.innerHTML = '&#9850;';
		term.style.paddingLeft = term.style.paddingRight = '10px';
		term.onclick = function (e) { Term.open(); };
		$('actions').appendChild(term);
		/////////////////////////////////////////////////////////////////

		// CMD //////////////////////////////////////////////////////////
		var cmd = $create('button');
		cmd.id = '_cmd';
		cmd.innerHTML = '&#8646;';
		cmd.style.paddingLeft = cmd.style.paddingRight = '10px';
		cmd.onclick = function (e) { Cmd.open(); };
		$('actions').appendChild(cmd);
		/////////////////////////////////////////////////////////////////

		if (run) {
			IDE.register_key(['Control', 'Enter'], function () {
				run.click();
			});
		}

	};

	this.init = function () {
		var is = false;
		var delm = Fs.delm;
		if (Fs.is_file(Fs.home+'/config.json')) {
			config = JSON.parse(Fs.read_file(Fs.home+'/config.json').toString());
			if (config.active_project)
				is = Project.open_last(config.active_project);
		}

		if (!is) Pages.add('pages/hello.html', 'Hello!');

		$('files').oncontextmenu = function (e) {
			Files.show_tools();
		};

		$show_hide('debug', 'none');

		// INIT PLUGINS /////////////////////////////////////////////////
		Plugins.call_all('init');
		/////////////////////////////////////////////////////////////////
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('ide:init', W, IDE);
		/////////////////////////////////////////////////////////////////
	};

	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
};


// AJAX //////////////////////////////////////////////////////////////
var $ajax;
if (typeof parent.$ajax === 'undefined') $ajax = new function () {

	this.get = function (url, clb) {
		var x = new XMLHttpRequest();
		x.open('GET', url);
		x.onload = function () {
			clb(x.responseText);
		};
		x.send();
	};

}; else $ajax = parent.$ajax;
///////////////////////////////////////////////////////////////////////