const startApp = require('./src/app');
const logger = require('./src/util/logger');

try {
    (async function () {
        await startApp();
    })();
} catch (err) {
    logger.error(err);
}
