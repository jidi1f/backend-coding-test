const { assert } = require('chai');
const sqlite3 = require('sqlite3').verbose();
const supertest = require('supertest');

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

const successRideData = {
    start_lat: 80,
    start_long: 100,
    end_lat: -40,
    end_long: -140,
    rider_name: 'John',
    driver_name: 'Danil',
    driver_vehicle: 'M2',
};

const successRideDataResponse = {
    rideID: 1,
    startLat: 80,
    startLong: 100,
    endLat: -40,
    endLong: -140,
    riderName: 'John',
    driverName: 'Danil',
    driverVehicle: 'M2',
};

const badValidateRideData = {
    start_lat: 80,
    start_long: 100,
    end_lat: -40,
    end_long: -140,
    rider_name: '',
    driver_name: '',
    driver_vehicle: '',
};

const badCompiledRideData = {
    start_long: 100,
    end_lat: -40,
    end_long: -140,
    rider_name: 'John',
    driver_name: 'Danil',
    driver_vehicle: 'M2',
};

const validationError = {
    error_code: 'VALIDATION_ERROR',
    message: 'Rider name must be a non empty string',
};

const serverError = {
    error_code: 'SERVER_ERROR',
    message: 'Unknown error',
};

const notFoundResponse = {
    error_code: 'NOT_FOUND_ERROR',
    message: 'Could not find any rides',
};

describe('API tests', () => {
    beforeEach((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            return done();
        });
    });

    afterEach((done) => {
        db.run('DROP TABLE IF EXISTS rides', (err) => {
            if (err) {
                return done(err);
            }
            return done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            supertest(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        it('should save and return created ride', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...successRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, {
                        ...successRideDataResponse,
                    });
                })
                .expect(200, done);
        });
        it('should return validation error', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...badValidateRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, { ...validationError });
                })
                .expect(200, done);
        });
        it('should return server error', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...badCompiledRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, { ...serverError });
                })
                .expect(200, done);
        });
    });

    describe('GET /rides', () => {
        it('should save ride and return all rides', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...successRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, {
                        ...successRideDataResponse,
                    });
                })
                .expect(200)
                .end(() => {
                    supertest(app)
                        .get('/rides')
                        .expect(
                            'Content-Type',
                            'application/json; charset=utf-8',
                        )
                        .expect((res) => {
                            assert.include(res.body[0], {
                                ...successRideDataResponse,
                            });
                        })
                        .expect(200, done);
                });
        });
    });

    describe('GET /rides/:id', () => {
        it('should save ride and return all rides', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...successRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, {
                        ...successRideDataResponse,
                    });
                })
                .expect(200)
                .end(() => {
                    supertest(app)
                        .get('/rides/1')
                        .expect(
                            'Content-Type',
                            'application/json; charset=utf-8',
                        )
                        .expect((res) => {
                            assert.include(res.body, {
                                ...successRideDataResponse,
                            });
                        })
                        .expect(200, done);
                });
        });
        it('should return not found response', (done) => {
            supertest(app)
                .post('/rides')
                .send({ ...successRideData })
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    assert.include(res.body, {
                        ...successRideDataResponse,
                    });
                })
                .expect(200)
                .end(() => {
                    supertest(app)
                        .get('/rides/2')
                        .expect(
                            'Content-Type',
                            'application/json; charset=utf-8',
                        )
                        .expect((res) => {
                            assert.include(res.body, { ...notFoundResponse });
                        })
                        .expect(200, done);
                });
        });
    });
});

describe('DOCS-API tests', () => {
    describe('GET /api-docs', () => {
        it('should return rendered html', (done) => {
            supertest(app)
                .get('/api-docs')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200, done);
        });
    });
    describe('GET /swagger.yaml', () => {
        it('should return swagger.yaml file', (done) => {
            supertest(app)
                .get('/swagger.yaml')
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
                .expect(200, done);
        });
        it('should return ride.yaml file', (done) => {
            supertest(app)
                .get('/ride.yaml')
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
                .expect(200, done);
        });
        it('should return utils.yaml file', (done) => {
            supertest(app)
                .get('/utils.yaml')
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
                .expect(200, done);
        });
    });
});
