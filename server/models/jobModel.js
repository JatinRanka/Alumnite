const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
    {
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
        location: {
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
            }
        },
        salaryOffered:{
            type: String
        },
        experience:{
            // minimum Number of experience required (in yrs)
            type: Number
        },
        description:{
            type: String
        },
        skillsRequired: [{
            type: String
        }],
        qualification: [{
            type: String
        }],
        contactInfo: {
            type: String
        },
        keywords: [{
            type: String
        }]
    },
    {timestamps: true}
); 

// for performing serach in entire document
JobSchema.index({'$**': 'text'});

const Job = mongoose.model('Job', JobSchema);
module.exports = {Job};