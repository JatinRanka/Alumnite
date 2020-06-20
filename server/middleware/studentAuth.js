var {Student} = require('../models/studentModel.js');


var studentAuth = (req, res, next) => {
    var token = req.header('x-auth');
    
    if(!token){
        res.status(400).send({'err': 'User not logged in.'})
    }

    Student.findByToken(token)
        .then((student) => {
            if(!student) {
                res.status(400).send({'err': "Invalid credentials."});
            }

            req.student = student;
            req.token = token;

            next();
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

module.exports = {studentAuth};