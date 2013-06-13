var socketsCallback = function (socket) {
	socket.on('hello', function (params) {
		socket.emit('hello', params);
		socket.broadcast.emit('hello', params);
	});
};

exports.sockets = socketsCallback;