import { postBooking } from './api.js';

export function openCabanaModal(cabanaId, booked, onBookingSuccess) {
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

        document.getElementById('book-btn').addEventListener('click', () => bookCabana(cabanaId, onBookingSuccess));
        document.getElementById('room-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('name-input').focus();
        });
        document.getElementById('name-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') bookCabana(cabanaId, onBookingSuccess);
        });

        setTimeout(() => document.getElementById('room-input').focus(), 50);
    }

    overlay.classList.add('active');
}

async function bookCabana(cabanaId, onBookingSuccess) {
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
        const { ok, data } = await postBooking(cabanaId, room, guestName);

        if (!ok) {
            errorEl.textContent = data.error || 'Booking failed. Please try again.';
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Reserve Cabana';
            return;
        }

        document.getElementById('modal-body').innerHTML = `
      <div class="modal-success">
        <div class="success-icon">🌴</div>
        <h3>Reservation Confirmed!</h3>
        <div class="modal-divider"></div>
        <p>Welcome, <strong>${data.guestName}</strong>.<br/>
        Your cabana has been reserved.<br/>
        Enjoy the pool at your leisure.</p>
      </div>
    `;

        await onBookingSuccess();
        setTimeout(closeModal, 2500);

    } catch (e) {
        errorEl.textContent = 'Network error. Please check your connection.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Reserve Cabana';
    }
}

export function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}
