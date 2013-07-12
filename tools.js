var argv = require('optimist').argv;
var fs = require('fs');
var sys = require('util');
var serviceScript = null;
var socketsScript = null;
//var childProcess = require('child_process');

var port = argv.p || '80';
var serviceUrl = argv.u || 'service';
var wwwDir = argv.www || process.cwd();
var basicAuthUser = (argv.a) ? encode(argv.a) : null;
var basicAuthMsg = (argv.am) || "Secure Area";

if (argv.s) {
	serviceScript = require(wwwDir + '/' + argv.s).service;
}

if (argv.ws) {
	socketsScript = require(wwwDir + '/' + argv.ws).sockets;
}

var callService = function (serviceName, postData, callback) {
	var responseData = {};
	if (serviceScript) {
		responseData = serviceScript(serviceName, postData);
	}
	if (callback) {
		callback(responseData);
	}
};

var service = function (req, res, postData) {
	var url = new RegExp('\/' + serviceUrl + '\/');
	callService(req.url.replace(url, ''), JSON.parse(postData), function (responseData) {
		res.writeHead(200, { 'content-type':'application/json' });
		res.write(JSON.stringify(responseData));
		res.end();
	});
};

var sockets = function (socket) {
//	socket.on('hello', function (params) {
//		socket.emit('hello', params);
//		socket.broadcast.emit('hello', params);
//	});
	if (socketsScript) {
		socketsScript(socket);
	}
};

var static = function (req, res) {

	var filename;
	filename = (req.url === "/") ? wwwDir + "/index.html" : wwwDir + req.url;

	var u = filename.split('.');
	var fileinfo = fileInfo(u.pop());
	var userAuthorized = true;

	if (basicAuthUser && fileinfo.private) {
		userAuthorized = false;
		var auth = req.headers['authorization'];  // is in base64(username:password)
		if (auth) { // The Authorization was passed in so now we validate it

			var tmp = auth.split(' '); // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
			if (basicAuthUser === tmp[1]) {
				userAuthorized = true;
			} else {
				res.statusCode = 401; // Force them to retry authentication
//				res.statusCode = 403;   // or alternatively just reject them altogether with a 403 Forbidden
				res.setHeader('WWW-Authenticate', 'Basic realm="'+ basicAuthMsg + '"');
				res.end('Not allowed');
			}

		} else { // No Authorization header was passed in so it's the first time the browser hit us

			// Sending a 401 will require authentication, we need to send the 'WWW-Authenticate' to tell them the sort of authentication to use
			// Basic auth is quite literally the easiest and least secure, it simply gives back  base64( username + ":" + password ) from the browser
			res.statusCode = 401;
			res.setHeader('WWW-Authenticate', 'Basic realm="'+ basicAuthMsg + '"');
			res.end('Not allowed');

		}
	}

	if (userAuthorized) {

		if (fileinfo.binaryData === true) {
			fs.readFile(filename, function (err, data) {
				if (err) {
					//throw err;
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200, { 'content-type': fileinfo.mime });
					res.write(data);
					res.end();
				}
			});
		} else if (fileinfo.allow) {
			fs.readFile(filename, 'utf8', function (err, data) {
				if (err) {
					//throw err;
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200, { 'content-type': fileinfo.mime });
					res.write(data + "\n");
					res.end();
				}
			});
		} else {
			res.writeHead(200, { 'content-type': fileinfo.mime });
			res.write("Not supported file type\n");
			res.end();
		}

	}

};

exports.static = static;
exports.service = service;
exports.sockets = sockets;

function encode(txt) {
	return new Buffer(txt).toString('base64');
}

function decode(txt) {
	return new Buffer(txt, 'base64').toString('utf8');
}

function fileInfo(ext) {

	var fileInfo = {
		mime: 'text/plain',
		binaryData: false,
		private: false,
		secureFlag: false,
		allow: true
	};

	switch (ext) {
		case "txt":
			break;
		case "html":
		case "htm":
			fileInfo.mime = 'text/html';
			break;
		case "css":
		case "less":
			fileInfo.mime = 'text/css';
			break;
		case "js":
			fileInfo.mime = 'text/javascript';
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "json":
			fileInfo.mime = 'application/json';
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "tsv":
		case "csv":
			fileInfo.mime = 'text/comma-separated-values';
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "ico":
			fileInfo.mime = 'image/x-ico';
			fileInfo.binaryData = true;
			break;
		case "png":
			fileInfo.mime = 'image/png';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "jpg":
			fileInfo.mime = 'image/jpeg';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "gif":
			fileInfo.mime = 'image/gif';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "xml":
			fileInfo.mime = 'text/xml';
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "pdf":
			fileInfo.mime = 'application/pdf';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "swf":
			fileInfo.mime = 'application/x-shockwave-flash';
			fileInfo.binaryData = true;
			break;
		case "svg":
			fileInfo.mime = 'image/svg+xml';
			break;
		case "mp3":
			fileInfo.mime = 'audio/mpeg';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "mpg":
		case "mpeg":
			fileInfo.mime = 'video/mpeg';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "mov":
			fileInfo.mime = 'video/quicktime';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		case "avi":
			fileInfo.mime = 'video/x-msvideo';
			fileInfo.binaryData = true;
			fileInfo.secureFlag = true;
			fileInfo.private = true;
			break;
		default:
			fileInfo.allow = false;
			break;
	}

	return fileInfo;

}

//function loadTemplate (filename, callback) {
//    fs.readFile(filename, 'utf8', function(err, data) {
//        if(err) throw err;
//        callback(data);
//    });
//}

//function ls (options, callback) {
//    var proc = childProcess.exec('ls', function (error, stdout, stderr) {
//        if (error) {
//            console.log(error.stack);
//            console.log('Error code: '+error.code);
//            console.log('Signal received: '+error.signal);
//        }
////		console.log('Child Process STDOUT: '+stdout);
////		console.log('Child Process STDERR: '+stderr);
//    });
//
//    proc.on('exit', function (code) {
////		sys.log('Child process exited with exit code '+code);
//        if (callback) {
//            callback();
//        }
//    });
//}
