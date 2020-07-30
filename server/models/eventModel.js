const mongoose = require('mongoose');


const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        venue: {
            type: String,
            required: true
        },
        subtitle: {
            type: String
        },
        description: {
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
        ],
        location: {
            address: {
                type: String
            },
            city: {
                type: String,
                trim: true
            },
            state: {
                type: String,
                trim: true
            },
            country: {
                type: String,
                trim: true
            },
            coordinates:{
                langitude: {
                    type: Number
                },
                latitude:{
                    type: Number
                }
            }
        },
        endYear: {
            type: Number
        },
        sendEmail: {
            type: Boolean
        }
    },
    {timestamps: true}
);

const Event = mongoose.model('Event', EventSchema);
module.exports = {Event};

