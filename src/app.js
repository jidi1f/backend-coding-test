const redoc = require('redoc-express');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./util/logger');
const ExtendedError = require('./util/customError');

const app = express();

const jsonParser = bodyParser.json();

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    app.get('/swagger.yaml', (req, res) => {
        try {
            res.sendFile('swagger.yaml', { root: '.' });
        } catch (error) {
            logger.error(error);
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });

    app.get('/ride.yaml', (req, res) => {
        try {
            res.sendFile('ride.yaml', { root: './docs' });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });

    app.get('/utils.yaml', (req, res) => {
        try {
            res.sendFile('utils.yaml', { root: './docs' });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                statusMessage: 'InternalServiceError',
                message: 'Something went wrong',
            });
        }
    });

    app.get(
        '/api-docs',
        redoc({
            title: 'API Docs',
            specUrl: '/swagger.yaml',
        }),
    );

    app.post('/rides', jsonParser, (req, res) => {
        try {
            const startLatitude = Number(req.body.start_lat);
            const startLongitude = Number(req.body.start_long);
            const endLatitude = Number(req.body.end_lat);
            const endLongitude = Number(req.body.end_long);
            const riderName = req.body.rider_name;
            const driverName = req.body.driver_name;
            const driverVehicle = req.body.driver_vehicle;

            if (
                startLatitude < -90 ||
                startLatitude > 90 ||
                startLongitude < -180 ||
                startLongitude > 180
            ) {
                throw new ExtendedError(
                    'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                    'VALIDATION_ERROR',
                );
            }

            if (
                endLatitude < -90 ||
                endLatitude > 90 ||
                endLongitude < -180 ||
                endLongitude > 180
            ) {
                throw new ExtendedError(
                    'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                    'VALIDATION_ERROR',
                );
            }

            if (typeof riderName !== 'string' || riderName.length < 1) {
                throw new ExtendedError(
                    'Rider name must be a non empty string',
                    'VALIDATION_ERROR',
                );
            }

            if (typeof driverName !== 'string' || driverName.length < 1) {
                throw new ExtendedError(
                    'Driver name must be a non empty string',
                    'VALIDATION_ERROR',
                );
            }

            if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
                throw new ExtendedError(
                    'Driver vehicle name must be a non empty string',
                    'VALIDATION_ERROR',
                );
            }
            const values = [
                req.body.start_lat,
                req.body.start_long,
                req.body.end_lat,
                req.body.end_long,
                req.body.rider_name,
                req.body.driver_name,
                req.body.driver_vehicle,
            ];

            return db.run(
                'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
                values,
                function callback(err) {
                    if (err) {
                        logger.error({ message: err.message, code: err.code });
                        return res.send({
                            error_code: 'SERVER_ERROR',
                            message: 'Unknown error',
                        });
                    }

                    return db.all(
                        'SELECT * FROM Rides WHERE rideID = ?',
                        this.lastID,
                        (error, rows) => {
                            if (error) {
                                logger.error({
                                    message: error.message,
                                    code: error.code,
                                });
                                return res.send({
                                    error_code: 'SERVER_ERROR',
                                    message: 'Unknown error',
                                });
                            }
                            logger.info(
                                `ride with ${this.lastID} was successfully created`,
                            );
                            return res.json(rows[0]);
                        },
                    );
                },
            );
        } catch (err) {
            logger.error({ message: err.message, code: err.code });
            return res.send({
                message: err.message,
                error_code: err.code,
            });
        }
    });

    app.get('/rides', (req, res) => {
        let { offset, limit } = req.query;

        const getPagedResponse = (err, total, pagedRows) => {
            if (limit === undefined && offset === undefined) {
                offset = 1;
                limit = total;
            }

            if (err) {
                logger.error({ message: err.message, code: err.code });
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error',
                });
            }

            const pagesTotal = Math.ceil(total / limit);

            return res.json({
                pagesTotal,
                pagedRows,
                currentPage: offset,
            });
        };

        db.all(
            'SELECT * FROM Rides limit ? offset ?',
            [
                limit ? Number(limit) : -1,
                offset && limit ? (Number(offset) - 1) * Number(limit) : 0,
            ],
            (err, rows) => {
                if (err) {
                    logger.error({ message: err.message, code: err.code });
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    });
                }
                if (rows.length === 0) {
                    logger.error({
                        message: 'Could not find any rides',
                        code: 'NOT_FOUND_ERROR',
                    });
                    return res.send({
                        error_code: 'NOT_FOUND_ERROR',
                        message: 'Could not find any rides',
                    });
                }

                return db.get(
                    'SELECT COUNT(*) as total FROM Rides',
                    [],
                    (error, result) => {
                        getPagedResponse(error, result.total, rows);
                    },
                );
            },
        );
    });

    app.get('/rides/:id', (req, res) =>
        db.all(
            `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
            (err, rows) => {
                if (err) {
                    logger.error({ message: err.message, code: err.code });
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    });
                }

                if (rows.length === 0) {
                    logger.error({
                        message: 'Could not find any rides',
                        code: 'NOT_FOUND_ERROR',
                    });
                    return res.send({
                        error_code: 'NOT_FOUND_ERROR',
                        message: 'Could not find any rides',
                    });
                }
                logger.info(
                    `ride with ${req.params.id} was successfully found`,
                );
                return res.json(rows[0]);
            },
        ),
    );

    return app;
};
