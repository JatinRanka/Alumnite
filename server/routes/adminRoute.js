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
    ChatMessage
} = require('./../models');
// MiddleWare
const {adminAuth} = require('./../middleware/adminAuth.js')


router.post('/test', (req, res) => {
    var arr = [
        {
            "email": "college1@gmail.com",
            "password": "pwd123",
            collegeName: 'college1',
            adminId: "5e8c46bca49607e8acf58c46"
        },
        {
            email: "college2@gmail.com",
            password: "pwd123",
            collegeName: 'college2',
            adminId: "5e8c46bca49607e8acf58c46"
        },
        {
            email: "college3@gmail.com",
            password: "pwd123",
            collegeName: 'college3',
            adminId: "5e8c46bca49607e8acf58c46"
        }
    ];

    College.insertMany(arr, {ordered: false})
        .then((result) => {
            console.log(result);
            res.send("done")
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })


})


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
                    res.status(200).header('x-auth', token).send({message: 'Login success'});
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
router.get('/users', adminAuth, (req, res) => {
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
})


module.exports = router;

