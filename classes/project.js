var Project;
if (typeof parent.Project !== 'undefined') Project = parent.Project;
else Project = new function () {
	var delm = Fs.delm;

	var project_ide;

	this.path = '';
	this.name = '';

	var clear_ide = function () {
		project_ide = {
			name : name,
			open_pages : {},
			active_page : '',
			type : ''
		};
	};

	var create_ide = function (path) {
		Fs.write_file(path+'/ide.json', JSON.stringify(project_ide));
	};

	this.get_type = function () {
		return project_ide['type'];
	};

	this.add_page = function (path, name) {
		if (in_arr(path, IDE.system_pages)) return;
		project_ide.open_pages[path] = name;
	};

	this.del_page = function (path) {
		delete project_ide.open_pages[path];
	};

	this.clear_pages = function () {
		project_ide.open_pages = {};
	};

	this.set_active_page = function (path) {
		project_ide.active_page = path;
		Project.save_project();
	};

	this.save_project = function () {
		if (!this.path) return;
		Fs.write_file(this.path+'/ide.json', JSON.stringify(project_ide));
	};

	this.set = function (key, val) {
		project_ide[key] = val;
	};

	this.get = function (key) {
		if (!project_ide[key]) return '';
		return project_ide[key];
	};

	this.close = function () {
		IDE.set_conf('active_project', '');
		IDE.save_conf();
		IDE.restart();
	};

	this.get_package = function () {
		var path = this.path;
		if (!path || !Fs.is_file(path+'/package.json')) return {};
		return JSON.parse(Fs.read_file(path+'/package.json'));
	};

	this.create = function (sett) {
		clear_ide();
		project_ide.name = sett['name'];
		project_ide.type = sett['type'];
		this.path = sett['dir'];
		this.name = sett['name'];

		if (sett['type'] === 'nw') {
			project_ide.open_pages['pages/editor.html#'+sett['dir']+'/index.html'] = 'index.html';
			project_ide.active_page = 'pages/editor.html#'+sett['dir']+'/index.html';
			Fs.write_file(sett['dir']+'/package.json', Fs.read_file('templates/nw/package.json'));
			Fs.write_file(sett['dir']+'/index.html', Fs.read_file('templates/nw/index.html'));
		} else if (sett['type'] === 'nwui') {
			Fs.write_file(sett['dir']+'/package.json', Fs.read_file('templates/nwui/package.json'));
			Fs.write_file(sett['dir']+'/index.html', Fs.read_file('templates/nwui/index.html'));
			Fs.write_file(sett['dir']+'/index.ui', Fs.read_file('templates/nwui/index.ui'));
			Fs.write_file(sett['dir']+'/ui.js', Fs.read_file('pages/ui_editor/ui.js'));
		} else if (sett['type'] === 'build') {
			Fs.write_file(sett['dir']+'/config.json', Fs.read_file('templates/build/config.json'));
			Fs.write_file(sett['dir']+'/unit_a.js', Fs.read_file('templates/build/unit_a.js'));
			Fs.write_file(sett['dir']+'/unit_b.js', Fs.read_file('templates/build/unit_b.js'));
			Fs.write_file(sett['dir']+'/unit_c.js', Fs.read_file('templates/build/unit_c.js'));
			Fs.write_file(sett['dir']+'/unit_d.js', Fs.read_file('templates/build/unit_d.js'));
		} else if (sett['type'] === 'nodejs') {
			Fs.write_file(sett['dir']+'/package.json', Fs.read_file('templates/nodejs/package.json'));
			Fs.write_file(sett['dir']+'/app.js', Fs.read_file('templates/nodejs/app.js'));
			Fs.write_file(sett['dir']+'/main.js', Fs.read_file('templates/nodejs/main.js'));
		} else if (sett['type'] === 'legacy') {
			Fs.write_file(sett['dir']+'/package.json', Fs.read_file('templates/legacy/package.json'));
			Fs.write_file(sett['dir']+'/index.html', Fs.read_file('templates/legacy/index.html'));
			Fs.write_file(sett['dir']+'/app.js', Fs.read_file('templates/legacy/app.js'));
			project_ide.open_pages['pages/editor.html#'+sett['dir']+'/index.html'] = 'index.html';
			project_ide.active_page = 'pages/editor.html#'+sett['dir']+'/index.html';
		}

		this.save_project();
		Dial.close();
		this.open(sett['dir']);
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('project:created', W, Project);
		/////////////////////////////////////////////////////////////////
	};

	this.open_last = function (path) {
		if (!Fs.is_file(path+'/ide.json')) return false;
		Project.open(path);
		return true;
	};

	this.reopen = function () {
		var p = this.path;
		this.open(p);
	};

	this.open = function (path) {
		Pages.clear();
		Debug.clear();
		Debug.close();

		if (IDE.get_conf('active_project') !== path) {
			IDE.set_conf('active_project', path);
			IDE.save_conf();
		}

		if (!Fs.is_file(path+'/ide.json')) {
			project_ide.name = Fs.parse_dir(path)['name'];
			create_ide(path);
		}

		project_ide = JSON.parse(Fs.read_file(path+'/ide.json').toString());
		this.name = project_ide.name;
		this.path = path;
		IDE.set_title(this.name);
		Files.clear();
		Files.fill(path);

		var i;
		for (i in project_ide.open_pages) {
			if (!project_ide.open_pages.hasOwnProperty(i)) continue;
			Pages.add(i, project_ide.open_pages[i], true, true);
		}

		if (project_ide.active_page)
			Pages.select(project_ide.active_page);
		IDE.init_actions(project_ide.type);

		if (!project_ide.type) {
			Dial.re_type_project();
		}

		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('project:opened', W, Project);
		/////////////////////////////////////////////////////////////////
	};

	clear_ide();
};