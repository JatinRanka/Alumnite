const {Admin} = require('./adminModel.js')
const {College} = require('./collegeModel');
const {Alumni} = require('./alumniModel.js')
const {Student} = require('./studentModel');

const {Event} = require('./eventModel.js')
const {NewsLetter} = require('./newsletterModel.js');
const {Job} = require('./jobModel');
const {Interview} = require('./interviewModel');
const {Ticket} = require('./ticketModel');
const { Fund } = require('./fundModel');

module.exports = {
    Admin,
    College,
    Alumni,
    Student,
    Event,
    NewsLetter,
    Job,
    Interview,
    Ticket,
    Fund
}