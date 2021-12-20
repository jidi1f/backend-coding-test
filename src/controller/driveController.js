const express = require('express');
const setupRideService = require('../service/rideService');
const logger = require('../util/logger');

module.exports = (db) => {
    const DriveController = express.Router({ mergeParams: true });
    const rideService = setupRideService(db);

    DriveController.post('/', async (req, res) => {
        const ride = {
            startLatitude: Number(req.body.start_lat),
            startLongitude: Number(req.body.start_long),
            endLatitude: Number(req.body.end_lat),
            endLongitude: Number(req.body.end_long),
            riderName: req.body.rider_name,
            driverName: req.body.driver_name,
            driverVehicle: req.body.driver_vehicle,
        };
        const rideData = Object.values(ride);
        try {
            let response = rideService.validateRide(ride);
            if (response.code) {
                return res.status(422).json({
                    statusCode: response.code,
                    details: response.details,
                });
            }

            response = await rideService.createRide(rideData);
            response = await rideService.getRide(response.lastID);

            res.json(response);
        } catch (err) {
            logger.error({ message: err.message, code: err.code });
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });

    DriveController.get('/', async (req, res) => {
        try {
            const { offset, limit } = req.query;

            const response = await rideService.getRides(limit, offset);

            if (response.rides.length === 0) {
                logger.error({
                    message: 'Could not find any rides',
                    code: 'NOT_FOUND_ERROR',
                });
                return res.send({
                    error_code: 'NOT_FOUND_ERROR',
                    message: 'Could not find any rides',
                });
            }

            res.json(response);
        } catch (err) {
            logger.error({ message: err.message, code: err.code });
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });
    DriveController.get('/:id', async (req, res) => {
        try {
            const rideId = Number(req.params.id);
            const foundRide = await rideService.getRide(rideId);

            if (!foundRide) {
                logger.error({
                    message: 'Could not find any rides',
                    code: 'NOT_FOUND_ERROR',
                });
                return res.status(404).json({
                    statusCode: 404,
                    statusMessage: '404 Not found',
                    message: 'No such ride found',
                });
            }
            logger.info(
                `ride with ${foundRide.riderID} was successfully found`,
            );

            res.json(foundRide);
        } catch (err) {
            logger.error({ message: err.message, code: err.code });
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });

    return DriveController;
};
