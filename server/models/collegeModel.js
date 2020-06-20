const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const CollegeSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },
    adminId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
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
    
    events: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }]

})



CollegeSchema.methods.generateAuthToken = function() {
    var college = this;
    var access = 'auth';

    var payload = {
        _id: college._id.toHexString(), 
        access, 
        type: 'college'
    };

    console.log("key ", process.env.tokenSecretKey);
    var token = jwt.sign(payload, process.env.tokenSecretKey).toString();

    college.tokens.push({access, token});

    return college.save()
        .then(() =>{
            return token;
        })
        .catch((err) => {
            return Promise.reject(err)
        });
}

CollegeSchema.statics.findByToken = function(token) {
    var College = this;
    var decoded;

    try{
        decoded = jwt.verify(token, process.env.tokenSecretKey);
    } catch(err) {
        return Promise.reject(err.message);
    }

    return College.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });   
}

CollegeSchema.methods.removeToken = function(token){
    var college = this;

    return college.update({
        $pull : {
            tokens : {
                token : token
            }
        }
    });
}

const College = mongoose.model('College', CollegeSchema);
module.exports = {College};