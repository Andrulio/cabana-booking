const express = require('express');
const cors = require('cors');
const { loadMap, loadGuests } = require('./data/loader');
const { createMapRoutes } = require('./routes/map');
const { createBookRoutes } = require('./routes/book');

function createApp(mapPath, bookingsPath) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const { grid, cabanas } = loadMap(mapPath);
    const guests = loadGuests(bookingsPath);
    const bookings = {};

    app.use('/api/map', createMapRoutes(grid, cabanas, bookings));
    app.use('/api/book', createBookRoutes(cabanas, bookings, guests));

    return app;
}

module.exports = { createApp };
