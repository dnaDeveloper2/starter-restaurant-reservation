/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const express = require("express");
const controller = require("./reservations.controller");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const router = express.Router();

router
  .route("/")
  .get(asyncErrorBoundary(controller.list))
  .post(asyncErrorBoundary(controller.create));

module.exports = router;


