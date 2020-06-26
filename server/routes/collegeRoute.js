const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {
    College,
    Alumni,
    Student,
    Event,
    NewsLetter,
    Job,
    Interview,
    Ticket,
    Fund
} = require('./../models');

const {collegeAuth} = require('./../middleware/collegeAuth');

const {parseExcel} = require('./../controllers');



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
router.get('/', collegeAuth, (req, res) => {

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


router.get('/profile', collegeAuth, (req, res) => {
    res.send(req.college);
})


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


router.post('/newsletters', collegeAuth, (req, res) => {

    var newsletter = new NewsLetter({
        postedBy: req.college._id,
        name: req.body.fileName || req.files.newsletter.name,
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


router.get('/newsletters/:id', collegeAuth, (req, res) => {
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


// Get list of events
router.get('/events', collegeAuth, (req, res) => {
    
    // returns only the events organised by the college
    Event
        .find({
            organiserId : req.college._id,
            date: { $gte : new Date()}

        })
        .select('-attendees')
        .sort({'date': 1})
        .then((events) => {

            events.forEach((event) => {
                event.sooos = "jkjkj"
                return event
            })


            // events.forEach((event) => {
            //     console.log(event.title);
            //     event.attendeesCount = "kjajhsjk";
            //     // delete event.attendees;
            // })

            // events = events.map(function(event){
            //     event.set('attendeesCount', event.attendees.length, {strict: false})
            //     console.log(event);
            //     return event
            // })

            // console.table(events);
            // console.log(events);                

            res.send(events)
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// For getting full profile of a particular event
router.get('/events/:id', collegeAuth, (req, res) => {
    var eventId = req.params.id;
    
    Event
        .findOne({
            _id: eventId,
            organiserId: req.college._id
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



router.get('/jobs', collegeAuth, (req, res) => {
    var params = {}

    params.collegeId = req.college._id;

    if("search" in req.query){
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


router.get('/jobs/:id', collegeAuth, (req, res) => {
    var jobId = req.params.id;

    Job 
        .findOne({
            _id: jobId,
            collegeId: req.college._id
        })
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/interviews', collegeAuth, (req, res) => {
    var params = {};

    params.collegeId = req.college._id;

    if("search" in req.query){
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

router.get('/interviews/:id', collegeAuth, (req, res) => {
    var interviewId = req.params.id;

    Interview
        .findOne({
            _id: interviewId,
            collegeId: req.college._id
        })
        .then((interview) => {
            res.send(interview);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.post('/funds', collegeAuth, (req, res) => {

    req.body.raisedBy = req.college._id;

    const fund = new Fund(req.body);

    fund
        .save()
        .then((fund) => {
            res.status(200).send(fund);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});



module.exports = router;