const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const AdminSchema = new mongoose.Schema({
    adminName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
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
    events: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
    ]
});


AdminSchema.methods.generateAuthToken = function() {
    var admin = this;
    var access = 'auth';

    var payload = {
        _id: admin._id.toHexString(), 
        access, 
        type: 'admin'
    };

    var token = jwt.sign(payload, process.env.tokenSecretKey).toString();

    admin.tokens.push({access, token});

    return admin.save()
        .then(() =>{
            return token;
        });
}



AdminSchema.statics.findByToken = function(token) {
    var Admin = this;
    var decoded;

    try{
        decoded = jwt.verify(token, process.env.tokenSecretKey);
    } catch(err) {
        return Promise.reject();
    }

    return Admin.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });   
}

AdminSchema.methods.removeToken = function(token){
    var admin = this;

    return admin.update({
        $pull : {
            tokens : {
                token : token
            }
        }
    });
}


var Admin = mongoose.model('Admin', AdminSchema);
module.exports = {Admin};
