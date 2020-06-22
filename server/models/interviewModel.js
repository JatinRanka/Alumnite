const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Student'
        },
        collegeId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true
        },
        company: {
            type: String,
            required: true
        },
        workTitle: {
            type: String,
            required: true
        },
        industry: {
            type: String,
            required: true
        },
        
        difficulty: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        description: {
            type: String,
            required: true
        },
        topics: [{
            type: String
        }],
        keywords: [{
            type: String
        }],
        feedback: {
            type: String
        }
    },
    {timestamps: true}
);

// for performing serach in entire document
InterviewSchema.index({'$**': 'text'});

const Interview = mongoose.model('Interview', InterviewSchema)
module.exports = {Interview};