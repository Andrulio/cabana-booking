const path = require('path');
const { createApp } = require('./app');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--map' && argv[i + 1]) args.map = argv[++i];
        if (argv[i] === '--bookings' && argv[i + 1]) args.bookings = argv[++i];
        if (argv[i] === '--port' && argv[i + 1]) args.port = parseInt(argv[++i]);
    }
    return args;
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

module.exports = { createApp };
