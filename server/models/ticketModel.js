const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Alumni'
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
        resolved: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
);

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = {Ticket};  