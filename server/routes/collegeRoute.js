const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {College} = require('./../models/collegeModel');
const {Student} = require('./../models/studentModel');
const {Event} = require('./../models/eventModel.js')

const {collegeAuth} = require('./../middleware/collegeAuth');


// register new college
router.post('/add', (req, res) => {
    var college = new College(req.body);

    college.save()
        .then(() => {
            res.send("success")
        })
        .catch((err) => {
            res.send(err)
        })
});


// Login
router.post('/login', (req, res) => {
    var {email, password} = _.pick(req.body, ['email', 'password']);

    College.findOne({email, password})
        .then((college) => {
            if(!college) {
                return res.status(404).json({emailerror: "College not found with this email"})
            }

            return college.generateAuthToken();
        })
        .then((token) => {
            res.status(200).header('x-auth', token).send("login successful");
        })
        .catch((err) => {
            res.status(400).send(err);
        });
})


// Logout
router.delete('/logout', collegeAuth, (req, res) => {
    req.college.removeToken(req.token)
        .then(() => {
            res.send('college logout success')
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});




// get college profile
// i/p => token
router.get('/profile', collegeAuth, (req, res) => {
    res.send(req.college);
})



/*
 @Type: POST
 @Route: /listOfStudents
 @Desc: For getting list of students from 
        the particular college
 @input: token in header
 @output: Array (res.body) - list of students
*/
router.get('/listOfStudents', collegeAuth, (req, res) => {
    Student.find({ collegeName: req.college.collegeName})
        .then((students) => {
            res.send(students)
        })
        .catch((err) => {
            res.status(200).send(err)
        })
})


// post events
router.post('/events', collegeAuth, (req, res) => {

    var college = req.college;
    // var time = moment.tz('Asia/Calcutta').format("YYYY-MM-DDTHH:MM:ss");

    var event = new Event({
        name: req.body.name,
        //format MM-DD-YYYY
        date: new Date(req.body.date),
        venue: req.body.venue,
        decription: req.body.decription,
        organisedBy: college._id
    });
    
    event.save()
        .then(() => {
            college.events.push(event) ;
            college.save()
                .then(() => {
                    res.send("event posted successfully.");
                })
                .catch((err) => {
                    res.status(400).send(err);
                })
        })
        .catch((err) => {
            res.status(400).send(err);
        })
});


router.get('/events', collegeAuth, (req, res) => {
    var college = req.college;

    // collegePopulated will return whole college profile with 
    // the events values fetched from the 'events' database.

    // execPopulate() is used for document(record)
    // exec() is used for query.

    college
        .populate('events')
        .execPopulate(function (err, collegePopulated){
            if(err){
                res.status(400).send(err)
            }
            // fetching only the events array
            // from the whole college profile.
            res.send(collegePopulated.events)
        });
});


router.get('/job', collegeAuth, (req, res) => {

    let parameters = req.query;

    var paramSkillsRequired = [];

    if(parameters.skillsRequired){

        if( Array.isArray(parameters.skillsRequired) ){
            paramSkillsRequired = parameters.skillsRequired;
        } else{
            paramSkillsRequired = [parameters.skillsRequired];
        }

        delete parameters.skillsRequired;
    }

    var paramQualification = [];

    if(parameters.qualification){

        if( Array.isArray(parameters.qualification) ){
            paramQualification = parameters.qualification;
        } else{
            paramQualification = [parameters.qualification];
        }

        delete parameters.qualification;
    }
    console.log(paramQualification);

    // execPopulate() is used for document(record)
    // exec() is used for query.
    Job
        .find(
            {$and:[
                parameters,
                {skillsRequired: {$all: paramSkillsRequired}},
                {qualification: {$all: paramQualification}},
                {postedBy: req.college._id }
            ]}
        )
        .then((jobs) => {
            if(jobs.length === 0){
                res.send({EmptyError: "No jobs to show."})
            }
            res.send(jobs)
        })
        .catch((err) => {
            res.status(400).send(err)
        }); 
});


module.exports = router;