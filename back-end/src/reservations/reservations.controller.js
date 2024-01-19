const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { date } = req.query;
  const data = await knex("reservations")
    .where({ reservation_date: date })
    .orderBy("reservation_time");
  res.json({ data });
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
  create: asyncErrorBoundary(create)
};
