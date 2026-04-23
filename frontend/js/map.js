import { TILE_SIZE } from './config.js';

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

    if (count === 4) return { src: 'assets/arrowCrossing.png', rot: 0 };
    if (count === 3) {
        if (!W) return { src: 'assets/arrowSplit.png', rot: 0 };
        if (!E) return { src: 'assets/arrowSplit.png', rot: 180 };
        if (!N) return { src: 'assets/arrowSplit.png', rot: 90 };
        if (!S) return { src: 'assets/arrowSplit.png', rot: 270 };
    }
    if (count === 2) {
        if (N && S) return { src: 'assets/arrowStraight.png', rot: 0 };
        if (E && W) return { src: 'assets/arrowStraight.png', rot: 90 };
        if (N && E) return { src: 'assets/arrowCornerSquare.png', rot: 0 };
        if (S && E) return { src: 'assets/arrowCornerSquare.png', rot: 90 };
        if (S && W) return { src: 'assets/arrowCornerSquare.png', rot: 180 };
        if (N && W) return { src: 'assets/arrowCornerSquare.png', rot: 270 };
    }
    if (count === 1) {
        if (N) return { src: 'assets/arrowEnd.png', rot: 0 };
        if (E) return { src: 'assets/arrowEnd.png', rot: 270 };
        if (S) return { src: 'assets/arrowEnd.png', rot: 90 };
        if (W) return { src: 'assets/arrowEnd.png', rot: 90 };
    }

    return { src: 'assets/arrowStraight.png', rot: 0 };
}

export function renderMap(mapData, cabanaMap, onCabanaClick) {
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
                const { src, rot } = getPathTile(grid, r, c);
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

                const img = document.createElement('img');
                img.src = 'assets/cabana.png';
                cell.appendChild(img);

                cabanaIndex++;
                const tooltip = document.createElement('span');
                tooltip.className = 'cabana-tooltip';
                tooltip.textContent = `Cabana #${cabanaIndex}`;
                cell.appendChild(tooltip);

                cell.addEventListener('click', () => onCabanaClick(id, booked));
            }

            mapEl.appendChild(cell);
        }
    });
}
