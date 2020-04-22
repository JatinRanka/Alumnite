const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config()

const PORT = process.env.PORT || 4000;


app.use(bodyParser.json());
app.use(cors());

//process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI , {useNewUrlParser : true, autoIndex: true});
const connection = mongoose.connection;

const router = require('./server/routes');
app.use('/', router);


connection.once('open', function(){
    console.log("MongoDB connection established successfully.");
})

app.listen(PORT, function(){
    console.log("Server is running on port : ", PORT );
})