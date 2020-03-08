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
    organisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'College'
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ]
        
});

const Event = mongoose.model('Event', EventSchema);
module.exports = {Event};

