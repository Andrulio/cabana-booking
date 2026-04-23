const { Router } = require('express');

function createMapRoutes(grid, cabanas, bookings) {
    const router = Router();

    router.get('/', (req, res) => {
        const cabanasWithState = Object.values(cabanas).map(c => ({
            ...c,
            booked: !!bookings[c.id],
            bookedBy: bookings[c.id] || null,
        }));
        res.json({ grid, cabanas: cabanasWithState });
    });

    return router;
}

module.exports = { createMapRoutes };
