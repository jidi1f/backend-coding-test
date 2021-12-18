const sqlite3 = require('sqlite3').verbose();
const app = require('./src/app');
const logger = require('./src/util/logger');

const port = 8010;

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

try {
    db.serialize(() => {
        buildSchemas(db);

        const App = app(db);

        App.listen(port, () =>
            logger.info(
                `App started and listening on port ${port}, see doc - /api-docs`,
            ),
        );
    });
} catch (err) {
    logger.error(err);
}
