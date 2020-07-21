const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Alumni'
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['open', 'closed', 'onProgress'],
            default: 'open'
        }
    },
    {timestamps: true}
);

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = {Ticket};