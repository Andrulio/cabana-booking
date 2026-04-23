const fs = require('fs');

function loadMap(mapPath) {
    const raw = fs.readFileSync(mapPath, 'utf8');
    const grid = raw.split('\n').map(row => row.split(''));
    const cabanas = {};
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 'W') {
                const id = `${r}_${c}`;
                cabanas[id] = { id, row: r, col: c, booked: false, bookedBy: null };
            }
        });
    });
    return { grid, cabanas };
}

function loadGuests(bookingsPath) {
    const raw = fs.readFileSync(bookingsPath, 'utf8');
    const guests = {};
    JSON.parse(raw).forEach(g => {
        guests[g.room] = g.guestName;
    });
    return guests;
}

module.exports = { loadMap, loadGuests };
