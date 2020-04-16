const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    
    // Alumni Id
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumni',
        required: true
    },
    // College Id
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
        type: String
    },
    // full-time / intern / part-time
    typeOfJob: {
        type: String,
        enum: ['full-time', 'intern', 'part-time'],
        required: true
    },
    location:{
        type: String,
        required: true
    },
    salaryOffered:{
        type: Number
    },
    experience:{
        // minimum Number of experience required (in yrs)
        type: Number
    },
    description:{
        type: String
    },
    skillsRequired: {
        type: Array,
        required: true,
        default: []
    },
    qualification: {
        type: Array,
        required: true,
        default: []
    }
}); 


const Job = mongoose.model('Job', JobSchema);
module.exports = {Job};