import { auth, db } from './firebase.js';
import { logAction, checkAuth, formatDateTime } from './utils.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

checkAuth();

const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const detailsContent = document.getElementById('patient-details-content');
const patientHeader = document.getElementById('patient-header');
const reportsListDiv = document.getElementById('detail-reports-list');

let scheduleId = null;

function getScheduleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function displayData(data) {
    patientHeader.textContent = `Details for ${data.patientName || 'Patient'}`;
    
    document.getElementById('detail-datetime').textContent = formatDateTime(data.date, data.time);
    document.getElementById('detail-ot-id').textContent = data.otId || '-';
    document.getElementById('detail-anesthesia-type').textContent = data.anesthesiaType || '-';
    
    document.getElementById('detail-doctor').textContent = data.doctorName || '-';
    document.getElementById('detail-assistant-surgeon').textContent = data.assistantSurgeon || '-';
    document.getElementById('detail-anesthesiologist').textContent = data.anesthesiologistName || '-';
    document.getElementById('detail-nurses').textContent = data.nurses || '-';

    document.getElementById('detail-pre-op').textContent = data.preOpEvents || '-';
    document.getElementById('detail-post-op').textContent = data.postOpEvents || '-';

    document.getElementById('detail-remarks').textContent = data.doctorRemarks || '-';
    document.getElementById('detail-special-reqs').textContent = data.specialRequirements || '-';
}

async function loadAndDisplayReports(scheduleId) {
    const storage = getStorage();
    const reportsRef = ref(storage, `schedules/${scheduleId}/reports`);

    reportsListDiv.innerHTML = ''; // Clear previous content

    try {
        const res = await listAll(reportsRef);
        if (res.items.length === 0) {
            reportsListDiv.innerHTML = '<p>No reports uploaded.</p>';
            return;
        }

        res.items.forEach(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const link = document.createElement('a');
            link.href = url;
            link.textContent = itemRef.name;
            link.target = '_blank'; // Open in a new tab
            reportsListDiv.appendChild(link);
        });
    } catch (error) {
        console.error("Error listing reports: ", error);
        reportsListDiv.innerHTML = '<p>Could not load reports.</p>';
        logAction(`Error loading reports for schedule ${scheduleId}: ${error.message}`);
    }
}

async function loadPatientDetails() {
    scheduleId = getScheduleId();
    if (!scheduleId) {
        showError("No patient schedule ID provided.");
        return;
    }

    try {
        const scheduleRef = doc(db, "schedules", scheduleId);
        const docSnap = await getDoc(scheduleRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            displayData(data);
            // After displaying main data, load the associated reports
            loadAndDisplayReports(scheduleId); 
            detailsContent.classList.remove('hidden');
            logAction(`Viewed details for schedule: ${scheduleId}`);
        } else {
            showError("Schedule details not found. It may have been deleted.");
            logAction(`Failed to find schedule for viewing: ${scheduleId}`);
        }
    } catch (error) {
        console.error("[ERROR] Failed to load patient details:", error);
        showError("Failed to load patient details. Please try again.");
        logAction(`Error loading patient details ${scheduleId}: ${error.message}`);
    } finally {
        loadingMessage.style.display = 'none';
    }
}

function showError(message) {
    loadingMessage.style.display = 'none';
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        logAction('User logged out');
        window.location.href = '../../auth/login.html';
    });
});

document.addEventListener('DOMContentLoaded', loadPatientDetails);
