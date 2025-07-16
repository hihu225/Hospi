// utils.js
import { auth } from './firebase.js';

// Log actions
export function logAction(action) {
  const user = auth.currentUser;
  const userEmail = user ? user.email : 'anonymous';
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${userEmail}: ${action}`);
}

// Redirect if not logged in
export function checkAuth(requiredRole) {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = '/auth/login.html';
    } else {
      // In a real app, you would check user role here
      logAction(`Accessed ${window.location.pathname}`);
    }
  });
}

// Format date for display
export function formatDateTime(dateString, timeString) {
  const date = new Date(`${dateString}T${timeString}`);
  return date.toLocaleString();
}