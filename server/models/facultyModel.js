const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        collegeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true
        }
    },
    { timestamps: true }
);

const Faculty = mongoose.model('Faculty', FacultySchema);
module.exports = { Faculty };