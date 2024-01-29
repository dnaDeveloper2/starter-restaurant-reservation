const knex = require("../db/connection");


// Retrieves a list of reservations filtered by date or mobile number.

function list(date, mobile_number) {
  let query = knex("reservations").select("*");

  if (mobile_number) {
    query = query.whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    );
  }

  if (date) {
    query = query
      .where({ reservation_date: date })
      .andWhereNot({ status: "finished" })
      .orderBy("reservation_time");
  }

  return query;
}

// Creates a new reservation record in the database.

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// Retrieves a single reservation by its ID.

function read(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

// Updates the status of a specific reservation.

async function updateReservationStatus(reservation_id, status) {
  const reservation = await knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();

  if (reservation.length === 0) {
    throw new Error(`Reservation with ID ${reservation_id} does not exist.`);
  }

  const [updatedReservation] = await knex("reservations")
    .where({ reservation_id })
    .update({ status }, "*");

  return updatedReservation;
}

// Updates an existing reservation with new data.

function update(reservation_id, updatedReservationData) {
  return knex("reservations")
    .where({ reservation_id })
    .update(updatedReservationData, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

// Exports the functions

module.exports = {
  list,
  create,
  read,
  updateReservationStatus,
  update,
};
