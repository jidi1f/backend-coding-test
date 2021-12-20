const RideModel = (db) => {
    const database = db;
    return {
        async create(rideData) {
            const newRide = await database.run(
                'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
                rideData,
            );

            return newRide;
        },
        async findAll(limit, offset) {
            const pagedRides = await database.all(
                'SELECT * FROM Rides limit ? offset ?',
                [
                    limit ? Number(limit) : -1,
                    offset && limit ? (Number(offset) - 1) * Number(limit) : 0,
                ],
            );
            if (limit === undefined && offset === undefined) {
                return {
                    pagesTotal: 1,
                    rides: pagedRides,
                    currentPage: 1,
                };
            }

            const { total } = await database.get(
                'SELECT COUNT(*) as total FROM Rides',
            );

            const pagesTotal = Math.ceil(total / limit);

            return {
                pagesTotal,
                rides: pagedRides,
                currentPage: offset,
            };
        },
        async findById(id) {
            const ride = await database.get(
                'SELECT * FROM Rides WHERE rideID=?',
                [id],
            );

            return ride;
        },
    };
};

module.exports = RideModel;
