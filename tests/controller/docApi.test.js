const supertest = require('supertest');

module.exports = function (server) {
    return describe('DOCS-API tests', () => {
        describe('GET /api-docs', () => {
            it('should return rendered html', (done) => {
                supertest(server)
                    .get('/api-docs')
                    .expect('Content-Type', 'text/html; charset=utf-8')
                    .expect(200, done);
            });
        });

        describe('GET /api-docs/swagger.yaml', () => {
            it('should return swagger.yaml file', (done) => {
                supertest(server)
                    .get('/api-docs/swagger.yaml')
                    .expect('Content-Type', 'text/yaml; charset=UTF-8')
                    .expect(200, done);
            });
            it('should return ride.yaml file', (done) => {
                supertest(server)
                    .get('/api-docs/swagger.yaml')
                    .expect('Content-Type', 'text/yaml; charset=UTF-8')
                    .expect(200, done);
            });
            it('should return utils.yaml file', (done) => {
                supertest(server)
                    .get('/api-docs/swagger.yaml')
                    .expect('Content-Type', 'text/yaml; charset=UTF-8')
                    .expect(200, done);
            });
        });
    });
};
