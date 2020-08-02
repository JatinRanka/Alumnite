const express = require('express');
const router = express.Router();

const {
    College,
    Faculty
} = require('../models');


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    Faculty
        .findOne({
            email, password
        })
        .then((faculty) => {
            if(!faculty) {
                return res.status(404).json({err: "Check credentials."})
            };

            College
                .findOne({_id: faculty.collegeId})
                .then((college) => {
                    if(!college) {
                        return res.status(404).json({err: "College not found."})
                    }
                    return college.generateAuthToken()
                        .then((token) => {
                            res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({user: college});
                        })
                        .catch((err) => {
                            return Promise.reject(err)
                        });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });       
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

module.exports = router;