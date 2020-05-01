var Lang = new function () {
	var lng = {
		save: { label : 'Сохранить',  hint : 'Сохранить файл на диск' },
		restore: { label : 'Восстановить',  hint : 'Восстановить файл до состояния открытия' },
		new_project: { label : 'Новый',  hint : 'Создать новый проект' }
	};

	var tr = function (str) {
		str = str.replace(/(\{|\})/g, '').trim();
		return lng[str];
	};

	this.init = function () {
		var arr = D.getElementsByTagName('button');
		_for(arr, function (a) {
			if (a.title.toString().match(/\{/)) {
				var t = tr(a.title);
				if (t) a.title = is(t.hint, '');
			}
		});
	};
};