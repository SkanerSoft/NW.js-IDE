var Tools = new function () {

	var list_cats = function (data) {
		var back = $create('div');
		back.className = 'dialog_back';
		back.onclick = function () {
			FOCUS();
			$remove(back);
			$remove(cnt);
		};

		var cnt = $create('div');
		cnt.className = 'editor_tool';

		var title = $create('div');
		title.className = 'tool_title';
		title.innerHTML = 'Оглавление';
		$append(title, cnt);

		data = data.split(/\n/);
		_for(data, function (d, i) {
			var m;
			if (!(d = d.trim())) return;
			if (!(m = d.match(/\/\/\s(.*?)\s\/\//))) return;
			var r = $create('div');
			r.dataset['line'] = parseInt(i)+1;
			r.innerHTML = '// '+m[1]+' //';
			r.className = 'btn btn_pad';
			r.onclick = function () {
				editor.gotoLine(this.dataset['line']);
				FOCUS();
				$remove(back);
				$remove(cnt);
			};
			cnt.appendChild(r);
		});
		$append(back);
		$append(cnt);
		cnt.style.left = window.innerWidth - cnt.offsetWidth + 'px';
	};

	var list_funcs = function (data) {
		var back = $create('div');
		back.className = 'dialog_back';
		back.onclick = function () {
			FOCUS();
			$remove(back);
			$remove(cnt);
		};

		var cnt = $create('div');
		cnt.className = 'editor_tool';

		var title = $create('div');
		title.className = 'tool_title';
		title.innerHTML = 'Список функций';
		$append(title, cnt);

		data = data.split(/\n/);
		_for(data, function (d, i) {
			var m;
			if (!(d = d.trim())) return;

			if ((m = d.match(/(var|let|const)?[\t\s]?(.*?)=.*?function/))) m = m[2];
				else if ((m = d.match(/function[\s\t](.*?)[\s\t]?\(/))) m = m[1];
					else return;

			var r = $create('div');
			r.dataset['line'] = parseInt(i)+1;
			r.innerHTML = m || '(inline)()';
			r.className = 'btn btn_pad';
			r.onclick = function () {
				editor.gotoLine(this.dataset['line']);
				FOCUS();
				$remove(back);
				$remove(cnt);
			};
			cnt.appendChild(r);
		});
		$append(back);
		$append(cnt);
		cnt.style.left = window.innerWidth - cnt.offsetWidth + 'px';
	};

	var list_ui = function (data) {
		var back = $create('div');
		back.className = 'dialog_back';
		back.onclick = function () {
			FOCUS();
			$remove(back);
			$remove(cnt);
		};

		var cnt = $create('div');
		cnt.className = 'editor_tool';

		var title = $create('div');
		title.className = 'tool_title';
		title.innerHTML = 'Интеграция UI';
		$append(title, cnt);
		// noinspection JSAnnotator
		cnt.innerHTML += `
			<div class="btn_pad">
				После интеграции в корне проекта появится файл ui.js, который потребуется подключить 
				к документу.
			</div>
			<button id="_ui_integrate" class="btn_pad full">Интегрировать ui.js</button>

			<br>
			<div class="btn_pad">
				Модификация HTML изменит исходный код текущего документа с возможностью использования файлов *.ui.
			</div>
			<button id="_ui_mod" class="btn_pad full">Модифицировать HTML</button>

			<br>
			<div class="btn_pad">
				Модификация HTML с добавлением примера UI изменит исходный код текущего документа и добавит демонстрационные файлы *.ui.
			</div>
			<button id="_ui_demo1" class="btn_pad full">Пример: Текстовый редактор</button>

			<br>
			<div class="btn_pad">
				Подсказки ко встроенным методам, компонентам, службам и т.д.
			</div>			
			<div id="_ui_methods"></div>
			
		`;

		var _repl = function (text) {
			text = text.replace(/\bF\b/g, 'Function');
			text = text.replace(/\bS\b/g, 'String');
			text = text.replace(/\bA\b/g, 'Array of');
			text = text.replace(/\bO\b/g, 'Object');
			text = text.replace(/\bclb\b/g, 'callback');

			return text;
		};

		$append(back);
		$append(cnt);
		cnt.style.left = window.innerWidth - cnt.offsetWidth + 'px';

		$('_ui_integrate').onclick = function () {
			Fs.write_file(Project.path+Fs.delm+'ui.js', Fs.read_file('pages/ui_editor/ui.js'));
			back.click();
		};

		$('_ui_mod').onclick = function () {
			s().setValue(Fs.read_file('pages/ui_editor/html/integrate.html').toString());
			back.click();
		};

		$('_ui_demo1').onclick = function () {
			Fs.write_file(Project.path+Fs.delm+'demo.ui', Fs.read_file('pages/ui_editor/demos/text_editor/demo.ui'));
			s().setValue(Fs.read_file('pages/ui_editor/demos/text_editor/demo.html').toString());
			back.click();
			Files.update();
		};

		var _api = Session.cash_file('pages/ui_editor/api.json');
		var _gen = function (name, list, pref) {
			if (!pref) pref = '';
			var n = $create('div');
			n.className = 'btn full btn_pad';
			n.innerHTML = name;

			var ms = $create('div');
			ms.style.display = 'none';
			ms.style.marginBottom = '5px';

			n.onclick = function () {
				$show_hide(ms);
			};

			_for(list, function (a, key) {
				var args = typeof a === 'string' ? '' : '('+(a[1] ? a[1] : '')+')';
				var desc = typeof a === 'string' ? a : a[0];
				var ret = 'Вернёт: ' + (typeof a === 'string' ? 'своё значение' : a[2] ? a[2] : 'null');
				$button(ms, _repl('<b>'+pref+key+args+'</b><br>'+desc+'<br>'+ret), function () {

				}, false, 'btn_pad2 full text_l');
			});
			$('_ui_methods').appendChild(n);
			$('_ui_methods').appendChild(ms);
		};

		_gen('Методы UI', _api['UI'], 'UI.');

		_for(_api['objects'], function (list, name) {
			_gen('UI.'+name, list, 'UI.'+name+'.');
		});


		_for(_api['components'], function (list, name) {
			_gen(name, list, name+'.');
		});

	};

	this.open = function (type, data) {
		if (type === 'list_cats') return list_cats(data);
		if (type === 'list_funcs') return list_funcs(data);
		if (type === 'list_ui') return list_ui();
	};

};