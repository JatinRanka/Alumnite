const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
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
    designation: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    // easy, medium, hard
    difficulty: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // topics to focus on
    topics: [],
    feedback: {
        type: String
    }
});

const Interview = mongoose.model('Interview', InterviewSchema)
module.exports = {Interview};