const { assert } = require('chai');
const supertest = require('supertest');
const buidShemas = require('../../src/models');
const rideData = require('../testData');

module.exports = function (server, db) {
    return describe('API tests', async () => {
        beforeEach(async () => {
            await buidShemas(db);
        });

        afterEach(async () => {
            await db.run('DROP TABLE IF EXISTS Rides');
        });

        describe('POST /rides', () => {
            it('should save and return created ride', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200, done);
            });
            it('should return validation error', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.badValidateRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.equal(
                            res.body.details.riderName[0],
                            rideData.validationError.details.riderName[0],
                        );
                        assert.equal(
                            res.body.statusCode,
                            rideData.validationError.statusCode,
                        );
                    })
                    .expect(422, done);
            });
            it('should return server error', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.badCompiledRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(res.body, rideData.serverError);
                    })
                    .expect(500, done);
            });
        });

        describe('GET /rides', () => {
            it('should save ride and return all rides', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200)
                    .end(() => {
                        supertest(server)
                            .get('/rides')
                            .expect(
                                'Content-Type',
                                'application/json; charset=utf-8',
                            )
                            .expect((res) => {
                                assert.include(
                                    res.body.rides[0],
                                    rideData.successRideDataResponse,
                                );
                                assert.equal(res.body.pagesTotal, 1);
                                assert.equal(res.body.currentPage, 1);
                            })
                            .expect(200, done);
                    });
            });
            it('Should return page of rides', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200)
                    .end(() => {
                        supertest(server)
                            .get('/rides/?offset=1&limit=4')
                            .expect(
                                'Content-Type',
                                'application/json; charset=utf-8',
                            )
                            .expect((res) => {
                                assert.include(
                                    res.body.rides[0],
                                    rideData.successRideDataResponse,
                                );
                                assert.equal(res.body.pagesTotal, 1);
                                assert.equal(res.body.currentPage, 1);
                            })
                            .expect(200, done);
                    });
            });
        });

        describe('GET /rides/:id', () => {
            it('should save ride and return all rides', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200)
                    .end(() => {
                        supertest(server)
                            .get('/rides/1')
                            .expect(
                                'Content-Type',
                                'application/json; charset=utf-8',
                            )
                            .expect((res) => {
                                assert.include(
                                    res.body,
                                    rideData.successRideDataResponse,
                                );
                            })
                            .expect(200, done);
                    });
            });
            it('should return not found response', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200)
                    .end(() => {
                        supertest(server)
                            .get('/rides/2')
                            .expect(
                                'Content-Type',
                                'application/json; charset=utf-8',
                            )
                            .expect((res) => {
                                assert.include(
                                    res.body,
                                    rideData.notFoundResponse,
                                );
                            })
                            .expect(404, done);
                    });
            });
            it('should be not vulnerable to sql injection', (done) => {
                supertest(server)
                    .post('/rides')
                    .send({ ...rideData.successRideData })
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .expect((res) => {
                        assert.include(
                            res.body,
                            rideData.successRideDataResponse,
                        );
                    })
                    .expect(200)
                    .end(() => {
                        supertest(server)
                            .get('/rides/1; DROP TABLE  Rides; --')
                            .expect(
                                'Content-Type',
                                'application/json; charset=utf-8',
                            )
                            .expect((res) => {
                                assert.include(
                                    res.body,
                                    rideData.notFoundResponse,
                                );
                            })
                            .expect(404, done);
                    });
            });
        });
    });
};
