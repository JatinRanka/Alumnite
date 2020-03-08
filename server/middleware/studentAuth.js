var {Student} = require('../models/studentModel.js');


var studentAuth = (req, res, next) => {
    var token = req.header('x-auth');

    Student.findByToken(token)
        .then((student) => {
            if(!student) {
                Promise.reject();
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