// app.js - пример дочернего модуля

class App {

	constructor () {
		this.name = 'NodeJS Application';
	}

	run () {
		var name = this.name;
		setInterval(function () {
			console.log(name);
		}, 1000);
	}

}

module.exports = App;