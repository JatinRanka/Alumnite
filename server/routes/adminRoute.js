const express = require('express');
const router = express.Router();

const _ = require('lodash');


const {College} = require('./../models/collegeModel');
const {Student} = require('./../models/studentModel');
const {Alumni} = require('./../models/adminModel.js');
const {Admin} = require('./../models/adminModel.js');

// MiddleWare
const {adminAuth} = require('./../middleware/adminAuth.js')


// register new admin
router.post('/add', (req, res) => {
    var admin = new Admin(req.body);

    admin.save()
        .then(() => {
            res.send({msg: 'admin added successfully.'})
        })
        .catch((err) => {
            res.status(400).send(err)
        })
});

// register new college
router.post('/college', adminAuth, (req, res) => {
    req.body.adminId = req.admin._id;
    // console.log(req.admin._id);
    var college = new College(req.body);

    college.save()
        .then((college) => {
            res.send({msg: 'College added successfully.', college});
        })
        .catch((err) => {
            res.status(400).send({err});
        });
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


// get all alumni
router.get('/listOfAlumni', adminAuth, (req, res) => {
    let parameters = req.query;
    console.log(parameters);

  

    Alumni.find({  skills : {$all: ["ai", "ml", "ds"]}   })

        .then((alumni) => {
            res.send(alumni)
        })
        .catch((err) => {
            res.status(400).send(err);
        })
})

// skills : {$all: ["ai", "ml", "ds"]}

module.exports = router;

