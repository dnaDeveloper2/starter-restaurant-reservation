const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function search(req, res) {
  const { mobile_number } = req.query;
  const data = await knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");

  res.json({ data });
}

async function list(req, res) {
  const { date } = req.query;
  const data = await knex("reservations")
    .where({ reservation_date: date })
    .orderBy("reservation_time");
  res.json({ data });
}

async function seatReservation(req, res, next) {
  const { reservation_id } = req.params;
  const { table_id } = req.body.data;

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

    // Check if the table is already occupied by another active reservation
    const activeReservationAtTable = await knex("reservations")
      .where({ table_id, status: 'booked' })
      .orWhere({ table_id, status: 'seated' })
      .first();

    if (activeReservationAtTable) {
      return res.status(400).json({ error: "Table is already occupied." });
    }

    // Update the reservation with the assigned table_id and status to 'seated'
    await knex("reservations")
      .where({ reservation_id })
      .update({ table_id, status: 'seated' });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}


async function create(req, res) {
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body;

  // Add validation for future working dates
  const today = new Date();
  const reservationDate = new Date(reservation_date);

  const phoneNumberRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneNumberRegex.test(mobile_number)) {
    return res.status(400).json({ error: "Phone number must be in the format 800-555-1212." });
  }
  
  console.log("reservation-------", reservationDate.getDay())
  if (reservationDate <= today || reservationDate.getDay() === 2 /* Tuesday */) {
   
    return res.status(400).json({ error: "Invalid reservation date." });
  }

  const errors = [];

  // Check for missing data and collect error messages
  if (!first_name) errors.push("First name is required.");
  if (!last_name) errors.push("Last name is required.");
  if (!mobile_number) errors.push("Mobile number is required.");
  if (!reservation_date) errors.push("Reservation date is required.");
  if (!reservation_time) errors.push("Reservation time is required.");
  if (!people) errors.push("Number of people is required.");

  // If there are errors, return a response with a 400 status code and the collected error messages
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

    if (first_name.trim() === "" || last_name.trim() === "" || mobile_number.trim() === "" || reservation_date.trim() === "" || reservation_time.trim() === "") {
      return res.status(400).json({ error: "Empty values are not allowed." });
    }

    if (isNaN(people)) {
      return res.status(400).json({ error: "Invalid data type for 'people'. Must be a number." });
    }
  const reservation = {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  };

  const [createdReservation] = await knex("reservations")
    .insert(reservation)
    .returning("*");

  res.status(201).json({ data: createdReservation });
}



module.exports = {
  list:asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  seatReservation: asyncErrorBoundary(seatReservation),
  search: asyncErrorBoundary(search),
};
