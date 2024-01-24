const service = require('./reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function list(req, res) {
    const data = await service.list(req.query.date);
    res.json({ data });
}

async function create(req, res, next) {
    if (!req.body.data) return res.status(400).json({ error: "Data is missing." });
    
    const requiredFields = ["first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people"];
    for (const field of requiredFields) {
        if (!req.body.data[field]) {
            return res.status(400).json({ error: `${field} is missing.` });
        }
        if (req.body.data[field] === "") {
            return res.status(400).json({ error: `${field} cannot be empty.` });
        }
    }

    if (typeof req.body.data.people !== 'number' || req.body.data.people < 1) {
        return res.status(400).json({ error: "people must be a number greater than 0." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.data.reservation_date)) {
        return res.status(400).json({ error: "reservation_date must be a date in the format YYYY-MM-DD." });
    }

    if (!/^\d{2}:\d{2}$/.test(req.body.data.reservation_time)) {
        return res.status(400).json({ error: "reservation_time must be a time in the format HH:MM." });
    }

    const reservationDate = new Date(`${req.body.data.reservation_date}T${req.body.data.reservation_time}`);
    const today = new Date();
    if (reservationDate <= today) {
        return res.status(400).json({ error: "reservation_date must be in the future." });
    }

    if (reservationDate.getDay() === 2) {
        return res.status(400).json({ error: "Reservation cannot be made on a Tuesday, as the restaurant is closed." });
    }

    const reservationTime = req.body.data.reservation_time.split(":");
    const hours = parseInt(reservationTime[0]);
    const minutes = parseInt(reservationTime[1]);

    if (hours < 10 || (hours === 10 && minutes < 30)) {
        return res.status(400).json({ error: "Reservation cannot be made before 10:30 AM." });
    }

    if (hours > 21 || (hours === 21 && minutes > 30)) {
        return res.status(400).json({ error: "Reservation cannot be made after 9:30 PM." });
    }

    const data = await service.create(req.body.data);
    res.status(201).json({ data });
}
async function read(req, res, next) {
    const data = await service.read(req.params.reservation_id);
    if (!data) {
        return res.status(404).json({ error: `Reservation with ID ${req.params.reservation_id} not found.` });
    }
    res.status(200).json({ data });
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: asyncErrorBoundary(create),
    read: asyncErrorBoundary(read),
};
