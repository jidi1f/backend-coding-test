const testData = {
    successRideData: {
        start_lat: 80,
        start_long: 100,
        end_lat: -40,
        end_long: -140,
        rider_name: 'John',
        driver_name: 'Danil',
        driver_vehicle: 'M2',
    },

    successRideDataResponse: {
        rideID: 1,
        startLat: 80,
        startLong: 100,
        endLat: -40,
        endLong: -140,
        riderName: 'John',
        driverName: 'Danil',
        driverVehicle: 'M2',
    },

    successRideDataResponse_2: {
        rideID: 2,
        startLat: 80,
        startLong: 100,
        endLat: -40,
        endLong: -140,
        riderName: 'John',
        driverName: 'Danil',
        driverVehicle: 'M2',
    },

    badValidateRideData: {
        start_lat: 80,
        start_long: 100,
        end_lat: -40,
        end_long: -140,
        rider_name: '',
        driver_name: 'Danil',
        driver_vehicle: 'M2',
    },

    badCompiledRideData: {
        start_long: 100,
        end_lat: -40,
        end_long: -140,
        rider_name: 'John',
        driver_name: 'Danil',
        driver_vehicle: 'M2',
    },

    validationError: {
        statusCode: 'Ride Validation Error',
        details: {
            riderName: ['Rider name must be a non empty string'],
        },
    },

    serverError: {
        statusCode: 500,
        statusMessage: 'InternalServiceError',
        message: 'Something went wrong',
    },

    notFoundResponse: {
        statusCode: 404,
        statusMessage: '404 Not found',
        message: 'No such ride found',
    },
};

module.exports = testData;
