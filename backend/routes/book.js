const { Router } = require('express');

function createBookRoutes(cabanas, bookings, guests) {
    const router = Router();

    router.post('/', (req, res) => {
        const { cabanaId, room, guestName } = req.body;

        if (!cabanaId || !room || !guestName) {
            return res.status(400).json({ error: 'cabanaId, room, and guestName are required.' });
        }
        if (!cabanas[cabanaId]) {
            return res.status(404).json({ error: 'Cabana not found.' });
        }
        if (bookings[cabanaId]) {
            return res.status(409).json({ error: 'Cabana is already booked.' });
        }

        const expectedName = guests[room];
        if (!expectedName) {
            return res.status(401).json({ error: 'Room number not found.' });
        }
        if (expectedName.toLowerCase() !== guestName.trim().toLowerCase()) {
            return res.status(401).json({ error: 'Guest name does not match our records.' });
        }

        bookings[cabanaId] = { room, guestName: expectedName };
        res.json({ success: true, cabanaId, room, guestName: expectedName });
    });

    return router;
}

module.exports = { createBookRoutes };
