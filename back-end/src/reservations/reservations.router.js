const router = require('express').Router();
const controller = require('./reservations.controller');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

router.route('/:reservation_id')
    .get(asyncErrorBoundary(controller.read));

router.route('/')
    .get(asyncErrorBoundary(controller.list))
    .post(asyncErrorBoundary(controller.create));

module.exports = router;
