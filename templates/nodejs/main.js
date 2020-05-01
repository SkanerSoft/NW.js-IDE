var App = require('./app');
var app = new App();

app.run = () => {
	console.log('Переопределили функцию!');
};

app.run();