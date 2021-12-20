const RideModel = require('../models/Ride');
const logger = require('../util/logger');

const rideService = (db) => {
    const Ride = RideModel(db);
    return {
        async createRide(rideData) {
            const newRide = await Ride.create(rideData);
            logger.info(`ride with ${newRide.rideID} was successfully created`);

            return newRide;
        },
        async getRides(limit, offset) {
            const paginatedRides = await Ride.findAll(limit, offset);

            return paginatedRides;
        },
        async getRide(id) {
            const ride = await Ride.findById(id);

            return ride;
        },

        validateRide(ride) {
            const details = {};

            if (
                ride.startLatitude < -90 ||
                ride.startLatitude > 90 ||
                ride.startLongitude < -180 ||
                ride.startLongitude > 180
            ) {
                details.startL = [];
                details.startL.push(
                    'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                );
            }

            if (
                ride.endLatitude < -90 ||
                ride.endLatitude > 90 ||
                ride.endLongitude < -180 ||
                ride.endLongitude > 180
            ) {
                details.endL = [];
                details.endL.push(
                    'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                );
            }

            if (
                typeof ride.riderName !== 'string' ||
                ride.riderName.length < 1
            ) {
                details.riderName = [];
                details.riderName.push('Rider name must be a non empty string');
            }

            if (
                typeof ride.driverName !== 'string' ||
                ride.driverName.length < 1
            ) {
                details.driverName = [];
                details.driverName.push(
                    'Driver name must be a non empty string',
                );
            }

            if (
                typeof ride.driverVehicle !== 'string' ||
                ride.driverVehicle.length < 1
            ) {
                details.driverVehicle = [];
                details.driverVehicle.push(
                    'Driver vehicle must be a non empty string',
                );
            }

            if (Object.values(details).length > 0) {
                return {
                    code: 'Ride Validation Error',
                    details,
                };
            }
            return ride;
        },
    };
};

module.exports = rideService;
