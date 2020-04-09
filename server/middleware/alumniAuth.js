var {Alumni} = require('../models/alumniModel.js');


var alumniAuth = (req, res, next) => {
    var token = req.header('x-auth');

    Alumni.findByToken(token)
        .then((alumni) => {
            if(!alumni) {
                res.status(401).send({err: 'User not found'});
                reject();
            }
            console.log('herer');
            req.alumni = alumni;
            req.token = token;

            next();
        })
        .catch((err) => {
            res.status(400).send(err);
        });
};

module.exports = {alumniAuth};