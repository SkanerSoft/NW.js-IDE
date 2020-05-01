var Joint;
if (typeof parent.Joint !== 'undefined') Joint = parent.Joint;
else Joint = new function () {

	var joint_files = {};

	var types = {

		'chain' : {
			'start' : '',
			'end' : ''
		},

		'IIFE' : {
			'start' : '(function(){',
			'end' : '})();'
		},

		'function' : {
			'start' : 'function _name_ () {',
			'end' : '}'
		},

		'application' : {
			'start' : 'function _name_ () {\n',
			'end' : '}'
		}


	};

	this.join = function () {
		var joint = Project.get_package()['joint'];
		var joint_type = Project.get_package()['joint_type'];
		if (!joint) return;

		if (!joint_type) joint_type = 'chain';
		joint_type = joint_type.split(':');

		var type = joint_type[0];
		var name = joint_type[1];

		var path = Project.path;
		_for(joint, function (js_arr, result_name) {
			var code = types[type].start;

			if (name)
				code = code.replace('_name_', name);

			if (type === 'application') {
				code += 'const GlobalApp = this;\n\n';
				code += 'const '+name+' = this;\n\n';
			}

			_for(js_arr, function (file) {
				var this_code = Fs.read_file(path+'/'+file).toString().trim();
				if (!this_code) return;

				if (type === 'application') {
					var module_header = this_code.match(/module:([a-z0-9_]*)/i);
					if (!module_header) return;

					var module_name = module_header[1];
					if (!module_name) return;

					this_code = this_code.replace(/^'module(.*)';?\n?/i, '');

					this_code = name+'.'+module_name+' = new function () {\n'+'const '+module_name+' = this;\n'+'const ThisModule = this;\n'+this_code+'\n};\n';

					code += this_code+'\n';
				} else
					code += this_code+'\n';

				Debug.msg('Joint: addition '+file+' in '+result_name);
			});
			Fs.write_file(path+'/'+result_name, code+types[type].end);
		});
	};

	this.update = function () {
		var joint = Project.get_package()['joint'];
		if (!joint) return;
		_for(joint, function (js_arr, result_name) {
			joint_files[result_name] = true;
		});
	};

	this.check = function (file_name) {
		if (!joint_files) return;
		return !!joint_files[file_name];
	};

};