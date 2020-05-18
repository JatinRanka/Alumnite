const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config()

const PORT = process.env.PORT || 4000;


app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());


//process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI , {useNewUrlParser : true, autoIndex: true});
const connection = mongoose.connection;


const router = require('./server/routes');
app.use('/', router);


// var fs = require('fs');
// var Grid = require('gridfs-stream');
// Grid.mongo = mongoose.mongo;




connection.once('open', function(){
    console.log("MongoDB connection established successfully.");

    // var gfs = Grid(connection.db);
    // app.post('/upload', function(req, res) {
    //     var writeStream = gfs.createWriteStream({filename: 'abcfile'});
    //     fs.createReadStream('./JatinResume.pdf')
    //         .pipe(writeStream);
    //     writeStream.on('close', function(file){
    //         res.send("success");
    //     })
    // })

    // app.get('/file', function(req, res) {
    //     gfs.exist({filename: 'abcfile'}, function(err, file){
    //         if (err || !file) {
    //             res.send("file not found")
    //         }
    //         var readStream = gfs.createReadStream({filename: 'abcfile'});
    //         readStream.pipe(res)
    //     })
    // })

})

app.listen(PORT, function(){
    console.log("Server is running on port : ", PORT );
});

module.exports = app;