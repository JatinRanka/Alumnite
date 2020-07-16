const utils = require('./utils');
const services = require('./../services');

const sockets = {};

function enterRoomEvent(socket){
    socket.on('join', async ({chatRoomId, token}, callback) => {

        try {
            var { error, senderId, onModel } = utils.findByToken(token);
            if(error){
                callback(error);
            }

            var user = utils.addUser({socketId: socket.id, chatRoomId, senderId, onModel});
            console.log(user);
            socket.join(user.chatRoomId);
            console.log(`socket ${socket.id} joined ${user.chatRoomId}`);
            callback();

        } catch (error) {
            callback(error);
        }        
    });
}

function groupMessageEvent(socket, io){
    socket.on('messageToGroup', async ({message}, callback) => {

        const user = utils.getUser(socket.id);
        console.log(user);
        const senderId = user.senderId;
        const chatRoomId = user.chatRoomId;
        var onModel = user.onModel;

        onModel = onModel.charAt(0).toUpperCase() + onModel.slice(1); // To capitalize first char of the model. (Eg: alumni => Alumni)

        const {error, messageUpdateInfo} = await services.ChatService.postMessage(senderId, onModel, chatRoomId, message)

        if(error){
            console.log(error)
            return callback(error);
        }

        console.log(messageUpdateInfo);
        socket.broadcast.to(user.chatRoomId).emit('messageToGroup', {newMessage: messageUpdateInfo});
        // io.to(user.chatRoomId).emit('messageToGroup', {newMessage: messageUpdateInfo});
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