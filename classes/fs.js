var delm = IDE.is_win() ? '\\' : '/';

var p = window.p = this.p = function (path) {
	path = path.split(/\\|\//);
	return path.join(delm);
};

var dp = window.dp = function (path) {
	return p(decodeURIComponent(path));
};

var ep = window.ep = function (path) {
	return encodeURIComponent(path);
};

var Fs;
if (typeof parent.Fs !== 'undefined') Fs = parent.Fs;
else Fs = new function () {
	var _Fs = this;
	var fs = require('fs');

	this.delm = delm;
	this.p = p;
	this.dp = dp;

	var home = this.home = dp(IDE.App.dataPath);

	this.parse = function (path) {
		path = dp(path);
		var _path = path.split(delm);
		var name = _path[_path.length - 1];
		var _name = name.split('.');
		var ex = _name[_name.length - 1];
		return {
			path : path,
			name : name,
			ex : ex
		};
	};

	this.parse_dir = function (path) {
		path = dp(path);
		var _path = path.split(delm);
		var name = _path.pop();
		return {
			path : path,
			name : name,
			back : _path.join(delm)
		};
	};

	this.is_dir = function (path) {
		path = dp(path);
		try {
			var stat = fs.statSync(path);
			return stat ? stat.isDirectory() : false;
		} catch (e) {
			return false;
		}
	};

	this.is_file = function (path) {
		path = dp(path);
		try {
			var stat = fs.statSync(path);
			return stat ? stat.isFile() : false;
		} catch (e) {
			return false;
		}
	};

	this.read_dir = function (path) {
		path = dp(path);
		var list = fs.readdirSync(path);
		var dirs = [], files = [];
		var i;

		for (i in list) {
			if (!list.hasOwnProperty(i)) continue;
			if (Fs.is_dir(path+'/'+list[i]))
				dirs.push(list[i]);
			else
				files.push(list[i]);
		}

		return {
			dirs : dirs,
			files : files
		};
	};

	this.del_file = function (path) {
		path = dp(path);
		try {
			fs.unlinkSync(path);
			return true;
		} catch (e) {
			Dial.notify('Ошибка удаления файла!', 'notify_no');
			return false;
		}
	};

	this.del_full_dir = function (path) {
		var list = _Fs.read_dir(path);
		_for(list.files, function (file) {
			_Fs.del_file(path+'/'+file);
		});

		_for(list.dirs, function (dir) {
			_Fs.del_full_dir(path+'/'+dir);
		});

		_Fs.del_dir(path);
		return true;
	};

	this.del_dir = function (path, all) {
		if (all) return this.del_full_dir(path);
		path = dp(path);
		try {
			fs.rmdirSync(path);
			return true;
		} catch (e) {
			return false;
		}
	};

	this.read_file = function (path, flag) {
		path = dp(path);
		if (!_Fs.is_file(path)) return '';
		if (flag === 'json') {
			try {
				return JSON.parse(fs.readFileSync(path).toString());
			} catch (e) {
				return {};
			}
		} else if (flag === 'base64') {
			return fs.readFileSync(path).toString('base64');
		}
		return fs.readFileSync(path);
	};

	this.write_file = function (path, data, flag) {
		path = dp(path);
		if (flag === 'json') data = JSON.stringify(data);
		fs.writeFileSync(path, data);
	};

	this.duplicate = function (from, to) {
		_Fs.write_file(to, _Fs.read_file(from));
	};

	this.add_dir = function (path) {
		path = dp(path);
		if (!Fs.is_dir(path)) fs.mkdirSync(path);
	};

	this.open_on_os = function (folder) {
		IDE.shell.openItem(folder);
	};

	this.download = function (url, into, clb_progress, clb_success, clb_error) {
		var http = require('http');
		var file = fs.createWriteStream(into);
		http.get(url).on('response', function(res) {
			var len = parseInt(res.headers['content-length'], 10);
			var downloaded = 0;
			res.on('data', function(chunk) {
				file.write(chunk);
				downloaded += chunk.length;
				clb_progress((100.0 * downloaded / len).toFixed(2));
			}).on('end', function () {
				file.end();
				clb_success();
			}).on('error', function (err) {
				clb_error(err.message);
			});
		});
	};

	this.rename = function (old, _new) {
		fs.renameSync(old, _new);
	};

	this.unpack = function (arch, into, type, clb_success, clb_error) {
		if (type === 'tar.gz') {
			var targz = require('targz');
			targz.decompress({
				src: arch,
				dest: into
			}, function(err){
				if(err) {
					clb_error(err);
				} else {
					clb_success();
				}
			});
		} else if (type === 'zip') {
			var unzip = require('unzip');
			fs.createReadStream(arch).pipe(unzip.Extract({
				path: into
			})).on('close', function () {
				clb_success();
			});
		}
	};





};