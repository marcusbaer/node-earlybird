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