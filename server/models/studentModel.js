const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const StudentSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    startYear:{
        type: Number,
        required: true
    },
    endYear: {
        type: Number,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },

    verified: {
        type: Boolean,
        default: false
    },

    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required:true
        }
    }],

    education: [
        {
            startYear: {
                type: String,
                trim: true
            },
            endYear: {
                type: String,
                trim: true
            },
            course: {
                type: String,
                trim: true
            },
            school: {
                type: String,
                trim: true
            }
        }
    ],

    workExperiences: [
        {
            startYear: {
                type: String
            },
            endYear: {
                type: String
            },
            company: {
                type: String,
                trim: true
            },
            workTitle: {
                type: String,
                trim: true
            },
            industry: {
                type: String,
                trim: true
            }
        }
    ],

    mobileNumber: {
        type: Number
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
    socialProfiles: {
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        }
    },
    imageUrl: {
        type: String
    },
    skills: [{
        type: String,
        trim: true
    }]
});


StudentSchema.methods.generateAuthToken = function(){
    var student = this;
    var access = 'auth';

    var token = jwt.sign({_id: student._id.toHexString(), access, type: 'student'}, process.env.tokenSecretKey).toString();

    student.tokens.push({access, token});

    return student.save().then(() =>{
        return token;
    });
}

StudentSchema.statics.findByToken = function(token){
    var Student = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.tokenSecretKey);
    } catch(err) {
        return Promise.reject();
    }

    return Student.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
}

StudentSchema.methods.removeToken = function(token){
    var student = this;

    return student.update({
        $pull : {
            tokens : {
                token : token
            } 
        }
    });
}


const Student = mongoose.model('Student', StudentSchema);
module.exports = {Student};