const router = require("express").Router();
const controller = require("./tables.controller");

router
  .route("/:table_id/seat")
  .put(controller.seatTable)
  .delete(controller.unseatTable);

router.route("/").get(controller.list).post(controller.createTable);

module.exports = router;
