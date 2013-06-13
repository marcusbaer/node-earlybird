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
	var url = new RegExp('\/'+serviceUrl+'\/');
    callService(req.url.replace(url,''), JSON.parse(postData), function(responseData){
        res.writeHead(200, { 'content-type': 'application/json' });
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
    var ext = u.pop();

    var contentType = 'text/plain';
	var isAllowedExt = true;
	var readAsText = false;

    switch (ext) {
        case "txt":
            contentType = 'text/plain';
            break;
        case "html":
        case "htm":
            contentType = 'text/html';
            break;
        case "css":
        case "less":
            contentType = 'text/css';
            break;
        case "js":
            contentType = 'text/javascript';
            break;
		case "json":
			readAsText = true;
			contentType = 'application/json';
			break;
        case "tsv":
        case "csv":
            contentType = 'text/comma-separated-values';
            break;
        case "ico":
            contentType = 'image/x-ico';
            break;
        case "png":
            contentType = 'image/png';
            break;
        case "jpg":
            contentType = 'image/jpeg';
            break;
        case "gif":
            contentType = 'image/gif';
            break;
		case "xml":
			contentType = 'text/xml';
			break;
		case "pdf":
			contentType = 'application/pdf';
			break;
		case "swf":
			contentType = 'application/x-shockwave-flash';
			break;
        case "svg":
            readAsText = true;
            contentType = 'image/svg+xml';
            break;
		default:
			isAllowedExt = false;
			break;
    }

	if ( readAsText === false && (contentType.indexOf('image') >= 0 || contentType.indexOf('application') >= 0) ) {
		fs.readFile(filename, function (err, data) {
			if (err) {
				//throw err;
				res.writeHead(404);
				res.end();
			} else {
				res.writeHead(200, { 'content-type': contentType });
				res.write(data);
				res.end();
			}
		});
    } else {
		if (isAllowedExt) {
			fs.readFile(filename, 'utf8', function (err, data) {
				if (err) {
					//throw err;
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200, { 'content-type': contentType });
					res.write(data+"\n");
					res.end();
				}
			});
		} else {
			res.writeHead(200, { 'content-type': 'text/plain' });
			res.write("Not supported file type\n");
			res.end();
		}
    }

};

exports.static = static;
exports.service = service;
exports.sockets = sockets;

function encode (txt) {
    return new Buffer(txt).toString('base64');
}

function decode (txt) {
    return new Buffer(txt, 'base64').toString('utf8');
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
