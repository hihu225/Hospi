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
const assistantSurgeonInput = document.getElementById('assistant-surgeon');
const anesthesiaTypeInput = document.getElementById('anesthesia-type');
const anesthesiologistNameInput = document.getElementById('anesthesiologist-name');
const nursesInput = document.getElementById('nurses');
const preOpEventsInput = document.getElementById('pre-op-events');
const postOpEventsInput = document.getElementById('post-op-events');
const doctorRemarksInput = document.getElementById('doctor-remarks');
const specialRequirementsInput = document.getElementById('special-requirements');

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
            assistantSurgeonInput.value = data.assistantSurgeon || '';
            anesthesiaTypeInput.value = data.anesthesiaType || '';
            anesthesiologistNameInput.value = data.anesthesiologistName || '';
            nursesInput.value = data.nurses || '';
            preOpEventsInput.value = data.preOpEvents || '';
            postOpEventsInput.value = data.postOpEvents || '';
            doctorRemarksInput.value = data.doctorRemarks || '';
            specialRequirementsInput.value = data.specialRequirements || '';

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
    
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    const updatedData = {
        patientName: patientNameInput.value,
        doctorName: doctorNameInput.value,
        date: dateInput.value,
        time: timeInput.value,
        otId: otIdInput.value,
        assistantSurgeon: assistantSurgeonInput.value,
        anesthesiaType: anesthesiaTypeInput.value,
        anesthesiologistName: anesthesiologistNameInput.value,
        nurses: nursesInput.value,
        preOpEvents: preOpEventsInput.value,
        postOpEvents: postOpEventsInput.value,
        doctorRemarks: doctorRemarksInput.value,
        specialRequirements: specialRequirementsInput.value,
        updatedAt: serverTimestamp()
    };

    try {
        const scheduleRef = doc(db, "schedules", scheduleId);
        await updateDoc(scheduleRef, updatedData);

        console.log(`[Edit] Successfully updated schedule ID: ${scheduleId}`);
        showSuccess("Schedule updated successfully! Redirecting...");
        logAction(`Updated schedule: ${scheduleId}`);

        setTimeout(() => {
            window.location.href = '../user/view-schedule.html';
        }, 2000);

    } catch (error) {
        console.error("[ERROR] Failed to update schedule:", error);
        showError("Failed to update schedule. Please try again.");
        logAction(`Error updating schedule ${scheduleId}: ${error.message}`);
    }
});

function showError(message) {
    loadingMessage.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
}

document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        logAction('User logged out');
        window.location.href = '../../auth/login.html';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOM] Document loaded. Calling loadScheduleData()...");
    loadScheduleData();
});
