const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {
    Alumni,
    Event,
    NewsLetter,
    Job,
    Interview,
    Ticket,
    Fund,
    ChatRoom,
    ChatMessage,
    Notice
} = require('./../../models');

const Services = require('./../../services');

const {alumniAuth} = require('../../middleware/alumniAuth.js');

const {forgotPassword, facebookLogin} = require('../../controllers');


router.post('/forgotPassword', (req, res) => {
    console.log( forgotPassword() );
    res.send("don")
})

router.post('/facebookLogin', async (req, res) => {

    try {
        let email = await facebookLogin(req.body.userID, req.body.accessToken);
        let alumni = await Alumni.findOne({email});

        if(!alumni){
            res.status(404).send({'err': 'No user found with this FaceBook account.'})
        };

        return alumni.generateAuthToken()    
                .then((token) => {
                    res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({user:alumni});
                })
                .catch((err) => {
                    res.status(400).send(err)
                })

    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
});


router.post('/register', (req, res) => {

    var alumni = new Alumni(req.body);

    alumni.education.push({
        "startYear": alumni.startYear.toString(),
        "endYear": alumni.endYear.toString(),
        "course": alumni.degree,
        "school": alumni.collegeName
    });

    alumni.save()
        .then(() => {
            return alumni.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(alumni);
        }).catch((err) => {
            res.status(400).send(err);
        });

});


//login
router.post('/login', (req, res) => {
    
    var {email, password} = _.pick(req.body, ['email', 'password']);

    Alumni.findOne({email, password}) 
        .then((alumni) => {
            if(!alumni) {
                return res.status(404).send({'err': 'Invalid Credentials.'});
            }
            if(!alumni.verified){
                return res.status(404).send({'err': 'Alumni not verified.'});
            }

            return alumni.generateAuthToken()    
                .then((token) => {
                    res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({user:alumni});
                }); 
        })
        .catch((err) => {
            res.status(400).send(err)
        });
});


// me
router.get('/profile', alumniAuth, (req, res) => {
    // res.send(req.alumni);
    Alumni
        .findById({
            _id: req.alumni._id
        })
        .select('-tokens')
        .then((alumni) => {
            res.send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err)
        });
});


router.patch('/profile', alumniAuth, (req, res) => {
    var alumni = req.alumni;

    Alumni
        .findByIdAndUpdate(
            {_id: alumni._id},  
            req.body,
            {new: true}  //Default value is False and it sends the old document. This statement means to send "new" (updated document) back, instead of old document.
        )
        .select('-tokens')
        .then((alumni) => {
            res.send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err)
        })
});

