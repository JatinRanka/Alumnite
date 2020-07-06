const users = [];

const addUser = ({socketId, chatRoomId, senderId, onModel}) => {

    // const existingUser = users.find((user) => user.senderId===senderId && user.chatRoomId===chatRoomId);

    // if(existingUser) {
    //     return ({error : 'User already exists.'});
    // }

    const user = {socketId, chatRoomId, senderId, onModel};
    users.push(user);

    return {user};
}

const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId===socketId);

    return users.splice(index, 1)[0];
}

const getUser = (socketId) => {return users.find((user) => user.socketId === socketId)};

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
};

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
};