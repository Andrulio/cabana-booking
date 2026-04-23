import { fetchMap } from './api.js';
import { renderMap } from './map.js';
import { openCabanaModal, closeModal } from './modal.js';

let mapData = null;
let cabanaMap = {};

async function loadMap() {
    try {
        mapData = await fetchMap();
        cabanaMap = {};
        mapData.cabanas.forEach(c => { cabanaMap[c.id] = c; });
        renderMap(mapData, cabanaMap, handleCabanaClick);
        updateStatus();
    } catch (e) {
        document.getElementById('status-bar').textContent = 'Could not connect to resort server.';
    }
}

function updateStatus() {
    const total = mapData.cabanas.length;
    const booked = mapData.cabanas.filter(c => c.booked).length;
    const free = total - booked;
    document.getElementById('status-bar').textContent =
        `${free} of ${total} cabanas available · Click a cabana to reserve your spot`;
}

function handleCabanaClick(id, booked) {
    openCabanaModal(id, booked, loadMap);
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

loadMap();
