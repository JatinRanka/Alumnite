const express = require('express');
const router = express.Router();

const _ = require('lodash');


const {Student} = require('./../models/studentModel');
const {College} = require('./../models/collegeModel.js');
const {Admin} = require('./../models/adminModel.js');
const {Event} = require('./../models/eventModel.js');

const {studentAuth} = require('../middleware/studentAuth.js');

// dummy update for test
router.post('/test',studentAuth, (req, res) => {
    var student = req.student;

    student.update({collegeId : req.body.collegeId})
        .then(() => {
            res.send("successfuly updtaed")
        })
        .catch((err) => {
            res.status(400).send(err)
        })
})

router.get('/test' , studentAuth, (req, res) => {
    req.student
        .populate('collegeId')
        .execPopulate(function (err, collegePopulated){
            if(err){
                res.status(400).send(err)
            }
            // fetching only the events array
            // from the whole college profile.
            res.send(collegePopulated)
        });
})

/*
 @Type: POST
 @Route: /register
 @Desc: Sign-up
*/
router.post('/register', (req, res) => {

    var student = new Student(req.body)

    student.save().then(() => {
        return student.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(student);
    }).catch((err) => {
        res.status(400).send(err);
    });

});


//login
router.post('/login', (req, res) => {
    
    var {email, password} = _.pick(req.body, ['email', 'password']);

    Student.findOne({email, password}) 
        .then((student) => {
            if(!student) {
                reject();
            }
            return student.generateAuthToken()    
        })
        .then((token) => {
            res.status(200).header('x-auth', token).send();
        })
        .catch((err) => {
            res.status(400).send(err)
        });
});


// me
router.get('/profile', studentAuth ,(req, res) => {
    res.send(req.student);
})


//logout
router.delete('/logout', studentAuth, (req, res) => {
    req.student.removeToken(req.token)
        .then(() => {
            res.status(200).send();
        })
        .catch((err) => {
            res.status(400).send();
        });
});


// Fill profile
router.post('/fill-profile', studentAuth, (req, res) => {
    var {education, work, mobileNumber, location} = _.pick(req.body, ['education', 'work', 'mobileNumber', 'location']);

    var student = req.student;
    
    student.education = education;
    student.work = work;
    student.mobileNumber = mobileNumber;
    student.location = location;

    student.save()
        .then(() => {
            res.send("success");
        })
        .catch((err) => {
            res.status(400).send(err)
        })
});


// Get list of events
router.get('/events', studentAuth, (req, res) => {
    
    // returns only the events organised by student's college
    Event.find({organisedBy : req.student.collegeId})
        .then((events) => {
            res.send(events)
        })
        .catch((err) => {
            res.status(400).send(err);
        })

});

router.post('/attend-event/:id', studentAuth, (req, res) =>{
    var eventId = req.params.id;
    console.log(eventId);

    Event.findById(eventId)
        .then((event) => {

            // if event doesn't exist
            if(!event) {
                res.status(404).json({NullEventError : "Event doesn't exist."})
            }

            // adds user to the list of event attendees
            event.attendees.push(req.student)
            event.save()
                .then(() => {
                    res.send({success : "event registration success"});
                })
                .catch((err) => {
                    res.status(400).send(err)
                });
        })
        .catch((err) => {
            res.status(400).send(err)
        });
});



module.exports = router;

