const supertest = require('supertest');

module.exports = function (server) {
    return describe('API tests', async () => {
        describe('GET /health', async () => {
            it('should return health', (done) => {
                supertest(server)
                    .get('/health')
                    .expect('Content-Type', /text/)
                    .expect(200, done);
            });
        });
    });
};
