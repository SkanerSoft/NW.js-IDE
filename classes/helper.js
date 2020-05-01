var Helper = new function () {

	var open = function (_title, data, padding) {
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
		title.innerHTML = _title;
		$append(title, cnt);

		var r = $create('div');
		r.innerHTML = data;

		r.style.padding = is(padding, '0');

		$append(r, cnt);

		$append(back);
		$append(cnt);
		cnt.style.left = window.innerWidth - cnt.offsetWidth + 'px';
	};

	var names = {
		'package.json' : function (tl) {
			$button(tl, 'J', function (e) {
				open('Joint', `
					Вы можете использовать автоматический сборщик файлов Joint,
					описав в package.json файле инструкцию для сборки.
					<br><br>
					API инструкции:<br>
<pre>
	["joint_type" : "chain|IIFE|function:name",]
	"joint" : {
	  "result_file_A.js" : [
	    "[folder_A/]file_A.js",
	    "[folder_A/]file_B.js"
	   ],
	  
	  "[folder_C/]result_file_B.js" : [
	    "[folder_B/]file_C.js",
	    "[folder_B/]file_D.js"
	   ] 
	}
</pre>

					<br>
					joint_type - необязательный параметр, описывабщий тип сборки.
					По-умолчанию указан параметр "chain".
					<br><br>
					Варианты:
					<ul>
						<li>chain - последовательная сборка</li>
						<li>IIFE - сборка в анонимную функция с автовызовом</li>
						<li>function:name - сборка в функцию с любым именем</li>
						<li>application:App - сборка на основе модулей в приложение</li>
					</ul>					

					<br>
					Пример инструкции:<br>
<pre>
	"joint_type" : "function:my_engine",
	"joint" : {
	  "engine.js" : [
	    "global.js",
	    "math.js",
	    "draw.js",
	    "audio.js"
	   ]
	}
</pre>
					<br>
					<div align="center"><button class="btn_pad" onclick="$go('https://nwjs.ru/')">Подробная справка</button></div>
`, '10px');
			}, true, 'btn btn_pad2 full_width', 'Сборщик Joint');
		}
	};

	var modes = {

	};

	this.add_tool = function (filename, mode) {
		var tl = $('tool_list');

		if (modes[mode])
			mode[mode](tl);

		if (names[filename])
			names[filename](tl);
	};

};
