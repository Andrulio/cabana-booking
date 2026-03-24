const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--map' && argv[i + 1]) args.map = argv[++i];
        if (argv[i] === '--bookings' && argv[i + 1]) args.bookings = argv[++i];
        if (argv[i] === '--port' && argv[i + 1]) args.port = parseInt(argv[++i]);
    }
    return args;
}

function createApp(mapPath, bookingsPath) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const mapRaw = fs.readFileSync(mapPath, 'utf8');
    const grid = mapRaw.split('\n').map(row => row.split(''));
    const cabanas = {};
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 'W') {
                const id = `${r}_${c}`;
                cabanas[id] = {
                    id,
                    row: r,
                    col: c,
                    booked: false,
                    bookedBy: null
                };
            }
        });
    });

    const guestsRaw = fs.readFileSync(bookingsPath, 'utf8');
    const guests = {};
    JSON.parse(guestsRaw).forEach(g => {
        guests[g.room] = g.guestName;
    });

    const bookings = {};

    app.get('/api/map', (req, res) => {
        const cabanasWithState = Object.values(cabanas).map(c => ({
            ...c,
            booked: !!bookings[c.id],
            bookedBy: bookings[c.id] || null,
        }));
        res.json({
            grid,
            cabanas: cabanasWithState
        });
    });

    app.post('/api/book', (req, res) => {
        const {
            cabanaId,
            room,
            guestName
        } = req.body;

        if (!cabanaId || !room || !guestName) {
            return res.status(400).json({
                error: 'cabanaId, room, and guestName are required.'
            });
        }

        if (!cabanas[cabanaId]) {
            return res.status(404).json({
                error: 'Cabana not found.'
            });
        }

        if (bookings[cabanaId]) {
            return res.status(409).json({
                error: 'Cabana is already booked.'
            });
        }

        const expectedName = guests[room];
        if (!expectedName) {
            return res.status(401).json({
                error: 'Room number not found.'
            });
        }
        if (expectedName.toLowerCase() !== guestName.trim().toLowerCase()) {
            return res.status(401).json({
                error: 'Guest name does not match our records.'
            });
        }

        bookings[cabanaId] = {
            room,
            guestName: expectedName
        };
        res.json({
            success: true,
            cabanaId,
            room,
            guestName: expectedName
        });
    });

    return app;
}

if (require.main === module) {
    const args = parseArgs(process.argv.slice(2));
    const mapPath = path.resolve(args.map || path.join(process.cwd(), 'map.ascii'));
    const bookingsPath = path.resolve(args.bookings || path.join(process.cwd(), 'bookings.json'));
    const port = args.port || 3001;

    const app = createApp(mapPath, bookingsPath);
    app.listen(port, () => {
        console.log(`Resort API running on http://localhost:${port}`);
        console.log(`Map: ${mapPath}`);
        console.log(`Bookings: ${bookingsPath}`);
    });
}

module.exports = {
    createApp
};