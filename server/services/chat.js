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

        console.log(chatMessage);


        const options = [{path:'senderId', select:'firstName collegeName adminName'}]

        
        // chatMessage.save(function(error, chatMessage){ 
        //     if(error){
        //         return new Promise.resolve({error});
        //     }
        //     ChatMessage
        //         .populate(chatMessage, options)
        //         .then((messageUpdateInfo) => {
        //             return new Promise.resolve({messageUpdateInfo});
        //         })
        //         .catch((error) => {
        //             return new Promise.resolve({error});
        //         });  

        // })

        return chatMessage.save().then(() => {
            return ChatMessage.populate(chatMessage, options)
                .then((messageUpdateInfo) => {
                    return Promise.resolve({messageUpdateInfo});
                })
                .catch((error) => {
                    console.log(error);
                    return Promise.resolve({error});
                });
        })
        
    }
}

module.exports = ChatService;