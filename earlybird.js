var argv = require('optimist').argv;
var sys = require('util');
var http = require('http');
var tools = require('./tools');

var port = argv.p || 80;
var host = argv.h || 'localhost';
var wwwDir = argv.www || process.cwd();

if (argv.s) {
    serviceScript = require(wwwDir + '/' + argv.s).service;
}

if (!argv.nohttp) {
	var httpServer = http.createServer(function(req, res) {
		var body = "";
		req.on('data', function (chunk) {
			body += chunk;
		});
		req.on('end', function () {
			if (req.url.indexOf('/service/') >= 0) {
				tools.service(req, res, body);
			} else {
				tools.static(req, res);
			}
		});
	}).listen(port);
	sys.log('Running EARLYBIRD server on port ' + port + ' with ' + wwwDir + ' as working directory');
}
	
// WebSockets
if (argv.ws) {
    var io = require('socket.io').listen(httpServer);
    io.set('log level', 1); // disables debugging
    io.sockets.on('connection', function (socket) {
        socket.on('hello', function (params) {
            socket.emit('hello', params);
            socket.broadcast.emit('hello', params);
        });
    });
	sys.log('Starting WebSockets..');
}

// SSL
if (argv.ssl || argv.nohttp) {
    var fs = require('fs');
    var https = require('https');
    var httpProxy = require('http-proxy');
    var options = {
        https: {
            key: fs.readFileSync('./ssl/localhost.key', 'utf8'),
            cert: fs.readFileSync('./ssl/localhost.cert', 'utf8')
        }
    };
    // a standalone HTTPS proxy server
    httpProxy.createServer(port, host, options).listen(443);
	sys.log('Running EARLYBIRD proxy on port 443 as listener to port ' + port);
}


