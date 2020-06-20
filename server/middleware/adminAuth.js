var {Admin} = require('../models/adminModel.js');


var adminAuth = (req, res, next) => {
    var token = req.header('x-auth');

    Admin.findByToken(token)
        .then((admin) => {
            if(!admin) {
                res.status(400).send({'err': "Invalid credentials."});
            }

            req.admin = admin;
            req.token = token;

            next();
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

module.exports = {adminAuth};