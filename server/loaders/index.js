const utils = require('./utils');
const services = require('./../services');

const sockets = {};

function enterRoomEvent(socket){
    socket.on('join', async ({chatRoomId, senderId, onModel}, callback) => {

        const {error, user} = utils.addUser({socketId: socket.id, chatRoomId, senderId, onModel});

        if(error){
            callback(error);
        }

        socket.join(user.chatRoomId);
        console.log(`socket ${user.socketId} joined ${user.chatRoomId}`);
        callback();
    });
}

function groupMessageEvent(socket, io){
    socket.on('messageToGroup', async ({message}, callback) => {

        const user = utils.getUser(socket.id);

        const senderId = user.senderId;
        const chatRoomId = user.chatRoomId;
        const onModel = user.onModel;

        const {error, messageUpdateInfo} = await services.ChatService.postMessage(senderId, onModel, chatRoomId, message)

        if(error){
            callback(error);
        }

        console.log(messageUpdateInfo);

        io.to(user.chatRoomId).emit('message', {text: message});
        console.log(`Received new message. ${message}`);
        callback();
    });
}

function exitRoomEvent(socket){
    const user = utils.removeUser(socket.id);
    console.log(`Socket ${socket.id} left.`);
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