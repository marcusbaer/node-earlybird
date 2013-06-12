var argv = require('optimist').argv;
var http = require('http');
var tools = require('./tools');

var wwwDir = argv.www || process.cwd();

if (argv.s) {
    serviceScript = require(wwwDir + '/' + argv.s).service;
}

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

}).listen(argv.p || 80);

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
}

// SSL
if (argv.ssl) {
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
    httpProxy.createServer(argv.p || 80, argv.h || 'localhost', options).listen(443);
}


