const router = require('express').Router();
const controller = require('./reservations.controller');
// const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

router.route('/:reservation_id')
    .get(controller.read);

router.route('/')
    .get(controller.list)
    .post(controller.create);

module.exports = router;
