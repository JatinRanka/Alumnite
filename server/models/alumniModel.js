const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const AlumniSchema = new mongoose.Schema({
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
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    passOutBatch: {
        type: Number,
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
        // required: true,
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
            period: {
                type: String
            },
            school: {
                type: String
            }
        }
    ],

    currentlyWorkingAtIndustry:{
        type:String
    },

    workedAtIndustries: [],
    
    designations: [],

    mobileNumber: {
        type: String
    },

    location: {
        type: String
    },

    skills: []

});


AlumniSchema.methods.generateAuthToken = function(){
    var alumni = this;
    var access = 'auth';

    var payload = {
        _id: alumni._id.toHexString(), 
        access, 
        type: 'alumni'
    }

    var token = jwt.sign(payload, 'secretKey').toString();

    alumni.tokens.push({access, token});

    return alumni.save()
        .then(() =>{
            return token;
        });
}

AlumniSchema.statics.findByToken = function(token){
    var Alumni = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'secretKey');
    } catch(err) {
        return Promise.reject();
    }


    return Alumni.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
}

AlumniSchema.methods.removeToken = function(token){
    var alumni = this;

    return alumni.update({
        $pull : {
            tokens : {
                token : token
            } 
        }
    });
}


const Alumni = mongoose.model('Alumni', AlumniSchema);
module.exports = {Alumni};