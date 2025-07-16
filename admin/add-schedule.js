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

  // Get all form values
  const patientName = document.getElementById('patient-name').value;
  const doctorName = document.getElementById('doctor-name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const otId = document.getElementById('ot-id').value;
  const assistantSurgeon = document.getElementById('assistant-surgeon').value;
  const anesthesiaType = document.getElementById('anesthesia-type').value;
  const anesthesiologistName = document.getElementById('anesthesiologist-name').value;
  const nurses = document.getElementById('nurses').value;
  const preOpEvents = document.getElementById('pre-op-events').value;
  const postOpEvents = document.getElementById('post-op-events').value;
  const doctorRemarks = document.getElementById('doctor-remarks').value;
  const specialRequirements = document.getElementById('special-requirements').value;
  // Note: File uploads require Firebase Storage and are more complex. 
  // This example will not handle the actual file upload, just the reference.

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
      assistantSurgeon,
      anesthesiaType,
      anesthesiologistName,
      nurses,
      preOpEvents,
      postOpEvents,
      doctorRemarks,
      specialRequirements,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'unknown'
    });

    successMessage.textContent = "Operation schedule added successfully!";
    successMessage.classList.remove('hidden');
    logAction('New operation schedule added');
    document.getElementById('schedule-form').reset();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);

  } catch (error) {
    errorMessage.textContent = "Failed to add schedule: " + error.message;
    errorMessage.classList.remove('hidden');
    logAction(`Failed to add schedule: ${error.message}`);
  }
});
