const { assert } = require('chai');
const buidShemas = require('../../src/models');
const rideService = require('../../src/service/rideService');
const rideData = require('../testData');

module.exports = function (db) {
    const service = rideService(db);
    const rideDataArray = Object.values(rideData.successRideData);

    return describe('Ride service tests', () => {
        beforeEach(async () => {
            await buidShemas(db);
        });

        afterEach(async () => {
            await db.run('DROP TABLE IF EXISTS Rides');
        });

        describe('Create rides test', () => {
            it('Insert should return lastID and changes', async () => {
                const { lastID, changes } = await service.createRide(
                    rideDataArray,
                );
                assert.equal(lastID, 1);
                assert.equal(changes, 1);
            });

            it('Service should retrieve several requests', async () => {
                let { lastID, changes } = await service.createRide(
                    rideDataArray,
                );
                assert.equal(lastID, 1);
                assert.equal(changes, 1);

                ({ lastID, changes } = await service.createRide(rideDataArray));
                assert.equal(lastID, 2);
                assert.equal(changes, 1);
            });
        });

        describe('Get ride test', () => {
            it('Get should return ride', async () => {
                const { lastID, changes } = await service.createRide(
                    rideDataArray,
                );
                assert.equal(lastID, 1);
                assert.equal(changes, 1);

                const response = await service.getRide(lastID);
                assert.include(response, rideData.successRideDataResponse);
            });
        });

        describe('Get all rides test', () => {
            it('Get should return all rides', async () => {
                let { lastID, changes } = await service.createRide(
                    rideDataArray,
                );
                assert.equal(lastID, 1);
                assert.equal(changes, 1);

                ({ lastID, changes } = await service.createRide(rideDataArray));
                assert.equal(lastID, 2);
                assert.equal(changes, 1);

                const pagedRides = await service.getRides();

                assert.include(
                    pagedRides.rides[0],
                    rideData.successRideDataResponse,
                );
                assert.include(
                    pagedRides.rides[1],
                    rideData.successRideDataResponse_2,
                );
            });
        });
    });
};
