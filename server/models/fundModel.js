const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema(
    {   
        raisedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true
        },
        title:{
            type: String,
            required: true
        },
        subtitle:{
            type: String
        },
        description:{
            type: String,
            required: true
        },
        totalRequired:{
            type: Number,
            required: true
        },
        totalRaised:{
            type: Number,
            default: 0
        },
        contributors: 
        [
            {
                contributedBy:{
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Alumni'
                },
                amount: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {timestamps: true}
);

const Fund = mongoose.model('Fund', FundSchema);
module.exports = { Fund }