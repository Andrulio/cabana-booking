const API = 'http://localhost:3001/api';
const TILE_SIZE = 40;
let mapData = null;
let cabanaMap = {};

async function loadMap() {
    try {
        const res = await fetch(`${API}/map`);
        mapData = await res.json();
        cabanaMap = {};
        mapData.cabanas.forEach(c => {
            cabanaMap[c.id] = c;
        });
        renderMap();
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

function getPathTile(grid, r, c) {
    const rows = grid.length;
    const cols = grid[0].length;
    const isPath = (row, col) => {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
        return grid[row][col] === '#';
    };

    const N = isPath(r - 1, c);
    const S = isPath(r + 1, c);
    const E = isPath(r, c + 1);
    const W = isPath(r, c - 1);
    const count = [N, S, E, W].filter(Boolean).length;
    const arrowStraight = 'assets/arrowStraight.png'
    const arrowCrossing = 'assets/arrowCrossing.png'
    const arrowSplit = 'assets/arrowSplit.png'
    const arrowCornerSquare = 'assets/arrowCornerSquare.png'
    const arrowEnd = 'assets/arrowEnd.png'

    if (count === 4) return {
        src: arrowCrossing,
        rot: 0
    };
    if (count === 3) {
        if (!W) return {
            src: arrowSplit,
            rot: 0
        };
        if (!E) return {
            src: arrowSplit,
            rot: 180
        };
        if (!N) return {
            src: arrowSplit,
            rot: 90
        };
        if (!S) return {
            src: arrowSplit,
            rot: 270
        };
    }
    if (count === 2) {

        if (N && S) return {
            src: arrowStraight,
            rot: 0
        };
        if (E && W) return {
            src: arrowStraight,
            rot: 90
        };

        if (N && E) return {
            src: arrowCornerSquare,
            rot: 0
        };
        if (S && E) return {
            src: arrowCornerSquare,
            rot: 90
        };
        if (S && W) return {
            src: arrowCornerSquare,
            rot: 180
        };
        if (N && W) return {
            src: arrowCornerSquare,
            rot: 270
        };
    }
    if (count === 1) {
        if (N) return {
            src: arrowEnd,
            rot: 0
        };
        if (E) return {
            src: arrowEnd,
            rot: 270
        };
        if (S) return {
            src: arrowEnd,
            rot: 90
        };
        if (W) return {
            src: arrowEnd,
            rot: 90
        };
    }

    return {
        src: arrowStraight,
        rot: 0
    };
}

function renderMap() {
    const grid = mapData.grid;
    const cols = Math.max(...grid.map(r => r.length));

    const mapEl = document.getElementById('resort-map');
    mapEl.style.gridTemplateColumns = `repeat(${cols}, ${TILE_SIZE}px)`;
    mapEl.innerHTML = '';

    let cabanaIndex = 0;

    grid.forEach((row, r) => {
        for (let c = 0; c < cols; c++) {
            const char = row[c] ?? '.';
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (char === '.') {
                cell.classList.add('cell-empty');
                const img = document.createElement('img');
                img.src = 'assets/textureWater.png';
                img.alt = '';
                img.style.opacity = '0.18';
                cell.appendChild(img);

            } else if (char === '#') {
                cell.classList.add('cell-path');
                const {
                    src,
                    rot
                } = getPathTile(grid, r, c);
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'path';
                if (rot) img.style.transform = `rotate(${rot}deg)`;
                cell.appendChild(img);

            } else if (char === 'p') {
                cell.classList.add('cell-pool');
                const img = document.createElement('img');
                img.src = 'assets/pool.png';
                img.alt = 'pool';
                cell.appendChild(img);

            } else if (char === 'c') {
                cell.classList.add('cell-chalet');
                const img = document.createElement('img');
                img.src = 'assets/houseChimney.png';
                img.alt = 'chalet';
                cell.appendChild(img);

            } else if (char === 'W') {
                const id = `${r}_${c}`;
                const cabana = cabanaMap[id];
                const booked = cabana && cabana.booked;

                cell.classList.add(booked ? 'cell-cabana-booked' : 'cell-cabana');

                // Створюємо картинку кабінки
                const img = document.createElement('img');
                img.src = 'assets/cabana.png';
                cell.appendChild(img);

                // --- НАША НОВА ПЛАШКА (TOOLTIP) ---
                cabanaIndex++; // Інкрементуємо номер кабінки
                const tooltip = document.createElement('span');
                tooltip.className = 'cabana-tooltip';
                tooltip.textContent = `Cabana #${cabanaIndex}`;
                cell.appendChild(tooltip);
                // ----------------------------------

                cell.addEventListener('click', () => openCabanaModal(id, booked));
            }

            mapEl.appendChild(cell);
        }
    });
}

function openCabanaModal(cabanaId, booked) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');

    if (booked) {
        body.innerHTML = `
      <div class="unavailable-info">
        <div class="unavail-icon">🚫</div>
        <h2 style="font-family:'Cinzel',serif;font-size:1.1rem;margin-bottom:0.5rem;">Cabana Unavailable</h2>
        <div class="modal-divider"></div>
        <p>This cabana has already been reserved by another guest. Please choose an available cabana from the map.</p>
      </div>
    `;
    } else {
        body.innerHTML = `
      <h2>Reserve Your Cabana</h2>
      <div class="modal-subtitle">A poolside sanctuary awaits you</div>
      <div class="modal-divider"></div>
      <div class="modal-error" id="booking-error"></div>
      <label for="room-input">Room Number</label>
      <input type="text" id="room-input" placeholder="e.g. 101" autocomplete="off" />
      <label for="name-input">Guest Name</label>
      <input type="text" id="name-input" placeholder="e.g. Alice Smith" autocomplete="off" />
      <button class="modal-btn" id="book-btn">Reserve Cabana</button>
    `;

        document.getElementById('book-btn').addEventListener('click', () => bookCabana(cabanaId));
        document.getElementById('room-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('name-input').focus();
        });
        document.getElementById('name-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') bookCabana(cabanaId);
        });

        setTimeout(() => document.getElementById('room-input').focus(), 50);
    }

    overlay.classList.add('active');
}

async function bookCabana(cabanaId) {
    const room = document.getElementById('room-input').value.trim();
    const guestName = document.getElementById('name-input').value.trim();
    const errorEl = document.getElementById('booking-error');
    const btn = document.getElementById('book-btn');

    errorEl.style.display = 'none';

    if (!room || !guestName) {
        errorEl.textContent = 'Please fill in both your room number and name.';
        errorEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Reserving…';

    try {
        const res = await fetch(`${API}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cabanaId,
                room,
                guestName
            }),
        });
        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Booking failed. Please try again.';
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Reserve Cabana';
            return;
        }

        const body = document.getElementById('modal-body');
        body.innerHTML = `
      <div class="modal-success">
        <div class="success-icon">🌴</div>
        <h3>Reservation Confirmed!</h3>
        <div class="modal-divider"></div>
        <p>Welcome, <strong>${data.guestName}</strong>.<br/>
        Your cabana has been reserved.<br/>
        Enjoy the pool at your leisure.</p>
      </div>
    `;

        const mapRes = await fetch(`${API}/map`);
        mapData = await mapRes.json();
        cabanaMap = {};
        mapData.cabanas.forEach(c => {
            cabanaMap[c.id] = c;
        });
        renderMap();
        updateStatus();

        setTimeout(closeModal, 2500);

    } catch (e) {
        errorEl.textContent = 'Network error. Please check your connection.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Reserve Cabana';
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

loadMap();