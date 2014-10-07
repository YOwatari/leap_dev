
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.configure(function () {
	app.set('port', process.env.PORT || '3000');
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// socket.io
io.sockets.on('connection', function (client) {
	console.log('Connection')
	client.on('message', function (data) {
		console.log('Broadcast');
		return client.broadcast.emit('message', data);
	});
	return client.on('disconnect', function () {
		return console.log('Disconnect');
	});
});

app.get('/', function (req, res) {
	res.render('index', {
		title: 'sketch!'
	});
});

if (!module.parent) {
	server.listen(app.get('port'), process.env.IP);
}
