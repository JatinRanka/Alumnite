const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
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
    // full-time or intern
    typeOfJob: {
        type: String,
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
    duration:{
        type: String
    },
    description:{
        type: String
    },
    skillsRequired: [],
    qualification: [],
    keywords: []

}); 


const Job = mongoose.model('Job', JobSchema);
module.exports = {Job};