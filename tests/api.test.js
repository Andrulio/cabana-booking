const request = require('supertest');
const path = require('path');
const {
    createApp
} = require('../backend/server');

const mapPath = path.join(__dirname, '..', 'map.ascii');
const bookingsPath = path.join(__dirname, '..', 'bookings.json');

let app;

beforeEach(() => {
    // Fresh app = fresh in-memory bookings
    app = createApp(mapPath, bookingsPath);
});

describe('GET /api/map', () => {
    test('returns 200 with grid and cabanas', async () => {
        const res = await request(app).get('/api/map');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('grid');
        expect(res.body).toHaveProperty('cabanas');
        expect(Array.isArray(res.body.grid)).toBe(true);
        expect(Array.isArray(res.body.cabanas)).toBe(true);
    });

    test('grid contains rows of characters', async () => {
        const res = await request(app).get('/api/map');
        const {
            grid
        } = res.body;
        expect(grid.length).toBeGreaterThan(0);
        grid.forEach(row => {
            expect(Array.isArray(row)).toBe(true);
        });
    });

    test('cabanas list contains W cells from the map', async () => {
        const res = await request(app).get('/api/map');
        const {
            cabanas
        } = res.body;
        expect(cabanas.length).toBeGreaterThan(0);
        cabanas.forEach(c => {
            expect(c).toHaveProperty('id');
            expect(c).toHaveProperty('row');
            expect(c).toHaveProperty('col');
            expect(c).toHaveProperty('booked');
            expect(c.booked).toBe(false); // initially all free
        });
    });
});

describe('POST /api/book', () => {
    let firstCabanaId;

    beforeEach(async () => {
        const res = await request(app).get('/api/map');
        firstCabanaId = res.body.cabanas[0].id;
    });

    test('successfully books a cabana with valid guest', async () => {
        const res = await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '101',
            guestName: 'Alice Smith',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.cabanaId).toBe(firstCabanaId);
    });

    test('case-insensitive guest name matching', async () => {
        const res = await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '101',
            guestName: 'alice smith',
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('returns 401 for wrong guest name', async () => {
        const res = await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '101',
            guestName: 'Wrong Name',
        });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    test('returns 401 for non-existent room', async () => {
        const res = await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '999',
            guestName: 'Anyone',
        });
        expect(res.status).toBe(401);
    });

    test('returns 409 when cabana already booked', async () => {
        // First booking
        await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '101',
            guestName: 'Alice Smith',
        });
        // Second booking attempt
        const res = await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '102',
            guestName: 'Bob Jones',
        });
        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/already booked/i);
    });

    test('returns 404 for unknown cabana id', async () => {
        const res = await request(app).post('/api/book').send({
            cabanaId: 'invalid_id',
            room: '101',
            guestName: 'Alice Smith',
        });
        expect(res.status).toBe(404);
    });

    test('returns 400 when required fields missing', async () => {
        const res = await request(app).post('/api/book').send({
            room: '101'
        });
        expect(res.status).toBe(400);
    });

    test('booked cabana shows as booked in /api/map', async () => {
        await request(app).post('/api/book').send({
            cabanaId: firstCabanaId,
            room: '101',
            guestName: 'Alice Smith',
        });
        const mapRes = await request(app).get('/api/map');
        const bookedCabana = mapRes.body.cabanas.find(c => c.id === firstCabanaId);
        expect(bookedCabana.booked).toBe(true);
    });

    test('multiple different cabanas can be booked independently', async () => {
        const mapRes = await request(app).get('/api/map');
        const [c1, c2] = mapRes.body.cabanas;

        await request(app).post('/api/book').send({
            cabanaId: c1.id,
            room: '101',
            guestName: 'Alice Smith',
        });
        const res2 = await request(app).post('/api/book').send({
            cabanaId: c2.id,
            room: '102',
            guestName: 'Bob Jones',
        });
        expect(res2.status).toBe(200);
    });
});