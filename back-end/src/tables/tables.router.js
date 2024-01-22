const express = require("express");
const controller = require("./tables.controller");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const router = express.Router();


router.route("/:table_id/seat/")
.put(asyncErrorBoundary(controller.seatTable))
.delete(controller.finishTable);

router.route("/")
.get(asyncErrorBoundary(controller.list))
.post(asyncErrorBoundary(controller.createTable));


module.exports = router;