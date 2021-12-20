const express = require('express');
const redoc = require('redoc-express');
const logger = require('../util/logger');

const DocumentationController = express.Router({ mergeParams: true });

DocumentationController.get('/swagger.yaml', (req, res) => {
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

DocumentationController.get('/ride.yaml', (req, res) => {
    try {
        res.sendFile('ride.yaml', { root: './docs' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            statusCode: 500,
            statusMessage: 'InternalServiceError',
            message: 'Something went wrong',
        });
    }
});

DocumentationController.get('/utils.yaml', (req, res) => {
    try {
        res.sendFile('utils.yaml', { root: './docs' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            statusCode: 500,
            statusMessage: 'InternalServiceError',
            message: 'Something went wrong',
        });
    }
});

DocumentationController.get(
    '/',
    redoc({
        title: 'API Docs',
        specUrl: '/api-docs/swagger.yaml',
    }),
);

module.exports = DocumentationController;
