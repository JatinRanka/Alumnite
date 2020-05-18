const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('./../app.js');
let expect = chai.expect;

chai.use(chaiHttp);

describe('Alumni routes', () => {
    var token;

    /*
        This will fetch access-token by logging in. 
        This function will occur only before the 
        test begins. 
    */
    before((done) => {
        chai    
            .request(server)
            .post('/alumni/login')
            .send({
                email: "josh3anchaliya16@gmail.com",
                password: "password"
            })
            .end((err, res) => {
                token = res.headers['x-auth'];
                done();
            }); 
    });


    /* 
        This function will logout.
        It will be called after all the test
        cases have been processed.
    */
    after((done) => {
        chai
            .request(server)
            .delete('/alumni/logout')
            .set('x-auth', token)
            .end((err, res) => {
                done();
            });
    });


    describe("#Interview", () => {

        /*
            this will test a protected route without passing
            an access token.
        */
        it('Should throw status 400 when fetching interviews -without token', (done) => {
            chai
                .request(server)
                .get('/alumni/interviews')
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });



        it('Should fetch all the interviews -with token', (done) => {
            chai
                .request(server)
                .get('/alumni/interviews')
                .set('x-auth', token)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('array');
                    done();
                });
        });
    });

    
    describe("Event", () => {

        /**
            This will test by getting an particular
            event by passing the event Id. 
        */

        var id = "5e9886963047a36120f3f709";
        it("Should get a particular event when id is provided", (done) => {
            chai    
                .request(server)
                .get(`/alumni/events/${id}`)
                .set('x-auth', token)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body.event).to.have.property('location')
                    done();
                })
        })
    });

})



