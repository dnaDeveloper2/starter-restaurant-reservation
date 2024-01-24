/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const express = require("express");
const router = express.Router();
const controller = require("./reservations.controller");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");



  router.route("/:reservation_id/seat").put(asyncErrorBoundary(controller.seatReservation));
  router.route("/:reservation_id").get(asyncErrorBoundary(controller.read))
  router.route("/search").get(controller.search);
  router
  .route("/")
  .get(asyncErrorBoundary(controller.list))
  .post(asyncErrorBoundary(controller.create));

module.exports = router;


