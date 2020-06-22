const mongoose = require('mongoose');

const NewsLetterSchema = new mongoose.Schema(
    {
        postedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College'
        },
        name: {
            type: String
        },
        data: {
            type: Buffer
        },
        contentType:{
            type: String
        }
    },
    {timestamps: true}
);

const NewsLetter = mongoose.model('NewsLetter', NewsLetterSchema);
module.exports = {NewsLetter} 