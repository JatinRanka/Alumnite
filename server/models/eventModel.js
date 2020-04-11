const mongoose = require('mongoose');


const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
    },
    venue: {
        type: String
    },
    decription: {
        type: String
    },
    organiserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'College'
    },
    organiserType: {
        type: String,
        required: true,
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Alumni'
        }
    ]
        
});

const Event = mongoose.model('Event', EventSchema);
module.exports = {Event};

