const express = require('express');
const router = express.Router();

const alumniRoute = require('./AlumniRoute/AlumniRoute.js');
const studentRoute = require('./StudentRoutes/studentRoute.js');
const collegeRoute = require('./collegeRoute.js');
const adminRoute = require('./adminRoute.js');
const facultyRoute = require('./facultyRoute');

router.get('/', (req, res) => {
    console.log("Server is up and running.");
    res.send("Server is up and running.");
})

router.use('/admin', adminRoute);
router.use('/college', collegeRoute);
router.use('/student', studentRoute);
router.use('/alumni', alumniRoute)
router.use('/faculty', facultyRoute);


module.exports = router;