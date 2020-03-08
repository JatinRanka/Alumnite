const express = require('express');
const router = express.Router();

const _ = require('lodash');
const queryString = require('query-string');


const {College} = require('./../models/collegeModel');
const {Student} = require('./../models/studentModel');
const {Admin} = require('./../models/adminModel.js');

// MiddleWare
const {adminAuth} = require('./../middleware/adminAuth.js')


// register new admin
router.post('/add', (req, res) => {
    var admin = new Admin(req.body);

    admin.save()
        .then(() => {
            res.send("success")
        })
        .catch((err) => {
            res.status(400).send(err)
        })
});

// Login
router.post('/login', (req, res) => {
    var {email, password} = _.pick(req.body, ['email', 'password']);

    Admin.findOne({email, password})
        .then((admin) => {
            if(!admin) {
                return res.status(404).json({emailerror: "Admin not found with this email"})
            }

            return admin.generateAuthToken();
        })
        .then((token) => {
            res.status(200).header('x-auth', token).send("admin login successful");
        })
        .catch((err) => {
            console.log('in catch');
            res.status(400).send(err);
        });
})


// Logout
router.delete('/logout', adminAuth, (req, res) => {
    req.admin.removeToken(req.token)
        .then(() => {
            res.send('admin logout success')
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

// get admin profile
// i/p => token
router.get('/profile', adminAuth, (req, res) => {
    res.send(req.admin);
})


// get all students
router.get('/listOfStudents', adminAuth, (req, res) => {
    let parameters = req.query;
    console.log(parameters);
  

    Student.find({ "skills": "ai", skills:"ds" , "work.company" : "google" })

        .then((students) => {
            res.send(students)
        })
        .catch((err) => {
            res.status(400).send(err);
        })
})



module.exports = router;

