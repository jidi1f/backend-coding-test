const apiTest = require('./controller/api.test');
const utilTest = require('./controller/util.test');
const docTest = require('./controller/docApi.test');
const riderServiceTest = require('./service/rideService.test');
const startApp = require('../src/app');

let server;
let db;

(async () => {
    ({ server, db } = await startApp());
    utilTest(server);
    docTest(server);
    riderServiceTest(db);
    apiTest(server, db);

    run();
})();
