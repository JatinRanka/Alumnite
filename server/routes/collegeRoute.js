const express = require('express');
const router = express.Router();

const _ = require('lodash');

const utils = require('./../utils');

const {
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
    Notice,
    Faculty
} = require('./../models');


const {collegeAuth} = require('./../middleware/collegeAuth');

const {parseExcel} = require('./../controllers');

const Services = require('./../services');

router.post('/email', collegeAuth, (req, res) => {

    Services.EmailService.fetchUsers(req.college._id, req.query)
        .then((alumnis) => {
            console.log(alumnis);
            return res.send(alumnis);
            alumnis = ['jatinranka123@gmail.com' ];

            var subject = req.body.subject
            var message = req.body.message;            

            if (req.body.category === "inviteMail") {
                subject = `Re: Event Invitation`;

                message = (`
                    Hello,
                    ${req.college.collegeName} would like to invite you for a seminar.
                    Details:
                    Event Name: ${req.body.eventName}
                    Date: ${req.body.date}
                    Time: ${req.body.time}
                    Venue: ${req.body.venue}
                `);
            }

            return Services.EmailService.sendMail(to=alumnis, subject, message);
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


router.post('/insertAlumniExcel', 
    collegeAuth,
    parseExcel,
    (req, res) => {

        req.data.forEach((alumni) => {
            alumni["collegeId"] = req.college._id;
            alumni["adminId"] = req.college.adminId;
            alumni["verified"] = true;

            alumni["education"] = [{
                "startYear": alumni.startYear.toString(),
                "endYear": alumni.endYear.toString(),
                "course": alumni.degree,
                "school": req.college.collegeName
            }];

            alumni["location"] = {
                city: '',
                state: '',
                country: ''
            }

            // alumni["password"] = Math.random().toString(36).substring(2, 15) // This will generate random password.
        });


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
                    res.status(200).header({'x-auth': token, 'access-control-expose-headers': 'x-auth'}).send({user: college});
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
});


// For search page, alumni directory
router.get('/alumni', collegeAuth, (req, res) => {
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

    params["collegeId"] = req.college._id;

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


router.get('/alumni/:id', collegeAuth, (req, res) => {
    Alumni
        .findOne({
            _id: req.params.id,
            collegeId: req.college._id
        })
        .select("-password -tokens")
        .then((alumni) => {
            res.status(200).send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err)
        });
})

// To verify alumni
router.patch('/alumni/:id', collegeAuth, (req, res) => {
    Alumni
        .findOneAndUpdate(
            {
            _id: req.params.id,
            collegeId: req.college._id
            },
            {verified: true},
            {new: true}
        )
        .then((alumni) => {
            res.status(200).send(alumni);
        })
        .catch((err) => {
            res.status(500).send(err)
        });
});


router.delete('/alumni/:id', collegeAuth, (req, res) => {
    Alumni
        .findOneAndDelete({
            _id: req.params.id,
            collegeId: req.college._id
        })
        .then((alumni) => {
            res.status(200).send(alumni)
        })
        .catch((err) => {
            res.status(500).send(err)
        });
});


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

router.get('/funds', collegeAuth, (req, res) => {
    Fund
        .find({ raisedBy: req.college._id })
        .select("title subtitle totalRequired totalRaised")
        .then((funds) => {
            res.send(funds)
        })
        .catch((err) => {
            res.status(500).send(err);
        });
})

router.get('/funds/:id', collegeAuth, (req, res) => {
    let fundId = req.params.id;

    Fund
        .findOne({
            raisedBy: req.college._id,
            _id: fundId
        })
        .then((fund) => {
            res.send(fund)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
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

router.get('/chatrooms', collegeAuth, (req, res) => {
    ChatRoom
        .find({
            collegeId: req.college._id
        })
        .sort({ category: -1, year:1 })
        .then((chatRooms) => {
            res.send(chatRooms)
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

router.get('/chatrooms/:id', collegeAuth, (req, res) => {
    const chatRoomId = req.params.id;

    ChatRoom
        .findOne
        ({
            _id: chatRoomId,
            collegeId: req.college._id
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
                        currentUserId: req.college._id,
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

})

router.post('/chatrooms', collegeAuth, (req, res) => {

    let {name, category, year, course} = req.body;

    if(category=="year" && !year) {
        res.status(400).send({err: 'Year required.'});
    }

    if(category=="yearCourse" && !(year && course) ){
        res.status(400).send({err: 'Year and course both required.'});
    }

    if (category == "year") {
        name = year;
    } else if (category == "yearCourse") {
        name = year + ' ' + course;
    }

    const chatRoom = new ChatRoom({
        collegeId: req.college._id,
        name,
        category,
        year,
        course
    });

    chatRoom.save()
        .then((chatRoom) => {
            res.status(201).send(chatRoom);
        })
        .catch((err) => {
            res.status(500).send(err);
        });


});


router.get('/tickets', collegeAuth, (req, res) => {
    Ticket
        .find({
            collegeId: req.college._id
        })
        .populate('postedBy', 'firstName lastName')
        .sort({createdAt: 1})
        .select('-description')
        .then((tickets) => {
            res.status(200).send(tickets);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.get('/tickets/:id', collegeAuth, (req, res) => {
    Ticket
        .findOne({
            _id: req.params.id,
            collegeId: req.college._id
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


router.patch('/tickets/:id', collegeAuth, async (req, res) => {

    try {
        var ticket = await Ticket
                                .findOne({
                                    _id: req.params.id,
                                    collegeId: req.college._id
                                    })
                                .populate('postedBy', 'email');

        
        if(!ticket){
            throw "Ticket doesn't exist!";
        }

        console.log(ticket);
        console.log(req.body);

        if(req.body.message){
            // const email = ticket.postedBy.email;
            // const email = 'jatinranka123@gmail.com';
            // const mailInfo = await Services.EmailService.sendMail(to=email, "Re: Ticket Update", req.body.message);
        }

        ticket.status = req.body.status;

        ticket.save()
            .then((ticket) => {
                res.status(200).send(ticket)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(err);        
            })
         
    } catch (err) {
        console.log(err);
        res.status(500).send(err);    
    } 

});


router.get('/stats', collegeAuth, async (req, res) => {

    try {
        var stats = await Services.StatsService.fetchCollegeStats(req.college._id);
        res.send(stats)    
    } catch (err) {
        console.log(err);
        res.status(400).send(err)
    }
    
});

router.post('/notices', collegeAuth, (req, res) => {

    const { title, subTitle, expireAt } = req.body;

    const notice = new Notice({
        postedBy: req.college._id,
        onModel: 'College',
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

router.get('/notices', collegeAuth, (req, res) => {

    Notice
        .find({
            $or: [
                { postedBy: req.college._id },
                { postedBy: req.college.adminId }
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

router.post('/faculty', collegeAuth, (req, res) => {
    const { email } = req.body;
    // const password = Math.random().toString(36).substring(2, 15) // This will generate random password.
    const password = 'pwd123';

    const faculty = new Faculty({
        email,
        password,
        collegeId: req.college._id
    });

    faculty.save()
        .then((faculty) => {
            res.status(200).send(faculty)
            // Services.EmailService.sendMail([email], 'new registration', `Password : ${password}`);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
})


module.exports = router;