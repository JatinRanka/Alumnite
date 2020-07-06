const models = require('./../models');

class ChatService {

    static async postMessage(senderId, onModel, chatRoomId, message){
        const message = new models.ChatMessage({
            senderId,
            onModel,
            chatRoomId,
            message
        });

        return message.save()
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