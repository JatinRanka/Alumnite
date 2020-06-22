const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {Alumni} = require('./../models/alumniModel.js')
const {College} = require('./../models/collegeModel');
const {Student} = require('./../models/studentModel');
const {Event} = require('./../models/eventModel.js')

const {NewsLetter} = require('./../models/newsletterModel.js');

const {collegeAuth} = require('./../middleware/collegeAuth');

const {parseExcel} = require('./../controllers')

router.post('/insertAlumniExcel', 
    collegeAuth,
    parseExcel,
    (req, res) => {

        req.data.forEach((alumni) => {
            alumni["collegeId"] = req.college._id;
            alumni["adminId"] = req.college.adminId;
            alumni["password"] = Math.random().toString(36).substring(2, 15) // This will generate random password.
        }) 

        Alumni
            .insertMany(
                req.data,
                {
                    ordered: false,
                    rawResult: true
                }
            )
            .then((result) => {
                res.send(result)
            })
            .catch((err) => {
                res.status(400).send(err)
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
            if(!college) {
                return res.status(404).json({err: "Check credentials."})
            }
            return college.generateAuthToken()
                .then((token) => {
                    res.status(200).header('x-auth', token).send({user: college});
                })
                .catch((err) => {
                    return Promise.reject(err)
                });
        })        
        .catch((err) => {
            console.log("in catcg");
            console.log(err);
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
            college.events.push(event);
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


router.get('/jobs', collegeAuth, (req, res) => {

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


router.post('/newsletters', collegeAuth, (req, res) => {

    var newsletter = new NewsLetter({
        postedBy: req.college._id,
        name: req.files.newsletter.name,
        data: req.files.newsletter.data,
        contentType: req.files.newsletter.mimetype
    });

    newsletter
        .save()
        .then((result) => {
            res.send({msg: "Newsletter Saved Successfully."})
        })
        .catch((err) => {
            res.status(500).send(err)
        })
});

router.get('/newsletters', collegeAuth, (req, res) => {
    NewsLetter
        .find({postedBy: req.college._id})
        .select("name createdAt")
        .sort({ 'createdAt': -1 })
        .then((newsletters) => {
            res.send(newsletters);
        })
        .catch((err) => {
            res.status(500).send(err);
        })
})

router.get('/newsletters/:id', (req, res) => {
    var newsletterId = req.params.id;

    NewsLetter
        .findOne({
            _id: newsletterId,
            postedBy: req.college._id
        })
        .then((newsletter) => {
            res.set("Content-Type", newsletter.contentType);
            res.send(newsletter.data);
        })
        .catch((err) => {
            console.log(err);
        });
});



module.exports = router;