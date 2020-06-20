const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {Alumni} = require('./../models/alumniModel.js')
const {College} = require('./../models/collegeModel');
const {Student} = require('./../models/studentModel');
const {Event} = require('./../models/eventModel.js');
const {NewsLetter} = require('./../models/newsletterModel.js');

const {collegeAuth} = require('./../middleware/collegeAuth');

const {parseExcel} = require('./../controllers');


router.post('/insertAlumniExcel',
    collegeAuth,
    parseExcel,
    (req, res) => {

        req.data.forEach(alumni => {
            alumni["collegeId"] = req._id,
            alumni["adminId"] = req.adminId,
            alumni["password"] = "pwd123"

        });

        Alumni
            .insertMany(req.data)
            .then((alumnis) => {
                res.send(alumnis)
            })
            .catch((err) => {
                res.send(err)
            })
    }
)
    


// Get list of all colleges
router.get('/', (req, res) => {
    College
        .find({})
        .select('collegeName')
        .then((colleges) => {
            res.send(colleges)
        })
        .catch((err) => {
            res.status(400).send(err);
        })
})


// Login
router.post('/login', (req, res) => {
    var {email, password} = _.pick(req.body, ['email', 'password']);

    College
        .findOne({
            email, 
            password
        })
        .then((college) => {
            // console.log(college);
            if(!college) {
                return res.status(404).json({'err': "Check credentials."})
            }
            return college.generateAuthToken()
        })
        .then((token) => {
            res.status(200).header('x-auth', token).send({user: college});
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
 @Route: /listOfalumni
 @Desc: For getting list of alumni from 
        the particular college
 @input: token in header
 @output: Array (res.body) - list of alumni
*/
router.get('/listOfAlumni', collegeAuth, (req, res) => {

    var parameters = req.query;
    parameters.collegeId = req.college._id;

    Alumni.find(parameters)
        .then((alumni) => {
            res.send(alumni)
        })
        .catch((err) => {
            res.status(200).send(err)
        })
})


// post events
router.post('/events', collegeAuth, (req, res) => {

    var college = req.college;

    var data = _.pick(req.body, ['title', 'subtitle', 'description', 'venue', 'location', 'endYear', 'sendMail', 'time'])

    data.organiserId = college._id;
    data.organiserType = 'college';

    var date = req.body.date.split('-');
    var date = new Date(date[0], date[1]-1, date[2]);
    // console.log(date);

    data.date = date;

    var event = new Event(data);
    event.save()
        .then(() => {
            college.events.push(event) ;
            college.save()
                .then(() => {
                    res.send({event});
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

    // execPopulate() is used for document(record)
    // exec() is used for query.

    college
        .populate('events')
        .execPopulate(function (err, collegePopulated){
            if(err){
                res.status(400).send(err)
            }
            // 1. collegePopulated will return whole college profile with 
            // the events values populated from the 'events' database.
            // 2. fetching only the events array
            // from the whole college profile.
            res.send(collegePopulated.events)
        });
});


router.get('/job', collegeAuth, (req, res) => {

    let parameters = req.query;
        
    // if skillsRequired in parameters is an array, then
    // condition is changed to $all
    if(parameters.skillsRequired){
        if( Array.isArray(parameters.skillsRequired) ){
            paramSkillsRequired = parameters.skillsRequired;
            parameters["skillsRequired"] = { $all : paramSkillsRequired };
        }         
    }

    // similar to above 
    if(parameters.qualification){
        if( Array.isArray(parameters.qualification) ){
            paramQualification = parameters.qualification;
            parameters["qualification"] = { $all : paramQualification } ;
        }
    }


    // execPopulate() is used for document(record)
    // exec() is used for query.
    Job
        .find(parameters)
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


router.post('/newsletters', (req, res) => {
    console.log("in news");  

    console.log(req.files);

    var obj = {
        storing:{
            data: req.files.files.data,
            contentType: req.files.files.mimetype
        } 
    }
    console.log(obj);

    var newsletter = new NewsLetter(obj);

    newsletter
        .save()
        .then((result) => {
            console.log('saved');
            res.send(newsletter)
        })
        .catch((err) => {
            console.log('err');
            res.status(500).send(err)
        })
})

router.get('/newsletters', (req, res) => {

    NewsLetter
        .findById("5eecab5c38a4dff2c8fbf747")
        .then((result) => {
            console.log("in resilt ------------------");
            console.log(result);
            res.set("Content-Type", result.storing.contentType);
            res.send(result.storing.data);
        })
        .catch((err) => {
            console.log(err);
        })
})


module.exports = router;