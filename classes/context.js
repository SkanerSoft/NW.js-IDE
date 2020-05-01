var Context = new function () {
	var _Context = this;
	var area = null;

	var basic = [
		{ name : 'Вырезать',  clb : function () { CUT(); }, inline : true },
		{ name : 'Копировать',  clb : function () { COPY(); }, inline : true },
		{ name : 'br' },
		{ name : 'Вставить',  clb : function () { PASTE(); }, inline : true }
	];

	// RUN EVENT ////////////////////////////////////////////////////
	Events.run('context:init', W, _Context);
	/////////////////////////////////////////////////////////////////

	this.is = function () {
		return !!area;
	};

	this.append = function (name, clb, inline, on_create) {
		if (name === 'br') {
			area.appendChild($create('div'));
			return;
		}

		var btn = $create('button');
		btn.innerHTML = name;

		btn.onclick = clb;

		area.appendChild(btn);
		if (!inline) {
			btn.style.display = 'block';
			btn.style.width = '100%';
		}

		if (on_create) {
			on_create(btn);
		}
	};

	this.add = function (name, clb, inline, on_create) {
		basic.push({
			name : name,
			clb : clb,
			inline : inline,
			on_create : on_create
		});
	};

	this.br = function () {
		basic.push({
			name : 'br'
		});
	};

	this.open = function () {
		if (area) Context.close();
		area = $create('div');
		area.className = 'context_area';

		_for(basic, function (b) {
			Context.append(b.name, b.clb, b.inline, is(b.on_create, false));
		});

		$B().appendChild(area);
		area.style.left = MOUSE_X + 'px';
		area.style.top = MOUSE_Y + 'px';
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('context:opened', W, _Context);
		/////////////////////////////////////////////////////////////////
	};

	this.close = function () {
		if (!area) return;

		$B().removeChild(area);
		area = null;
		// RUN EVENT ////////////////////////////////////////////////////
		Events.run('context:closed', W, _Context);
		/////////////////////////////////////////////////////////////////
	};
};