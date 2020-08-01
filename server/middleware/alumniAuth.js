var {Alumni} = require('../models/alumniModel.js');


var alumniAuth = (req, res, next) => {
    var token = req.header('x-auth');

    if(!token){
        return res.status(400).send({'err': 'Token not found (user not logged in).'})
    }

    Alumni.findByToken(token)
        .then((alumni) => {
            if(!alumni) {
                console.log(alumni);
                return res.status(400).send({'err': "Token invalid."});
            }

            if(!alumni.verified){
                return res.status(400).send({'err': "Alumni not verified."});
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