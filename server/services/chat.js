const models = require('./../models');
const { ChatMessage } = require('../models/chatMessageModel');

class ChatService {

    static async postMessage(senderId, onModel, chatRoomId, message){
        const chatMessage = new models.ChatMessage({
            senderId,
            onModel,
            chatRoomId,
            message
        });


        const options = [{path:'senderId', select:'firstName'}]

        return ChatMessage.populate(chatMessage, options)
            .then((messageUpdateInfo) => {
                return Promise.resolve({messageUpdateInfo});
            })
            .catch((error) => {
                console.log(error);
                return Promise.resolve({error});
            });
    }
}

module.exports = ChatService;