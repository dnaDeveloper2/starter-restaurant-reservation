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

async function read(req, res, next) {
  // Convert reservation_id to a number to ensure type consistency.
  const reservation_id = Number(req.params.reservation_id);
  console.log(`Fetching reservation with ID: ${reservation_id}`); 

  try {
    const data = await knex("reservations")
      .where({ reservation_id })  // Use the number version of reservation_id
      .first();

    if (!data) {
      // If no reservation is found, return a 404 status code with an error message.
      return res.status(404).json({ error: `Reservation with ID ${reservation_id} not found.` });
    }

    // Return the fetched reservation data
    return res.status(200).json({ data: data });
  } catch (error) {
    next(error);
  }
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


async function create(req, res, next) {
  if (!req.body.data) {
    return res.status(400).json({ error: "Data is missing." });
  }
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = req.body.data; // Destructure properties from req.body.data

  const errors = [];

  // Validate required fields are present and not empty
  if (!first_name || first_name.trim() === "") errors.push("first_name is required.");
  if (!last_name || last_name.trim() === "") errors.push("last_name is required.");
  if (!mobile_number || mobile_number.trim() === "") errors.push("mobile_number is required.");
  if (!reservation_date || reservation_date.trim() === "") errors.push("reservation_date is required.");
  if (!reservation_time || reservation_time.trim() === "") errors.push("reservation_time is required.");
  if (!people || isNaN(people) ||typeof people !== 'number' ||Number(people) <= 0) errors.push("people must be a number greater than 0.");
  

  // Validate phone number format
  const phoneNumberRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (!phoneNumberRegex.test(mobile_number)) {
    errors.push("Phone number must be in the format 800-555-1212.");
  }

  // Validate reservation_date and reservation_time
  const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
  const today = new Date();
  
  // Check if the reservation is in the future
  if (reservationDateTime <= today) {
      errors.push("Invalid reservation_date or reservation_time. Reservation must be in the future.");
  }
  if (isNaN(reservationDateTime)){
    errors.push("Invalid reservation_date or reservation_time.");
  }
  
  // Check if the reservation is on a Tuesday
  if (reservationDateTime.getDay() === 2) {
      errors.push("Restaurant is closed on Tuesdays.");
  }
  
  // Check reservation time restrictions
  const reservationHour = reservationDateTime.getHours();
  const reservationMinute = reservationDateTime.getMinutes();
  
  // Opening time (10:30 AM)
  const openingHour = 10;
  const openingMinute = 30;
  
  // Closing time (9:30 PM)
  const closingHour = 21;
  const closingMinute = 30;
  
  if (reservationHour < openingHour || (reservationHour === openingHour && reservationMinute < openingMinute)) {
      errors.push("Invalid reservation_time. Cannot be before 10:30 AM.");
  }
  
  if (reservationHour > closingHour || (reservationHour === closingHour && reservationMinute > closingMinute)) {
      errors.push("Invalid reservation_time. Cannot be after 9:30 PM.");
  }

  // If there are errors, return a response with a 400 status code and the collected error messages
  // If there are errors, return a response with a 400 status code and the collected error messages
  if (errors.length > 0) {
    // If the test expects error messages as an array
    
    return res.status(400).json({ error: errors.join(', ') }) // Return errors as an array
    
  }
  

  // Proceed with creating the reservation
  try {
    const reservation = {
      first_name,
      last_name,
      mobile_number,
      reservation_date,
      reservation_time,
      people: Number(people), // Ensure 'people' is stored as a number
    };

    const [createdReservation] = await knex("reservations")
      .insert(reservation)
      .returning("*");

    res.status(201).json({ data: createdReservation });
  } catch (error) {
    next(error);  // Handle unexpected errors
  }
}





module.exports = {
  list:asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  seatReservation: asyncErrorBoundary(seatReservation),
  search: asyncErrorBoundary(search),
  read: asyncErrorBoundary(read)
};
