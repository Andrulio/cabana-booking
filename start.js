#!/usr/bin/env node

/**
 * Usage: node start.js [--map <path>] [--bookings <path>] [--api-port <port>] [--frontend-port <port>]
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--map' && argv[i + 1]) args.map = argv[++i];
        if (argv[i] === '--bookings' && argv[i + 1]) args.bookings = argv[++i];
        if (argv[i] === '--api-port' && argv[i + 1]) args.apiPort = parseInt(argv[++i]);
        if (argv[i] === '--frontend-port' && argv[i + 1]) args.frontendPort = parseInt(argv[++i]);
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
const mapPath = path.resolve(args.map || path.join(__dirname, 'map.ascii'));
const bookingsPath = path.resolve(args.bookings || path.join(__dirname, 'bookings.json'));
const apiPort = args.apiPort || 3001;
const frontendPort = args.frontendPort || 3000;

if (!fs.existsSync(mapPath)) {
    console.error(`Error: map file not found: ${mapPath}`);
    process.exit(1);
}
if (!fs.existsSync(bookingsPath)) {
    console.error(`Error: bookings file not found: ${bookingsPath}`);
    process.exit(1);
}

const {
    createApp
} = require('./backend/server');
const apiApp = createApp(mapPath, bookingsPath);
apiApp.listen(apiPort, () => {
    console.log(`[API]      http://localhost:${apiPort}`);
});

const frontendApp = express();
frontendApp.use(express.static(path.join(__dirname, 'frontend')));
frontendApp.listen(frontendPort, () => {
    console.log(`[Frontend] http://localhost:${frontendPort}`);
    console.log(`\n  Open your browser at: http://localhost:${frontendPort}\n`);
});