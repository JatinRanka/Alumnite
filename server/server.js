const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 4000;


// Routes
const adminRoute = require('./routes/adminRoute');
const collegeRoute = require('./routes/collegeRoute');
const studentRoute = require('./routes/StudentRoutes/studentRoute');


app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/AlumniTrackingSystem', {useNewUrlParser : true, autoIndex: true});
const connection = mongoose.connection;

app.get('/', (req, res) => {
    console.log("hello world");
    res.send("Server is up and running.")
})

app.use('/admin', adminRoute);
app.use('/college', collegeRoute);
app.use('/student', studentRoute);



connection.once('open', function(){
    console.log("MongoDB connection established successfully.");
})

app.listen(PORT, function(){
    console.log("Server is running on port : ", PORT );
})