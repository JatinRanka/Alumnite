const express = require('express');
const router = express.Router();

const _ = require('lodash');

const {
    Admin,
    College,
    Alumni,
    Student,
    Event,
    NewsLetter,
    Job,
    Interview,
    Ticket,
    Fund,
    ChatRoom,
    ChatMessage,
    Notice
} = require('./../models');

const Services = require('./../services')

// MiddleWare
const {adminAuth} = require('./../middleware/adminAuth.js')


// register new college
router.post('/college', adminAuth, (req, res) => {
    req.body.adminId = req.admin._id;
    var college = new College(req.body);

    college.save()
        .then((college) => {
            res.send(college);
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
                return res.status(404).json({err: "Check credentials."})
            }

            return admin.generateAuthToken()
                .then((token) => {
                    res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({message: "Login successful."});
                })
                .catch((err) => {
                    res.status(400).send(err);
                });
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


// For search page, alumni directory
router.get('/alumni', adminAuth, (req, res) => {
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


router.get('/alumni/:id', adminAuth, (req, res) => {
    Alumni
        .findOne({
            _id: req.params.id
        })
        .select("-password -tokens")
        .then((alumni) => {
            res.status(200).send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err)
        });
});

router.get('/chatrooms', adminAuth, (req, res) => {
    console.log(req.query);
    
    ChatRoom
        .find({
            collegeId: req.query.collegeId
        })
        .sort({ category: -1, year:1 }) 
        .then((chatRooms) => {
            res.send(chatRooms)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

router.get('/chatrooms/:id', adminAuth, (req, res) => {
    const chatRoomId = req.params.id;

    ChatRoom
        .findOne({
            _id: chatRoomId
        })
        .lean()
        .then((chatRoom) => {
            if(!chatRoom){
                return res.status(400).send({err: "Chatroom doesn't exist."});
            }

            ChatMessage
                .find({chatRoomId})
                .populate('senderId', 'firstName collegeName adminName')
                .then((messages) => {
                    res.send({
                        currentUserId: req.admin._id,
                        messages
                    });
                })  
                .catch((err) => {
                    console.log(err);                        
                    res.status(500).send(err);
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err)
        });        

});

router.get('/stats', adminAuth, async (req, res) => {

    try {
        var stats;

        if (req.body.collegeId){
            stats = await Services.StatsService.fetchCollegeStats(req.body.collegeId);
        } else{
            stats = await Services.StatsService.fetchAdminStats();
        }

        res.send(stats);
    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
    
});

router.post('/notices', adminAuth, (req, res) => {

    const { title, subTitle, expireAt } = req.body;

    const notice = new Notice({
        postedBy: req.admin._id,
        onModel: 'Admin',
        title,
        subTitle,
        expireAt
    });

    notice.save()
        .then((notice) => {
            res.status(201).send(notice);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/notices', adminAuth, (req, res) => {
    
    Notice
        .find({})
        .populate('postedBy', 'adminName collegeName')
        .sort({expireAt: 1})
        .then((notices) => {
            res.status(200).send(notices);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.post('/email', adminAuth, (req, res) => {

    Services.EmailService.fetchUsers(null, req.query)
        .then((alumnis) => {
            console.log(alumnis);   
            return res.send(alumnis);
            alumnis = ['jatinranka123@gmail.com' ]
            // return Services.EmailService.sendMail(to=alumnis, req.body.subject, req.body.message)
        })
        .then((mailInfo) => {
            console.log(mailInfo);
            res.send(mailInfo)
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        })
});

router.get('/newsletters', adminAuth, (req, res) => {
    NewsLetter
        .find()
        .select("name createdAt")
        .sort({ 'createdAt': -1 })
        .then((newsletters) => {
            res.send(newsletters);
        })
        .catch((err) => {
            res.status(500).send(err);
        })
})

router.get('/newsletters/:id', adminAuth, (req, res) => {
    var newsletterId = req.params.id;

    NewsLetter
        .findOne({
            _id: newsletterId
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
router.get('/events', adminAuth, (req, res) => {
    
    // returns only the events organised by the college
    Event
        .find({
            date: { $gte : new Date()}
        })
        .select('-attendees')
        .sort({'date': 1})
        .then((events) => {

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
router.get('/events/:id', adminAuth, (req, res) => {
    var eventId = req.params.id;
    
    Event
        .findOne({
            _id: eventId
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

router.get('/jobs', adminAuth, (req, res) => {
    var params = {}

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


router.get('/jobs/:id', adminAuth, (req, res) => {
    var jobId = req.params.id;

    Job 
        .findOne({
            _id: jobId
        })
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/interviews', adminAuth, (req, res) => {
    var params = {};

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

router.get('/interviews/:id', adminAuth, (req, res) => {
    var interviewId = req.params.id;

    Interview
        .findOne({
            _id: interviewId
        })
        .then((interview) => {
            res.send(interview);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get('/funds', adminAuth, (req, res) => {
    Fund
        .find()
        .select("title subtitle totalRequired totalRaised")
        .then((funds) => {
            res.send(funds)
        })
        .catch((err) => {
            res.status(500).send(err);
        });
})

router.get('/funds/:id', adminAuth, (req, res) => {
    let fundId = req.params.id;

    Fund
        .findOne({
            _id: fundId
        })
        .then((fund) => {
            res.send(fund)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

router.get('/tickets', adminAuth, (req, res) => {
    Ticket
        .find()
        .select('-description')
        .populate('postedBy', 'firstName lastName')
        .sort({createdAt: 1})
        .then((tickets) => {
            res.status(200).send(tickets);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/tickets/:id', adminAuth, (req, res) => {
    Ticket
        .findOne({
            _id: req.params.id
        })
        .populate('postedBy', 'firstName lastName')
        .then((ticket) => {
            if(!ticket){
                return res.status(404).send({err: 'Ticket not found.'})
            }
            res.status(200).send(ticket);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});


module.exports = router;

