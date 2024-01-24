const router = require('express').Router();
const controller = require('./tables.controller');
// const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

router.route('/')
    .get(controller.list)
    .post(controller.createTable);

module.exports = router;
