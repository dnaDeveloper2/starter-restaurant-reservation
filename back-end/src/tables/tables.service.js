const knex = require("../db/connection");

// Retrieves a list of all tables, ordered by table name.

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

// Creates a new table record in the database.

function createTable(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// Seats a reservation at a specific table.

async function seatTable(table_id, reservation_id) {
  const reservation = await knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();

  if (!reservation)
    throw new Error(`Reservation ${reservation_id} does not exist.`);
  if (reservation.status === "seated") {
    throw new Error(`Reservation ${reservation_id} is already seated.`);
  }

  const table = await knex("tables").select("*").where({ table_id }).first();

  // if (!reservation) throw new Error(`Reservation ${reservation_id} does not exist.`);
  if (table.reservation_id)
    throw new Error(`Table ${table_id} is already occupied.`);
  if (table.capacity < reservation.people)
    throw new Error(
      `Table does not have sufficient capacity for the number of people in the reservation.`
    );

  await knex.transaction(async (trx) => {
    await trx("reservations")
      .where({ reservation_id })
      .update({ status: "seated" });

    await trx("tables").where({ table_id }).update({ reservation_id });
  });
}

// Frees up a table that was previously seated.

async function unseatTable(table_id) {
  const table = await knex("tables").select("*").where({ table_id }).first();

  if (!table) throw new Error(`Table: ${table_id} does not exist.`);
  if (!table.reservation_id) throw new Error("Table is not occupied.");

  await knex.transaction(async (trx) => {
    await trx("reservations")
      .where({ reservation_id: table.reservation_id })
      .update({ status: "finished" });

    await trx("tables").where({ table_id }).update({ reservation_id: null });
  });
}

// Exports the functions to be used in other modules

module.exports = {
  list,
  createTable,
  seatTable,
  unseatTable,
};
