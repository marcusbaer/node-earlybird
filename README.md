earlybird
==============

A quick and easy to setup web server for earlybird development and even more.

Installation
------------------

	npm install earlybird -g
	
Run
------------------

	cd /path/to/my/sources
	earlybird

Starting parameters overview
------------------

	p		a standard port different from 80
	www		a static assets path different from current directory

	s		set a service method script
	u		a service url prefix different from 'service' (http://localhost/service/demo)

	ws		use WebSockets

	ssl		start with ssl support (on port 443)
	h		a host name different from localhost (for ssl)
	nohttp	do not run standard http server and start only https proxy listening on port `-p` (default is 80)

Usage of a service
------------------

To integrate a service, place a service script like this in your working directory and name it, e.g. `service.js`:

	var serviceCallback = function (serviceName, postData, callback) {
    	var responseData = {};
    	switch (serviceName) {
			// call with http://localhost/service/demo
			case 'demo':
				responseData = {demo: 'hello'};
				break;
    	}
		return responseData;
	};

	exports.service = serviceCallback;

Refer to this script by starting with `--s` parameter. Services have a special path in your url (default is http://localhost/service). If you'd like to set a different path name, start with `--u` parameter:

	earlybird --s=service --u=example/service		# run service with http://localhost/example/service

To call services from frontend you can copy `jquery.service.js` to your working directory. Adjust it to your needs and call it like that:

	$(document).ready(function() {
    	$.callService('demo', {}, function(response){
			// something inside the success callback..
    	});
	});

Or do something else.

WebSockets
------------------

To use WebSockets, install `socket.io` first (`npm install socket.io -g`). After that start earlybird server with `--ws` flag.

	earlybird --ws

Calling services from frontend is shown in example as well.

	$(document).ready(function() {
    	$(document).initSocket(function(){
	        $(document).callSocket('hello', {id: '123'}, function (response) {
            	// something inside the socket callback..
        	});
    	});
	});

SSL support
------------------

To run earlybird server with ssl, install `http-proxy` first (`npm install http-proxy -g`) and start with `--ssl` parameter. Optionally set another host name with `--h`. SSL needs a (self-signed) ssl certificate. It has to be placed inside a folder named `ssl` in your working directory. Place here both files `localhost.key` and `localhost.cert`. Actually SSL is only supported on port 443.

	earlybird --ssl --h "abc.de"
