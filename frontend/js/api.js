import { API } from './config.js';

export async function fetchMap() {
    const res = await fetch(`${API}/map`);
    return res.json();
}

export async function postBooking(cabanaId, room, guestName) {
    const res = await fetch(`${API}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cabanaId, room, guestName }),
    });
    return { ok: res.ok, data: await res.json() };
}
