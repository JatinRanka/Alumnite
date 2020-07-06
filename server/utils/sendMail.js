const nodemailer = require("nodemailer");

module.exports = async function sendMail(to, subject, message, callback){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jatinranka00@gmail.com',
            pass: process.env["EmailPassword"]
        }
    });

    const mailOptions = {
        from: 'jatinranka00@gmail.com',
        to,
        subject,
        html: message
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            callback(err);
        else
            callback(null, info);
    });
}