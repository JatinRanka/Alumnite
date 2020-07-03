const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require('./server/routes');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use('/', router);


mongoose.connect(
    process.env.MONGODB_URI, 
    {
        useNewUrlParser : true,
        autoIndex: true
    }
);

const connection = mongoose.connection;
connection.once('open', function(){
    console.log("MongoDB connection established successfully.");
})

const server = app.listen(PORT, function(){
    console.log("Server is running on port : ", PORT );
});

var sockets = require('./server/chat')
sockets.init(server);

// const io = require('socket.io').listen(server);
// // Assign socket object to every request
// app.use(function(req, res, next) {
//     req.io = io;
//     next();
// });


module.exports = app;