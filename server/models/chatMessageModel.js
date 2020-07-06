const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
    {
        senderId:{
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'onModel',
            required: true
        },
        onModel:{
            type: String,
            required: true,
            enum: ['Alumni', 'College', 'Admin']
        },
        chatRoomId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatRoom'
        },
        message: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
module.exports = { ChatMessage };