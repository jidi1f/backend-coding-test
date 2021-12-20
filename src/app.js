const express = require('express');
const helmet = require('helmet');
const logger = require('./util/logger');
const openDb = require('./util/db');
const buildSchemas = require('./models');
const DriveController = require('./controller/driveController');
const DocumentationController = require('./controller/documentationController');
const UtilController = require('./controller/utilController');

const app = express();
const port = 8010;

app.use(express.json());
app.use(helmet());

const startApp = async () => {
    const db = await openDb();

    await buildSchemas(db);

    app.use('/health', UtilController);
    app.use('/rides', DriveController(db));
    app.use('/api-docs', DocumentationController);

    app.listen(port, () =>
        logger.info(
            `App started and listening on port ${port}, see doc - /api-docs`,
        ),
    );

    return {
        server: app,
        db,
    };
};

module.exports = startApp;
