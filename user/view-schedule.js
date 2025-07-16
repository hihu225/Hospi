import { auth, db } from '../../js/firebase.js';
import { logAction, checkAuth, formatDateTime } from '../../js/utils.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


console.log("[Auth] Checking if user is logged in...");
checkAuth();

document.getElementById('logout-link').addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    logAction('User logged out');
    window.location.href = '../../auth/login.html';
  });
});

const scheduleBody = document.getElementById('schedule-body');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
let scheduleIdToDelete = null;

// Function to delete a schedule
async function deleteSchedule(scheduleId) {
  try {
    await deleteDoc(doc(db, "schedules", scheduleId));
    logAction(`Deleted schedule with ID: ${scheduleId}`);
    successMessage.textContent = 'Schedule deleted successfully.';
    successMessage.classList.remove('hidden');
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
    loadSchedules(); // Reload the schedule list
  } catch (error) {
    console.error("Error removing document: ", error);
    errorMessage.textContent = 'Failed to delete schedule. Please try again.';
    errorMessage.classList.remove('hidden');
    logAction(`Error deleting schedule: ${error.message}`);
  }
}

// Show confirmation modal
function showConfirmationModal(scheduleId) {
    scheduleIdToDelete = scheduleId;
    confirmationModal.classList.remove('hidden');
}

// Hide confirmation modal
function hideConfirmationModal() {
    scheduleIdToDelete = null;
    confirmationModal.classList.add('hidden');
}


async function loadSchedules() {
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
      scheduleBody.innerHTML = '<tr><td colspan="7">No upcoming operations scheduled</td></tr>';
      loadingMessage.style.display = 'none';
      return;
    }

    querySnapshot.forEach((doc) => {
      const schedule = doc.data();
      const scheduleId = doc.id;
      console.log("[Firestore] Schedule document data:", schedule);

      const row = document.createElement('tr');
      row.setAttribute('data-id', scheduleId);
      row.innerHTML = `
        <td>${formatDateTime(schedule.date, schedule.time)}</td>
        <td>${schedule.patientName}</td>
        <td>${schedule.doctorName}</td>
        <td>${schedule.otId}</td>
        <td>${schedule.anesthesia}</td>
        <td>${schedule.notes || '-'}</td>
        <td class="actions-cell">
            <button class="btn-action btn-modify" data-id="${scheduleId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-action btn-delete" data-id="${scheduleId}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </td>
      `;
      scheduleBody.appendChild(row);
    });

    loadingMessage.style.display = 'none';
    logAction('Fetched operation schedules');
    console.log("[Schedule] Finished rendering schedules.");
  } catch (error) {
    console.error('[ERROR] Failed to load schedules:', error);
    loadingMessage.style.display = 'none';
    errorMessage.textContent = 'Failed to load schedules. ' + error.message;
    errorMessage.classList.remove('hidden');
    logAction(`Failed to load schedules: ${error.message}`);
  }
}

// Event delegation for action buttons
scheduleBody.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-action');
    if (!target) return;

    const scheduleId = target.dataset.id;
    if (target.classList.contains('btn-modify')) {
        // Redirect to an edit page (you'll need to create this page)
        window.location.href = `../admin/edit-schedule.html?id=${scheduleId}`;
    } else if (target.classList.contains('btn-delete')) {
        showConfirmationModal(scheduleId);
    }
});

// Event listeners for modal buttons
confirmDeleteBtn.addEventListener('click', () => {
    if (scheduleIdToDelete) {
        deleteSchedule(scheduleIdToDelete);
    }
    hideConfirmationModal();
});

cancelDeleteBtn.addEventListener('click', () => {
    hideConfirmationModal();
});


document.addEventListener('DOMContentLoaded', () => {
  console.log("[DOM] Document loaded. Calling loadSchedules()...");
  loadSchedules();
});
