var Pages;
if (typeof parent.Pages !== 'undefined') Pages = parent.Pages;
else Pages = new function () {
	var _Pages = this;
	var pages = {};
	var active_page = null;
	var delm  = Fs.delm;

	this.get_pages = function () {
		return pages;
	};

	this.in_active = function () {
		if (!active_page || !pages[active_page]) return null;
		return pages[active_page].frame.contentWindow || null;
	};

	this.save_active = function () {
		var p = Pages.in_active();
		if (!p) return;

		if (typeof p.SAVE === 'function')
			p.SAVE();

		Project.save_project();
	};

	this.restore_active = function () {
		var p = Pages.in_active();
		if (!p) return;

		if (typeof p.RESTORE === 'function')
			p.RESTORE();
	};

	this.focus_active = function () {
		var p = Pages.in_active();
		if (!p) return;

		if (typeof p.FOCUS === 'function')
			p.FOCUS();
	};

	this.call_active = function (func_name, p1,p2,p3,p4,p5) {
		var p = Pages.in_active();
		if (!p) return;

		if (typeof p[func_name] === 'function')
			return p[func_name](p1,p2,p3,p4,p5);
	};

	this.update_keys = function (path) {
		var keys = [];

		_for(pages, function (page) {
			if (page.path === path) return;
			keys = keys.concat(Pages.call(page.path, 'GET_KEYS') || []);
		});

		_Pages.call(path, 'UPDATE_KEYS', keys);
	};

	this.update_active_keys = function () {
		var keys = [];

		_for(pages, function (page) {
			if (page.path === active_page) return;
			keys = keys.concat(Pages.call(page.path, 'GET_KEYS') || []);
		});

		_Pages.call_active('UPDATE_KEYS', keys);
	};

	this.call = function (path, func_name, p1,p2,p3,p4,p5) {
		var page = pages[path];
		if (!path || !page) return;
		if (!page.frame || !page.frame.contentWindow) return null;

		if (typeof page.frame.contentWindow[func_name] === 'function')
			return page.frame.contentWindow[func_name](p1,p2,p3,p4,p5);
	};

	this.call_all = function (func_name, p1,p2,p3,p4,p5) {
		_for(pages, function (page) {
			_Pages.call(page.path, func_name, p1,p2,p3,p4,p5);
		});
	};

	this.refresh_active = function () {
		var p = Pages.in_active();
		if (!p) return;
		if (typeof p.RELOAD === 'function') {
			p.RELOAD();
		}
	};

	this.refresh_all = function () {
		_for(pages, function (page) {
			if (typeof page.frame.contentWindow.RELOAD === 'function')
				page.frame.contentWindow.RELOAD();
		});
	};

	this.get_active = function () {
		if (!active_page) return null;
		return pages[active_page];
	};

	this.get_active_file_path = function () {
		if (!active_page) return '';
		return pages[active_page].path.replace(/^.+#/i, '');
	};

	this.select = function (path, not_save) {
		if (!path || !pages[path]) return;
		if (active_page === path) return;

		if (active_page && pages[active_page]) {
			if (!not_save) Pages.save_active();
			pages[active_page].tab.className = pages[active_page].tab.className.replace(' tab_selected', '');
			pages[active_page].frame.style.display = 'none';
		}

		pages[path].tab.className += ' tab_selected';
		pages[path].frame.style.display = 'block';

		if (pages[path].frame.contentWindow.FOCUS)
			pages[path].frame.contentWindow.FOCUS();

		active_page = path;

		Pages.update_active_keys();
		Project.set_active_page(path);
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('pages:select', W, Pages);
		/////////////////////////////////////////////////////////////////
	};

	this.clear = function () {
		var i;
		for (i in pages) {
			$('tabs').removeChild(pages[i].tab);
			$('frames').removeChild(pages[i].frame);
		}

		active_page = null;
		pages = {};
		Project.clear_pages();
	};

	this.close_page = function (path) {
		if (pages[path]) return _Pages.close(path);
		var pg = _Pages.find(path);
		if (pg) _Pages.close(pg['path']);
	};

	this.add_page = function (path, name) {
		if (!name) name = Fs.parse(path)['name'];
		var ex = Fs.parse(path)['ex'];

		if (ex.match(/^(js|php|css|html|txt|json)$/i))
			return _Pages.add('pages/editor.html#'+path, name);

		if (ex.match(/png|jpe?g|bmp|gif/i))
			return _Pages.add('pages/image.html#'+path, name);

		if (ex.match(/ui/i))
			return _Pages.add('pages/ui_editor.html#'+path, name);

		Dial.notify('Неизвестный тип файла. Открыт как текст.', 'notify_info');
		return _Pages.add('pages/editor.html#'+path, name);
	};

	this.find = function (path) {
		var fnd = null;
		_for(pages, function (pg) {
			if (pg.path.match(new RegExp(path))) {
				fnd = pg;
				return 'break';
			}
		});
		return fnd;
	};

	this.close = function (path) {
		var page = pages[path];
		if (!page) return;

		$('tabs').removeChild(page.tab);
		$('frames').removeChild(page.frame);

		if (path === active_page) {
			var old_page = null, i, is_first = false, cnt = 0;
			for (i in pages) {
				if (pages[i].path === path) {
					if (cnt === 0) {
						is_first = true;
						break;
					}
					Pages.select(old_page.path);
					break;
				}
				old_page = pages[i];
				cnt+=1;
			}

			if (is_first) {
				old_page = {};
				for (i in pages) {
					if (old_page.path === path) {
						Pages.select(pages[i].path);
						break;
					}
					old_page = pages[i];
				}
			}

		}

		delete pages[path];
		Project.del_page(path);
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('pages:closed', W, Pages);
		/////////////////////////////////////////////////////////////////
	};

	this.add_custom = function (path, name, not_select, not_save) {
		this.add('pages/custom.html#'+path, name, not_select, not_save);
	};

	this.restruct = function () {
		Project.clear_pages();
		$for($('tabs'), function (el) {
			Project.add_page(el.dataset['path'], el.dataset['name']);
		});
		Project.save_project();
	};

	this.add = function (path, name, not_select, not_save) {
		if (pages[path]) return Pages.select(path);

		var page = {
			tab : Node,
			frame : Node,
			type : 'legacy',
			path : path,
			file : path.replace(/^.+#/i, '')
		};

		page.tab = $create('span');
		page.tab.className = 'tab';
		page.tab.dataset['path'] = page.path;
		page.tab.dataset['name'] = name;

		page.tab.onclick = function () {
			Pages.select(page.path);
		};

		var label = $create('span');
		label.innerHTML = name;
		page.tab.appendChild(label);

		var close = $create('span');
		close.className = 'close';
		close.innerHTML = '&#10006;';

		close.onclick = function (e) {
			e.stopPropagation();
			Pages.close(page.path);
		};

		page.frame = $create('iframe');
		page.frame.style.opacity = 0;
		page.frame.className = 'frame';

		page.frame.onload = function () {
			this.style.opacity = 1;
			if (this.contentWindow.FOCUS)
				this.contentWindow.FOCUS();
		};

		page.frame.src = path;

		page.tab.draggable = true;

		page.tab.addEventListener('dragstart', function (e) {
			window.dragster = this;
		});

		page.tab.addEventListener('drop', function (e) {
			e.preventDefault();
			this.parentNode.insertBefore(window.dragster, this);
			_Pages.restruct();
			return true;
		});

		page.tab.addEventListener('dragend', function (e) {
			window.dragster = null;
		});

		page.tab.addEventListener('dragenter', function (e) {
			e.preventDefault();
			return true;
		});

		page.tab.addEventListener('dragleave', function (e) {
			e.preventDefault();
			return true;
		});

		page.tab.appendChild(close);
		$('tabs').appendChild(page.tab);
		$('frames').appendChild(page.frame);
		pages[path] = page;
		Project.add_page(path, name);
		if (!not_select) this.select(path, not_save);
		else page.frame.style.display = 'none';

		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('pages:added', W, Pages);
		/////////////////////////////////////////////////////////////////
	};
};