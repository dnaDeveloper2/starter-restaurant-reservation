const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");


// Retrieves a list of reservations based on provided query parameters.

async function list(req, res) {
  const { mobile_number, date } = req.query;
  const data = await service.list(date, mobile_number);
  res.json({ data });
}

// Creates a new reservation after validating the required fields and constraints.

async function create(req, res, next) {
  if (!req.body.data)
    return res.status(400).json({ error: "Data is missing." });

  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return res.status(400).json({ error: `${field} is missing.` });
    }
    if (req.body.data[field] === "") {
      return res.status(400).json({ error: `${field} cannot be empty.` });
    }
  }

  if (typeof req.body.data.people !== "number" || req.body.data.people < 1) {
    return res
      .status(400)
      .json({ error: "people must be a number greater than 0." });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.data.reservation_date)) {
    return res.status(400).json({
      error: "reservation_date must be a date in the format YYYY-MM-DD.",
    });
  }

  if (!/^\d{2}:\d{2}$/.test(req.body.data.reservation_time)) {
    return res
      .status(400)
      .json({ error: "reservation_time must be a time in the format HH:MM." });
  }
  if (
    req.body.data.status &&
    ["seated", "finished"].includes(req.body.data.status)
  ) {
    return res.status(400).json({
      error: `Cannot create a reservation with status ${req.body.data.status}`,
    });
  }
  const reservationDate = new Date(
    `${req.body.data.reservation_date}T${req.body.data.reservation_time}`
  );
  const today = new Date();
  if (reservationDate <= today) {
    return res
      .status(400)
      .json({ error: "reservation_date must be in the future." });
  }

  if (reservationDate.getDay() === 2) {
    return res.status(400).json({
      error:
        "Reservation cannot be made on a Tuesday, as the restaurant is closed.",
    });
  }

  const reservationTime = req.body.data.reservation_time.split(":");
  const hours = parseInt(reservationTime[0]);
  const minutes = parseInt(reservationTime[1]);

  if (hours < 10 || (hours === 10 && minutes < 30)) {
    return res
      .status(400)
      .json({ error: "Reservation cannot be made before 10:30 AM." });
  }

  if (hours > 21 || (hours === 21 && minutes > 30)) {
    return res
      .status(400)
      .json({ error: "Reservation cannot be made after 9:30 PM." });
  }

  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// Retrieves a single reservation by ID.

async function read(req, res, next) {
  const data = await service.read(req.params.reservation_id);
  if (!data) {
    return res.status(404).json({
      error: `Reservation with ID ${req.params.reservation_id} not found.`,
    });
  }
  res.status(200).json({ data });
}

// Updates the status of an existing reservation.

async function updateReservationStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  if (!status) {
    return res.status(400).json({ error: "status is missing" });
  }

  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `unknown status: ${status}` });
  }

  try {
    const reservation = await service.read(reservation_id);
    if (!reservation) {
      return res
        .status(404)
        .json({ error: `Reservation with ID ${reservation_id} not found.` });
    }

    if (reservation.status === "finished") {
      return res
        .status(400)
        .json({ error: "a finished reservation cannot be updated" });
    }

    const updatedReservation = await service.updateReservationStatus(
      reservation_id,
      status
    );
    if (updatedReservation) {
      return res
        .status(200)
        .json({ data: { status: updatedReservation.status } });
    } else {
      return res
        .status(404)
        .json({ error: `Reservation with ID ${reservation_id} not found.` });
    }
  } catch (error) {
    if (error.message.includes("does not exist")) {
      return res.status(404).json({ error: error.message });
    }
    return next(error);
  }
}

// Updates an existing reservation's details.

async function update(req, res, next) {
  const { reservation_id } = req.params;
  const updatedReservationData = req.body.data;

  // Validate input
  if (
    !updatedReservationData ||
    Object.keys(updatedReservationData).length === 0
  ) {
    return res.status(400).json({ error: "Data is missing or empty." });
  }

  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];
  for (const field of requiredFields) {
    if (!updatedReservationData[field] && updatedReservationData[field] !== 0) {
      return res.status(400).json({ error: `${field} is missing.` });
    }
    if (updatedReservationData[field] === "") {
      return res.status(400).json({ error: `${field} cannot be empty.` });
    }
  }

  // Validate reservation_date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedReservationData.reservation_date)) {
    return res.status(400).json({
      error: "reservation_date must be a date in the format YYYY-MM-DD.",
    });
  }

  // Validate reservation_time format
  if (!/^\d{2}:\d{2}$/.test(updatedReservationData.reservation_time)) {
    return res
      .status(400)
      .json({ error: "reservation_time must be a time in the format HH:MM." });
  }

  // Validate people field
  if (
    typeof updatedReservationData.people !== "number" ||
    updatedReservationData.people < 1
  ) {
    return res
      .status(400)
      .json({ error: "people must be a number greater than 0." });
  }

  // Check if the reservation exists
  const existingReservation = await service.read(reservation_id);
  if (!existingReservation) {
    return res
      .status(404)
      .json({ error: `Reservation with ID ${reservation_id} does not exist.` });
  }

  // Prevent updating a finished reservation
  if (existingReservation.status === "finished") {
    return res
      .status(400)
      .json({ error: "A finished reservation cannot be updated." });
  }

  // Update the reservation
  const updatedReservation = await service.update(
    reservation_id,
    updatedReservationData
  );
  res.status(200).json({ data: updatedReservation });
}

//Exports with asyncErrorBoundary
module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  read: asyncErrorBoundary(read),
  updateReservationStatus: asyncErrorBoundary(updateReservationStatus),
  update: asyncErrorBoundary(update),
};
