#!/usr/bin/env node

/**
 * Usage: node start.js [--map <path>] [--bookings <path>] [--port <port>]
 */
const path = require('path');
const fs = require('fs');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--map' && argv[i + 1]) args.map = argv[++i];
        if (argv[i] === '--bookings' && argv[i + 1]) args.bookings = argv[++i];
        if (argv[i] === '--port' && argv[i + 1]) args.port = parseInt(argv[++i]);
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
const mapPath = path.resolve(args.map || path.join(__dirname, 'map.ascii'));
const bookingsPath = path.resolve(args.bookings || path.join(__dirname, 'bookings.json'));
const port = args.port || 3000;

if (!fs.existsSync(mapPath)) {
    console.error(`Error: map file not found: ${mapPath}`);
    process.exit(1);
}
if (!fs.existsSync(bookingsPath)) {
    console.error(`Error: bookings file not found: ${bookingsPath}`);
    process.exit(1);
}

const express = require('express');
const { createApp } = require('./backend/app');

const app = createApp(mapPath, bookingsPath);
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
    console.log(`Azure Palms Resort running at http://localhost:${port}`);
});