//logout
router.delete('/logout', alumniAuth, (req, res) => {
    req.alumni.removeToken(req.token)
        .then(() => {
            res.status(200).send({msg: 'Logout Success'});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// Fill profile
router.post('/fill-profile', alumniAuth, (req, res) => {
    var {education, work, mobileNumber, location} = _.pick(req.body, ['education', 'work', 'mobileNumber', 'location']);

    var alumni = req.alumni;
    
    alumni.education = education;
    alumni.work = work;
    alumni.mobileNumber = mobileNumber;
    alumni.location = location;

    alumni.save()
        .then(() => {
            res.send("success");
        })
        .catch((err) => {
            res.status(400).send(err)
        })
});


// Get list of events
router.get('/events', alumniAuth, (req, res) => {
    
    // returns only the events organised by alumni's college
    Event
        .find({
            organiserId : req.alumni.collegeId,
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
router.get('/events/:id', alumniAuth, (req, res) => {
    var eventId = req.params.id;
    
    Event
        .findOne({
            _id: eventId,
            organiserId: req.alumni.collegeId
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


router.post('/events/attend/:id', alumniAuth, (req, res) =>{
    var eventId = req.params.id;

    Event.findOne({
        _id: eventId,
        organiserId: req.alumni.collegeId
    })
        .then((event) => {

            // if event doesn't exist
            if(!event) {
                res.status(404).json({err : "Event doesn't exist."})
            }

            // adds user to the list of event attendees
            event.attendees.push(req.alumni)
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


// post job
router.post('/jobs', alumniAuth, (req, res) => {

    req.body.postedBy = req.alumni._id;
    req.body.collegeId = req.alumni.collegeId;
    var job = new Job(req.body);

    var keywords = [];
    keywords = keywords.concat(job.skillsRequired, job.qualification, job.company, job.industry, job.workTitle, job.typeOfJob);
    job.keywords = keywords;


    job.save()
        .then(() => {
            res.send({success: "job posted successfully", job})
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/jobs', alumniAuth, (req, res) => {
    var params = {}

    params.collegeId = req.alumni.collegeId;

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


router.get('/jobs/:id', alumniAuth, (req, res) => {
    var jobId = req.params.id;

    Job 
        .findOne({
            _id: jobId,
            collegeId: req.alumni.collegeId
        })
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.post('/interviews', alumniAuth, (req, res) => {
    req.body.postedBy = req.alumni._id;
    req.body.collegeId = req.alumni.collegeId;

    var interview = new Interview(req.body);

    var keywords = [];
    keywords = keywords.concat(
        interview.company, 
        interview.workTitle,
        interview.industry,
        interview.topics
        );

    interview.keywords = keywords;
    
    interview.save()
        .then(() => {
            res.send(interview);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/interviews', alumniAuth, (req, res) => {
    var params = {};

    params.collegeId = req.alumni.collegeId;

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

router.get('/interviews/:id', alumniAuth, (req, res) => {
    var interviewId = req.params.id;

    Interview
        .findOne({
            _id: interviewId,
            collegeId: req.alumni.collegeId
        })
        .then((interview) => {
            res.send(interview);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/newsletters', alumniAuth, (req, res) => {
    
    NewsLetter
        .find({postedBy: req.alumni.collegeId})
        .select("name createdAt")
        .sort({ 'createdAt': -1 })
        .then((newsletters) => {
            res.send(newsletters);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});


router.get('/newsletters/:id', alumniAuth, (req, res) => {
    var newsletterId = req.params.id;

    NewsLetter
        .findOne({
            _id: newsletterId,
            postedBy: req.alumni.collegeId
        })
        .then((newsletter) => {
            res.set("Content-Type", newsletter.contentType);
            res.send(newsletter.data);
        })
        .catch((err) => {
            console.log(err);
        });
});


router.post('/tickets', alumniAuth, (req, res) => {
    req.body.postedBy = req.alumni._id;
    req.body.collegeId = req.alumni.collegeId;
    console.log(req.body);
    var ticket = new Ticket(req.body);

    ticket.save()
        .then((ticket) => {
            res.send(ticket);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/alumni', alumniAuth, (req, res) => {
    const query = req.query;
    const params = {};   

    /* format for params which is to be passed while fetching from DB
    params = {
        location.city : {$in: xyz},
        location.country: {$in: xyz},
        ...
        ...
        $text : { $search: someSearchString }
    }
    */

    for(key in query){
        if (query[key]){
            params[key] = {$in: query[key]}
        }
    };

    if("search" in params){
        params["$text"] = { $search: query["search"] };
        delete params["search"];
    }

    params["collegeId"] = req.alumni.collegeId;
    
    if ( !("verified" in params) ){
        params["verified"] = true;
    }

    console.log(params);

    Alumni
        .find(params)
        .collation({ locale: 'en', strength: 2 }) // collation makes search case insensitive
        .select("-tokens -password")
        .then((alumnis) => {
            res.send(alumnis);
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});


router.get('/alumni/:id', alumniAuth, (req, res) => {
    var userId = req.params.id;

    Alumni
        .findOne({
            collegeId: req.alumni.collegeId,
            _id: userId
        })
        .then((alumni) => {
            res.send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err);
        })

});

router.get('/funds', alumniAuth, (req, res) => {
    Fund
        .find({ raisedBy: req.alumni.collegeId })
        .select("title subtitle totalRequired totalRaised")
        .then((funds) => {
            res.send(funds)
        })
        .catch((err) => {
            res.status(500).send(err);
        });
})

router.get('/funds/:id', alumniAuth, (req, res) => {
    let fundId = req.params.id;

    Fund
        .findOne({
            raisedBy: req.alumni.collegeId,
            _id: fundId
        })
        .then((fund) => {
            res.send(fund)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

router.post('/funds/:id', alumniAuth, (req, res) => {
    const {amount} = req.body;

    let fundId = req.params.id;

    Fund
        .findOneAndUpdate(
            {   
                _id : fundId, 
                raisedBy : req.alumni.collegeId 
            },
            {
                "$push": 
                    { 
                        "contributors": {contributedBy: req.alumni._id, amount } 
                    },
                "$inc": 
                    {
                        "totalRaised": amount
                    }
            },
            {
                new: true // Returns updated document
            }
        )
        .then((fund) => {
            res.send(fund)
        })
        .catch((err) => {
            res.status(500).send(err)
        });
 
});

const stripe = require('stripe')('sk_test_51F3KWQHWjDP4EbZD3FDMTuQ9gtFtw5mu35F1vfRxeGTDsmpD0ECBwoO5qc78rvnU0p6ygj12Fg5xuP6qrO4Fbb7u00JX3VeyLB', {apiVersion: ''});

router.get('/paymentClient', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'inr',
            // Verify your integration in this guide by including this parameter
            metadata: {integration_check: 'accept_a_payment'},
        });
    
        console.log(paymentIntent);
    
        res.json({client_secret: paymentIntent.client_secret});

    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});


router.post('/chatrooms', alumniAuth, (req, res) => {
    const chatRoom = new ChatRoom({
        collegeId: req.alumni.collegeId,
        name: req.body.name,
        members: [req.alumni._id],
        category: 'interest'
    });

    chatRoom
        .save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            res.status(400).send(err);
        });

});

router.get('/chatrooms', alumniAuth, (req, res) => {
    ChatRoom
        .find({
            collegeId: req.alumni.collegeId,
            $or: 
                [
                    { 
                        category: 'interest' 
                    },
                    { $and: 
                        [
                            {category:'year'}, 
                            {year: req.alumni.endYear} 
                        ]
                    },
                    { $and: 
                        [
                            { category: 'yearCourse' },
                            { year: req.alumni.endYear },
                            { course: req.alumni.branch }
                        ]
                    }
                ]
        })
        .sort({ category: -1, year:1 })
        .then((chatRooms) => {
            res.send(chatRooms)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

router.get('/chatrooms/:id', alumniAuth, (req, res) => {
    const chatRoomId = req.params.id;

    
    ChatRoom
        .findOne
        ({
            _id: chatRoomId,
            collegeId: req.alumni.collegeId
        })
        .lean()
        .then((chatRoom) => {
            if(!chatRoom){
                return res.status(400).send({err: "Chatroom doesn't exist."});
            }
            
            if(chatRoom.type === "year" && req.alumni.endYear !== chatRoom.year){
                return res.status(400).send({err: `You cant access this chat room. Only ${year} year Alumni can access.`});
            }

            if(chatRoom.type === "yearCourse" && (chatRoom.year !== req.alumni.endYear || chatRoom.course !==  req.alumni.branch) ) {
                return res.status(400).send({err: `You cant access this chat room. Only ${chatRoom.year} year ${chatRoom.course} branch Alumni can access.`});
            }

            ChatMessage
                .find({chatRoomId})
                .populate('senderId', 'collegeName firstName adminName')
                .then((messages) => {
                    res.send({
                        currentUserId: req.alumni._id,
                        messages
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
        })
        .catch((err) => {
            res.status(500).send(err)
        });     
});

router.get('/stats', alumniAuth, async (req, res) => {

    try {
        var stats = await Services.StatsService.fetchCollegeStats(req.alumni.collegeId);
        res.send(stats);
    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
    
});

router.get('/notices', alumniAuth, (req, res) => {

    Notice
        .find({
            $or: [
                { postedBy: req.alumni.collegeId },
                { postedBy: req.alumni.adminId }
            ]
        })
        .populate('postedBy', 'adminName collegeName')
        .sort({expireAt: 1})
        .then((notices) => {
            res.status(200).send(notices);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

module.exports = router;
