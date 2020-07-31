const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {
    Student,
    Event,
    Job,
    Interview,
    Ticket
} = require('./../../models');

const {studentAuth} = require('../../middleware/studentAuth.js');


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
        res.status(500).send(err);
    });

});


//login
router.post('/login', (req, res) => {
    
    var {email, password} = _.pick(req.body, ['email', 'password']);

    Student.findOne({email, password}) 
        .then((student) => {
            if(!student) {
                res.status(404).send({"err": "Invalid credentials."})
            }
            return student.generateAuthToken()
                .then((token) => {
                    res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({message: 'Login successful.'});
                });
        })
        .catch((err) => {
            res.status(500).send(err)
        });
});


// me
router.get('/profile', studentAuth ,(req, res) => {
    res.send(req.student);
})

router.patch('/profile', studentAuth, (req, res) => {
    var student = req.student;

    Student
        .findByIdAndUpdate(
            {_id: student._id},  
            req.body,
            {new: true}  //Default value is False and it sends the old document. This statement means to send "new" (updated document) back, instead of old document.
        )
        .select('-tokens')
        .then((student) => {
            res.send(student);
        })
        .catch((err) => {
            res.status(500).send(err)
        })
});


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
    
    Event
        .find({
            organiserId : req.student.collegeId,
            date: { $gte : new Date()}
        })
        .then((events) => {
            res.send(events)
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// For getting full profile of a particular event
router.get('/events/:id', studentAuth, (req, res) => {
    var eventId = req.params.id;
    
    Event
        .findOne({
            _id: eventId,
            organiserId: req.student.collegeId
        })
        .then((event) => {
            event.populate('attendees', ['firstName'])
                .execPopulate(function (err, event){
                    if(err){
                        res.status(500).send(err);
                    }
                    res.send({event})
                });
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});


router.post('/attend-event/:id', studentAuth, (req, res) =>{
    res.status(403).send({"err" : "Student cannot attend events."});  
});


// post job
router.post('/jobs', studentAuth, (req, res) => {
    res.status(403).send({"err" : "Student cannot post jobs."});
});


router.get('/jobs', studentAuth, (req, res) => {
    var params = {};

    params.collegeId = req.student.collegeId;

    if("search" in req.query && req.query["search"]){
        params["$text"] = { $search: req.query["search"] }
    }
    
    Job
        .find(params)
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err)
        }); 
});

router.get('/jobs/:id', studentAuth, (req, res) => {
    var jobId = req.params.id;

    Job 
        .findOne({
            _id: jobId,
            collegeId: req.student.collegeId
        })
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.post('/interviews', studentAuth, (req, res) => {
    res.status(403).send({"err": "Students cannot post interviews."})
});


router.get('/interviews', studentAuth, (req, res) => {
    var params = {};

    params.collegeId = req.student.collegeId;

    if("search" in req.query && req.query["search"]){
        params["$text"] = { $search: req.query["search"] }
    }

    Interview
        .find(params)
        .then((interviews) => {
            res.send(interviews);
        })
        .catch((err) => {
            res.status(400).send(err);
        })
});

router.get('/interviews/:id', studentAuth, (req, res) => {
    var interviewId = req.params.id;

    Interview
        .findOne({
            _id: interviewId,
            collegeId: req.student.collegeId
        })
        .then((interview) => {
            res.send(interview);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});



module.exports = router;


