const mongoose = require('mongoose');

const NewsLetterSchema = new mongoose.Schema({
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College'
    },
    name: {
        type: String
    },
    storing:{
        data: Buffer,
        contentType: String
    }
});

const NewsLetter = mongoose.model('NewsLetter', NewsLetterSchema);
module.exports = {NewsLetter}