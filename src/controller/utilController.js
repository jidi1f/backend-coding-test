const express = require('express');

const UtilController = express.Router({ mergeParams: true });

UtilController.get('/', (req, res) => res.send('Healthy'));

module.exports = UtilController;
