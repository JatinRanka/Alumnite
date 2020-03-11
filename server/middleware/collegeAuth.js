const jwt = require('jsonwebtoken');

var {College} = require('../models/collegeModel.js');


var collegeAuth = (req, res, next) => {
    var token = req.header('x-auth');

    College.findByToken(token)
        .then((college) => {
            if(!college) {
                // console.log("colg not found");
                reject({msg: "colg not found"});
            }

            // console.log(college);

            req.college = college;
            req.token = token;

            next();
        })
        .catch((err) => {
            console.log("in catch");
            res.status(400).send(err.msg);
        });
};

module.exports = {collegeAuth};