const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema(
    {
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'College'
        },
        name: {
            type: String,
            required: true
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Alumni'
            }
        ],
        category:{
            type: String,
            enum: ['interest', 'year', 'yearCourse'],
            required: true
        },
        year:{
            type: Number
        },
        course: {
            type: String
        }
    },
    {timestamps: true}
);

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
module.exports = { ChatRoom }