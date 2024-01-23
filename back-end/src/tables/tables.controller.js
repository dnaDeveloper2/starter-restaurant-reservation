const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const tables = await knex("tables");
  res.json({ data: tables });
}

async function finishTable(req, res, next) {
  const { table_id } = req.params;

  try {
    // Find the reservation associated with this table
    const activeReservation = await knex("reservations")
      .where({ table_id, status: 'seated' }) // We're looking for the reservation that is currently seated at this table
      .first();

    if (!activeReservation) {
      return res.status(400).json({ error: "Table is not occupied." });
    }

    // Update the reservation status to 'finished'
    await knex("reservations")
      .where({ reservation_id: activeReservation.reservation_id })
      .update({ status: 'finished', table_id: null }); // Also clearing the table_id as the reservation is finished

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

async function seatTable(req, res, next) {
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;

  try {
    const reservation = await knex("reservations")
      .where({ reservation_id })
      .first();

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const table = await knex("tables")
      .where({ table_id })
      .first();

    if (!table) {
      return res.status(404).json({ error: "Table not found." });
    }

    // Check if table has sufficient capacity
    if (table.capacity < reservation.people) {
      return res.status(400).json({ error: "Table does not have sufficient capacity." });
    }

    // Check if table is already occupied by checking if there's an active reservation with this table_id
    const activeReservationAtTable = await knex("reservations")
      .where({ table_id, status: 'booked' })
      .orWhere({ table_id, status: 'seated' })
      .first();

    if (activeReservationAtTable) {
      return res.status(400).json({ error: "Table is already occupied." });
    }

    // Seat the reservation by updating its status and table_id
    await knex("reservations")
      .where({ reservation_id })
      .update({ status: 'seated', table_id });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
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