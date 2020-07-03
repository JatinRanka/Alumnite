sockets.init = function (server) {
    const io = require('socket.io').listen(server);
    io.on('connection', function (socket) {

        console.log(`Socket ${socket.id} connected`);

        
        // loggerFunction('info', `Socket ${socket.id} connected`);
        // setRoomEvent(socket);
        // getAllOnlineUsersEvent(socket, io);
        // setUserSocketIdEvent(socket, io);
        // createRoomEvent(socket);
        // enterRoomEvent(socket, io);
        // exitRoomEvent(socket, io);
        // privateMessageEvent(socket, io)
        // groupMessageEvent(socket, io)
        // currentUserOnlineFiendsEvent(socket)
        // updateParticularUsersData(socket, io)

        socket.on('disconnect', function () {
            onDisconnect(socket, io);
        });
  }); 

}

module.exports = sockets;