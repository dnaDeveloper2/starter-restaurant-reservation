const router = require('express').Router();
const controller = require('./seat.controller');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

router.route('/:table_id/seat')
    .put(asyncErrorBoundary(controller.seatTable))
    .delete(asyncErrorBoundary(controller.unseatTable));

module.exports = router;
