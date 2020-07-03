const utils = require('./utils');

const sockets = {};

function enterRoomEvent(socket){
    socket.on('join', async ({chatRoomId}, callback) => {

        const {error, user} = utils.addUser({socketId: socket.id, senderId, chatRoomId});

        if(error){
            callback(error);
        }

        socket.join(user.chatRoomId);
        console.log(`socket ${user.socketId} joined ${user.chatRoomId}`);
        callback();
    });
}

function groupMessageEvent(socket, io){
    socket.on('messageToGroup', async ({message, category}, callback) => {

        const user = utils.getUser(socket.id);

        io.to(user.chatRoomId).emit('message', {text: message});
        console.log(`Received new message. ${message}`);
        callback();
    });
}

function exitRoomEvent(socket){
    socket.on('disconnect', async (callback) => {
        const user = utils.removeUser(socket.id);
        callback();
    });
}

sockets.init = function (server) {
    const io = require('socket.io').listen(server);
    io.on('connection', function (socket) {

        console.log(`Socket ${socket.id} connected`);

        enterRoomEvent(socket);
        groupMessageEvent(socket, io);

        
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
            exitRoomEvent(socket);
        });
  }); 

}

module.exports = sockets;