var {Alumni} = require('../models/alumniModel.js');


var alumniAuth = (req, res, next) => {
    var token = req.header('x-auth');

    if(!token){
        res.status(400).send({'err': 'User not logged in.'})
    }

    Alumni.findByToken(token)
        .then((alumni) => {
            if(!alumni) {
                res.status(400).send({'err': "Invalid credentials."});
            }
            req.alumni = alumni;
            req.token = token;

            next();
        })
        .catch((err) => {
            res.status(500).send({err});
        });
};

module.exports = {alumniAuth};