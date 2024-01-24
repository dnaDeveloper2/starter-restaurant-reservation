// const service = require('./seat.service');
// const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// async function seatTable(req, res, next) {
//     const { table_id } = req.params;
//     const { data } = req.body;

//     if (!data) {
//         return res.status(400).json({ error: "Data is missing." });
//     }

//     const { reservation_id } = data;
//     if (!reservation_id) {
//         return res.status(400).json({ error: "reservation_id is missing." });
//     }

//     await service.seatTable(table_id, reservation_id);
//     res.status(200).json({ data: { status: 'seated' } });
// }

// async function unseatTable(req, res, next) {
//     await service.unseatTable(req.params.table_id);
//     res.status(200).json({ data: { status: 'finished' } });
// }

// module.exports = {
//     seatTable: asyncErrorBoundary(seatTable),
//     unseatTable: asyncErrorBoundary(unseatTable),
// };
