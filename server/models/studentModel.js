const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const StudentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },
    collegeId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    studentName: {
        type: String
    },
    verified: {
        type: Boolean
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
            period: {
                type: String
            },
            school: {
                type: String
            }
        }
    ],

    work: [
        {
            period: {
                type: String
            },
            company: {
                type: String
            },
            role: {
                type: String
            }
        }
    ],

    mobileNumber: {
        type: String
    },

    location: {
        type: String
    },

    passOutBatch: {
        type: String
    },

    skills: []

});


StudentSchema.methods.generateAuthToken = function(){
    var student = this;
    var access = 'auth';

    var token = jwt.sign({_id: student._id.toHexString(), access, type: 'student'}, 'secretKey').toString();

    student.tokens.push({access, token});

    return student.save().then(() =>{
        return token;
    });
}

StudentSchema.statics.findByToken = function(token){
    var Student = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'secretKey');
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