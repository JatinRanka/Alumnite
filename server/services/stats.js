const models = require('./../models');

class StatsService{
    static async fetchCollegeStats(collegeId){    
        var promises = [];

        //past events
        promises.push(models.Event.countDocuments( {organiserId: collegeId, date: { $lte : new Date()}} )  );

        // upcoming events
        promises.push(models.Event.countDocuments( {organiserId: collegeId, date: { $gte : new Date()}} )   );

        // jobs posted
        promises.push(models.Job
                        .find({collegeId})
                        .sort({createdAt: 1})
                        .select("createdAt -_id")
                    );

        // interviews posted
        promises.push(models.Interview
                                .find({collegeId})
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // alumni registered
        promises.push(models.Alumni
                                .find({collegeId})
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // tickets 
        promises.push(models.Ticket
                        .aggregate([
                            {$match: { collegeId } },
                            {
                                $group: {
                                    _id: '$status',
                                    count: {$sum: 1}
                                }
                            }
                        ])
            );

        // student count
        promises.push(models.Student.countDocuments({collegeId}));


        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then( ( [pastEvents, upcomingEvents, jobs, interviews, alumni, tickets, studentsCount] ) => {

                    // To convert array of documents to array of Date Strings.
                    jobs = jobs.map( job => new Date( job["createdAt"]).toDateString() );

                    interviews = interviews.map( interview => new Date( interview["createdAt"]).toDateString() );
                    
                    alumni = alumni.map( element => new Date( element["createdAt"]).toDateString() );

                    var stats = {
                        pastEvents, upcomingEvents, jobs, interviews, alumni, tickets, studentsCount
                    }
                    resolve(stats);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    }

    static async fetchAdminStats(){    
        var promises = [];

        //past events
        promises.push(models.Event.countDocuments( {date: { $lte : new Date()}} )  );

        // upcoming events
        promises.push(models.Event.countDocuments( {date: { $gte : new Date()}} )   );

        // jobs posted
        promises.push(models.Job
                        .find()
                        .sort({createdAt: 1})
                        .select("createdAt -_id")
                    );

        // interviews posted
        promises.push(models.Interview
                                .find()
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // alumni registered
        promises.push(models.Alumni
                                .find()
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // tickets 
        promises.push(models.Ticket
                                .aggregate([
                                    {
                                        $group: {
                                            _id: '$status',
                                            count: {$sum: 1}
                                        }
                        
                                    }
                                ])
        );

    // student count
    promises.push(models.Student.countDocuments());


        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then( ( [pastEvents, upcomingEvents, jobs, interviews, alumni, tickets, studentsCount] ) => {

                    // To convert array of documents to array of Date Strings.
                    jobs = jobs.map( job => new Date( job["createdAt"]).toDateString() );

                    interviews = interviews.map( interview => new Date( interview["createdAt"]).toDateString() );
                    
                    alumni = alumni.map( element => new Date( element["createdAt"]).toDateString() );

                    var stats = {
                        pastEvents, upcomingEvents, jobs, interviews, alumni, tickets, studentsCount
                    }
                    resolve(stats);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    }

}

module.exports = StatsService;