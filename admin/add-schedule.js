import { auth, db } from '../../js/firebase.js';
import { logAction, checkAuth } from '../../js/utils.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Check authentication and role
checkAuth('admin');

// Logout
document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    logAction('User logged out');
    window.location.href = '../../auth/login.html';
  });
});

// Form submission
document.getElementById('schedule-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const patientName = document.getElementById('patient-name').value;
  const doctorName = document.getElementById('doctor-name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const otId = document.getElementById('ot-id').value;
  const anesthesia = document.getElementById('anesthesia').value;
  const notes = document.getElementById('notes').value;

  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  errorMessage.classList.add('hidden');
  successMessage.classList.add('hidden');

  try {
    await addDoc(collection(db, 'schedules'), {
      patientName,
      doctorName,
      date,
      time,
      otId,
      anesthesia,
      notes,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'unknown'
    });

    successMessage.textContent = "Operation schedule added successfully!";
    successMessage.classList.remove('hidden');
    logAction('New operation schedule added');
    document.getElementById('schedule-form').reset();
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');
    logAction(`Failed to add schedule: ${error.message}`);
  }
});
