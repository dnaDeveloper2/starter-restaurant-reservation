const knex = require('../db/connection');

function list(date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date: date })
        .andWhereNot({ status: 'finished' })
        .orderBy("reservation_time");
}

function create(reservation) {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id })
        .first();
}

async function updateReservationStatus(reservation_id, status) {
    const reservation = await knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();

 console.log(reservation)
if (reservation.length === 0) {
    throw new Error(`Reservation with ID ${reservation_id} does not exist.`);
}

const [updatedReservation] = await knex("reservations")
    .where({ reservation_id })
    .update({ status }, '*');

return updatedReservation;
}

module.exports = {
    list,
    create,
    read,
    updateReservationStatus
};
