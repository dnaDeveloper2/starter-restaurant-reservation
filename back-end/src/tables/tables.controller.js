const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const tables = await knex("tables");
  res.json({ data: tables });
}

async function finishTable(req, res, next) {
  const { table_id } = req.params;

  try {
    // Check if the table has a reservation assigned (considered occupied)
    const table = await knex("tables").where({ table_id }).first();
    if (!table || !table.reservation_id) {
      return res.status(400).json({ error: "Table is not occupied." });
    }

    // Free up the table by removing the reservation assignment
    await knex("tables").where({ table_id }).update({ reservation_id: null });

    res.status(204).json();
  } catch (error) {
    next(error);
  }
}

async function seatTable(req, res, next) {
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;

  try {
    // Check if the reservation exists
    const reservation = await knex("reservations")
      .where({ reservation_id })
      .first();

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    // Check if the table exists
    const table = await knex("tables")
      .where({ table_id })
      .first();

    if (!table) {
      return res.status(404).json({ error: "Table not found." });
    }

    // Check if the table is free
    if (table.reservation_id) {
      return res.status(400).json({ error: "Table is already occupied." });
    }

    // Check if the table has sufficient capacity
    if (table.capacity < reservation.people) {
      return res.status(400).json({ error: "Table does not have sufficient capacity." });
    }

    // Check if the table is already occupied by another reservation
    const occupiedTable = await knex("tables")
      .where({ reservation_id: reservation_id })
      .first();

    if (occupiedTable) {
      return res.status(400).json({ error: "Table is already occupied." });
    }

    await knex("tables")
    .where({ table_id })
    .update({ reservation_id });

    res.sendStatus(204);
  } catch (error) {
    console.log(error)
    next(error);
  }
}

async function createTable(req, res, next) {
  const { table_name, capacity } = req.body;

  try {
    // Validation checks for table_name and capacity
    if (table_name.length < 2) {
      return res.status(400).json({ error: "Table name must be at least 2 characters long." });
    }

    if (capacity < 1) {
      return res.status(400).json({ error: "Capacity must be at least 1 person." });
    }

    const [newTable] = await knex("tables")
      .insert({
        table_name,
        capacity,
      })
      .returning("*");

    res.status(201).json({ data: newTable });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  seatTable: asyncErrorBoundary(seatTable),
  list: asyncErrorBoundary(list),
  createTable: asyncErrorBoundary(createTable),
  finishTable: [asyncErrorBoundary(finishTable)],
};