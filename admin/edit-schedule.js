import { auth, db } from '../../js/firebase.js';
import { logAction, checkAuth } from '../../js/utils.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Check if user is authenticated
checkAuth('admin');

// UI Elements
const scheduleForm = document.getElementById('schedule-form');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Form Fields
const patientNameInput = document.getElementById('patient-name');
const doctorNameInput = document.getElementById('doctor-name');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const otIdInput = document.getElementById('ot-id');
const anesthesiaInput = document.getElementById('anesthesia');
const notesInput = document.getElementById('notes');

let scheduleId = null;

// Function to get schedule ID from URL
function getScheduleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Function to load schedule data into the form
async function loadScheduleData() {
    scheduleId = getScheduleId();
    if (!scheduleId) {
        showError("No schedule ID provided.");
        return;
    }

    console.log(`[Edit] Loading data for schedule ID: ${scheduleId}`);
    try {
        const scheduleRef = doc(db, "schedules", scheduleId);
        const docSnap = await getDoc(scheduleRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("[Edit] Schedule data found:", data);

            // Populate the form fields
            patientNameInput.value = data.patientName || '';
            doctorNameInput.value = data.doctorName || '';
            dateInput.value = data.date || '';
            timeInput.value = data.time || '';
            otIdInput.value = data.otId || '';
            anesthesiaInput.value = data.anesthesia || '';
            notesInput.value = data.notes || '';

            // Show form and hide loading message
            scheduleForm.classList.remove('hidden');
            loadingMessage.style.display = 'none';
            logAction(`Loaded schedule for editing: ${scheduleId}`);
        } else {
            showError("Schedule not found. It may have been deleted.");
            logAction(`Failed to find schedule for editing: ${scheduleId}`);
        }
    } catch (error) {
        console.error("[ERROR] Failed to load schedule:", error);
        showError("Failed to load schedule data. Please try again.");
        logAction(`Error loading schedule ${scheduleId}: ${error.message}`);
    }
}

// Handle form submission for updating the schedule
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!scheduleId) {
        showError("Cannot update schedule without an ID.");
        return;
    }
    
    // Hide previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    const updatedData = {
        patientName: patientNameInput.value,
        doctorName: doctorNameInput.value,
        date: dateInput.value,
        time: timeInput.value,
        otId: otIdInput.value,
        anesthesia: anesthesiaInput.value,
        notes: notesInput.value,
        updatedAt: serverTimestamp() // Add an 'updatedAt' timestamp
    };

    try {
        const scheduleRef = doc(db, "schedules", scheduleId);
        await updateDoc(scheduleRef, updatedData);

        console.log(`[Edit] Successfully updated schedule ID: ${scheduleId}`);
        showSuccess("Schedule updated successfully! Redirecting...");
        logAction(`Updated schedule: ${scheduleId}`);

        // Redirect back to the view page after a short delay
        setTimeout(() => {
            window.location.href = '../user/view-schedule.html';
        }, 2000);

    } catch (error) {
        console.error("[ERROR] Failed to update schedule:", error);
        showError("Failed to update schedule. Please try again.");
        logAction(`Error updating schedule ${scheduleId}: ${error.message}`);
    }
});

// Utility functions to show messages
function showError(message) {
    loadingMessage.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
}

// Logout functionality
document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        logAction('User logged out');
        window.location.href = '../../auth/login.html';
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOM] Document loaded. Calling loadScheduleData()...");
    loadScheduleData();
});
