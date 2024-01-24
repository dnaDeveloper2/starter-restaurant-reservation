const service = require('./tables.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function list(req, res, next) {
    const data = await service.list();
    res.json({ data });
}

async function createTable(req, res, next) {
    if (!req.body.data) return res.status(400).json({ error: "Data is missing." });

    const requiredFields = ["table_name", "capacity"];
    for (const field of requiredFields) {
        if (!req.body.data[field] && req.body.data[field] !== 0) {
            return res.status(400).json({ error: `${field} is missing.` });
        }
        if (req.body.data[field] === "") {
            return res.status(400).json({ error: `${field} cannot be empty.` });
        }
    }

    if (req.body.data.table_name.length < 2) {
        return res.status(400).json({ error: "table_name must be at least 2 characters long." });
    }

    if (typeof req.body.data.capacity !== 'number' || req.body.data.capacity < 1) {
        return res.status(400).json({ error: "capacity must be a number greater than 0." });
    }

    const data = await service.createTable(req.body.data);
    res.status(201).json({ data });
}

async function seatTable(req, res, next) {
    const { table_id } = req.params;
    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ error: "Data is missing." });
    }

    const { reservation_id } = data;
    if (!reservation_id) {
        return res.status(400).json({ error: "reservation_id is missing." });
    }

    await service.seatTable(table_id, reservation_id);
    res.status(200).json({ data: { status: 'seated' } });
}

async function unseatTable(req, res, next) {
    await service.unseatTable(req.params.table_id);
    res.status(200).json({ data: { status: 'finished' } });
}
module.exports = {
    list: asyncErrorBoundary(list),
    createTable: asyncErrorBoundary(createTable),
    seatTable: asyncErrorBoundary(seatTable),
    unseatTable: asyncErrorBoundary(unseatTable),
};
