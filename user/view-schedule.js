import { auth, db } from '../../js/firebase.js';
import { logAction, checkAuth, formatDateTime } from '../../js/utils.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Check if user is logged in
console.log("[Auth] Checking if user is logged in...");
checkAuth();

document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    logAction('User logged out');
    window.location.href = '../../auth/login.html';
  });
});

async function loadSchedules() {
  const scheduleBody = document.getElementById('schedule-body');
  const loadingMessage = document.getElementById('loading-message');
  const errorMessage = document.getElementById('error-message');

  console.log("[Schedule] Starting to load schedules...");

  try {
    const today = new Date().toISOString().split('T')[0];
    console.log("[Schedule] Today's date:", today);

    const q = query(
      collection(db, 'schedules'),
      where('date', '>=', today),
      orderBy('date')
    );
    console.log("[Firestore] Query prepared:", q);

    const querySnapshot = await getDocs(q);
    console.log("[Firestore] Query result received. Documents fetched:", querySnapshot.size);

    scheduleBody.innerHTML = '';

    if (querySnapshot.empty) {
      console.warn("[Firestore] No upcoming operations scheduled.");
      scheduleBody.innerHTML = '<tr><td colspan="6">No upcoming operations scheduled</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const schedule = doc.data();
      console.log("[Firestore] Schedule document data:", schedule);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDateTime(schedule.date, schedule.time)}</td>
        <td>${schedule.patientName}</td>
        <td>${schedule.doctorName}</td>
        <td>${schedule.otId}</td>
        <td>${schedule.anesthesia}</td>
        <td>${schedule.notes || '-'}</td>
      `;
      scheduleBody.appendChild(row);
    });

    loadingMessage.style.display = 'none';
    logAction('Fetched operation schedules');
    console.log("[Schedule] Finished rendering schedules.");
  } catch (error) {
    console.error('[ERROR] Failed to load schedules:', error);
    loadingMessage.style.display = 'none';
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');
    logAction(`Failed to load schedules: ${error.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("[DOM] Document loaded. Calling loadSchedules()...");
  loadSchedules();
});
