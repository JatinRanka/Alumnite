// External libraries
const jwt = require('jsonwebtoken');

const users = {};

const addUser = ({socketId, chatRoomId, senderId, onModel}) => {
    users[socketId] = { chatRoomId, senderId, onModel };
    return users[socketId];
}

const removeUser = (socketId) => {
    const user = users[socketId];
    delete users[socketId];

    return user;
}

const getUser = (socketId) => {
    return users[socketId];
};

const findByToken = (token) => {
    try {
        decoded = jwt.verify(token, process.env.tokenSecretKey);
        return ({
            senderId: decoded._id,
            onModel: decoded.type
        });
    } catch (error) {
        return { error };
    }
}


module.exports = {
    addUser, 
    removeUser, 
    getUser,
    findByToken
};