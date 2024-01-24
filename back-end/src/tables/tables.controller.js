const knex = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  // Retrieve tables from the database and sort them by 'table_name'
  const tables = await knex("tables").orderBy("table_name");
  res.json({ data: tables });
}


async function finishTable(req, res, next) {
  const { table_id } = req.params;
  const trx = await knex.transaction(); // Start a new transaction

  try {
    const table = await trx('tables')
      .select('*')
      .where({ table_id })
      .first();

    if (!table || !table.reservation_id) {
      return res.status(400).json({ error: "Table is not occupied." });
    }

    await trx('reservations')
      .where({ reservation_id: table.reservation_id })
      .update({ status: 'finished' });

    await trx('tables')
      .where({ table_id })
      .update({ reservation_id: null });

    await trx.commit(); // Commit the transaction
    res.sendStatus(204);
  } catch (error) {
    await trx.rollback(); // Rollback the transaction on error
    next(error); // Pass the error to the error handler
  }
}


async function seatTable(req, res, next) {
  if (!req.body.data || !req.body.data.reservation_id) {
    return res.status(400).json({ error: "Data with reservation_id is required." });
  }

  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  const numericReservationId = Number(reservation_id);

  try {
    const reservation = await knex("reservations")
      // .where({reservation_id: numericReservationId})
      
      console.log("This is the number*****", numericReservationId)
      console.log("This is the reservation *****", reservation)

      console.log(table_id)
      const table = await knex("tables")
      .where({ table_id: table_id})
      .first()
      .select("*")
console.log("Cap and people*****",table.capacity,reservation.people, reservation_id)


    if (reservation.length === 0) {
      return res.status(404).json({ error: `Reservation with ID ${numericReservationId} not found.` });
    }

    // if (!table) {
    //   return res.status(404).json({ error: "Table not found." });
    // }
    if (table.capacity < reservation.people) {
      return res.status(400).json({ error: "Table does not have sufficient capacity for the number of people in the reservation." });
    }
  

    if (table.reservation_id) {
      return res.status(400).json({ error: "Table is already occupied." });
    }

    await knex.transaction(async (trx) => {
      await trx("reservations")
        .where({ reservation_id })
        .update({ status: 'seated' });

      await trx("tables")
        .where({ table_id })
        .update({ reservation_id });
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    next(error);
  }
}



async function createTable(req, res, next) {
  // Check if 'data' property exists and is an object
  if (!req.body.data || typeof req.body.data !== 'object' || Object.keys(req.body.data).length === 0) {
      return res.status(400).json({ error: "Request body must contain a 'data' property with required fields." });
  }
  
  const { table_name, capacity } = req.body.data;
  const errors = [];

  // Validation checks for 'table_name'
  if (!table_name || typeof table_name !== 'string' || table_name.trim().length < 2) {
      errors.push("table_name must be at least 2 characters long.");
  }

  // Validation checks for 'capacity'
  if (!capacity || typeof capacity !== 'number' || capacity < 1) {
      errors.push("capacity must be a number and at least 1 person.");
  }

  // If there are validation errors, return a response with a 400 status code and the collected error messages
  if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
  }

  try {
      const [newTable] = await knex("tables")
          .insert({
              table_name,
              capacity,
          })
          .returning("*");

      res.status(201).json({ data: newTable });
  } catch (error) {
      next(error);  // Handle unexpected errors
  }
}



module.exports = {
  seatTable: asyncErrorBoundary(seatTable),
  list: asyncErrorBoundary(list),
  createTable: asyncErrorBoundary(createTable),
  finishTable: [asyncErrorBoundary(finishTable)],
};