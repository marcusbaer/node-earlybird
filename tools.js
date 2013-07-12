var argv = require('optimist').argv;
var fs = require('fs');
var sys = require('util');
var serviceScript = null;
var socketsScript = null;
//var childProcess = require('child_process');

var port = argv.p || '80';
var serviceUrl = argv.u || 'service';
var wwwDir = argv.www || process.cwd();

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
	var fileInfo = fileInfo(u.pop());

	if (fileInfo.binaryData === true) {
		fs.readFile(filename, function (err, data) {
			if (err) {
				//throw err;
				res.writeHead(404);
				res.end();
			} else {
				res.writeHead(200, { 'content-type': fileInfo.mime });
				res.write(data);
				res.end();
			}
		});
	} else if (fileInfo.allow) {
			fs.readFile(filename, 'utf8', function (err, data) {
				if (err) {
					//throw err;
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200, { 'content-type': fileInfo.mime });
					res.write(data + "\n");
					res.end();
				}
			});
	} else {
		res.writeHead(200, { 'content-type': fileInfo.mime });
		res.write("Not supported file type\n");
		res.end();
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
			break;
		case "json":
			fileInfo.mime = 'application/json';
			fileInfo.secureFlag = true;
			break;
		case "tsv":
		case "csv":
			fileInfo.mime = 'text/comma-separated-values';
			fileInfo.secureFlag = true;
			break;
		case "ico":
			fileInfo.mime = 'image/x-ico';
			fileInfo.binaryData = true;
			break;
		case "png":
			fileInfo.mime = 'image/png';
			fileInfo.binaryData = true;
			break;
		case "jpg":
			fileInfo.mime = 'image/jpeg';
			fileInfo.binaryData = true;
			break;
		case "gif":
			fileInfo.mime = 'image/gif';
			fileInfo.binaryData = true;
			break;
		case "xml":
			fileInfo.mime = 'text/xml';
			fileInfo.secureFlag = true;
			break;
		case "pdf":
			fileInfo.mime = 'application/pdf';
			fileInfo.binaryData = true;
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
			break;
		case "mpg":
		case "mpeg":
			fileInfo.mime = 'video/mpeg';
			fileInfo.binaryData = true;
			break;
		case "mov":
			fileInfo.mime = 'video/quicktime';
			fileInfo.binaryData = true;
			break;
		case "avi":
			fileInfo.mime = 'video/x-msvideo';
			fileInfo.binaryData = true;
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
