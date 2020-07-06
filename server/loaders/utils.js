const users = {};

const addUser = ({socketId, chatRoomId, senderId, onModel}) => {
    users.socketId = { chatRoomId, senderId, onModel };
    return users.socketId;
}

const removeUser = (socketId) => {
    const user = users.socketId;
    delete users.socketId;

    return user;
}

const getUser = (socketId) => {
    return users.socketId;
};

// const getUsersInRoom = (room) => {
//     return users.filter((user) => user.room === room)
// };

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
};