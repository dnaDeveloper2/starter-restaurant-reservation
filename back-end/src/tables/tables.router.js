const router = require('express').Router();
const controller = require('./tables.controller');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

router.route('/')
    .get(asyncErrorBoundary(controller.list))
    .post(asyncErrorBoundary(controller.createTable));

module.exports = router;
