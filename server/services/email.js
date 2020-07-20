const models = require('./../models');
const nodemailer = require("nodemailer");

class EmailService{
    static async fetchUsers (collegeId, query) {
        const params = {};   

        /* format for params which is to be passed while fetching from DB
        params = {
            location.city : {$in: xyz},
            location.country: {$in: xyz},
            ...
            ...
        }
        */
        console.log(query);
        for(let key in query){
            if (query[key]){
                params[key] = {$in: query[key]}
            }
        };

        if (collegeId){
            params["collegeId"] = collegeId;
        }

        console.log(params);

        return models.Alumni
            .find(params)
            .collation({ locale: 'en', strength: 2 }) // collation makes search case insensitive
            .select('email -_id')
            .lean()
            .then((alumnis) => {
                alumnis.forEach((alumniObj, index) => {
                    alumnis[index] = alumniObj.email;
                });
                return Promise.resolve(alumnis)
            })
            .catch((err) => {
                return Promise.reject(err)
            });
    }


    static async sendMail(to, subject, message){
        console.log("in mail", to);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'jatinranka00@gmail.com',
                pass: process.env["EmailPassword"]
            }
        });

        to = to.toString() // To convert array of emails to str (Eg: ['1@mail.com', '2@mail.com'] => '1@mail.com, 2@mail.com')
        
        const mailOptions = {
            from: 'jatinranka00@gmail.com',
            to,
            subject,
            html: message
        };
        
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (err, info) {
                console.log(err);
                if(err){
                    return reject(err);
                } else{
                    return resolve(info);
                }
            });
        })
        
    }
}

module.exports = EmailService;
