const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
    {
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'onModel',
            required: true
        },
        onModel: {
            type: String,
            required: true,
            enum: ['Admin', 'College']
        },
        title: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            required: true
        },
        expireAt: {
            type: Date,
            default: undefined
        }
    },
    { timestamps: true }
);

NoticeSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } );
const Notice = mongoose.model('Notice', NoticeSchema);
module.exports = { Notice };

