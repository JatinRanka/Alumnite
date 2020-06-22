var {College} = require('../models/collegeModel.js');

var collegeAuth = (req, res, next) => {
    var token = req.header('x-auth');
    if(!token){
        res.status(400).send({'err': 'User not logged in.'})
    }

    College
        .findByToken(token)
        .then((college) => {
            if(!college) {
                res.status(400).send({'err': "Invalid credentials."});
            }

            req.college = college;
            req.token = token;

            next();
        })
        .catch((err) => {
            console.log("in catch");
            console.log(err);
            res.status(400).send(err);
        });
};

module.exports = {collegeAuth};