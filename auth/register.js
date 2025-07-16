import { auth, db } from '../js/firebase.js';
import { logAction } from '../js/utils.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const name = document.getElementById('name').value;
  const role = document.getElementById('role').value;
  
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  
  // Reset messages
  errorMessage.classList.add('hidden');
  successMessage.classList.add('hidden');
  
  // Validate passwords match
  if (password !== confirmPassword) {
    errorMessage.textContent = "Passwords don't match";
    errorMessage.classList.remove('hidden');
    return;
  }
  
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save additional user data in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      role,
      createdAt: serverTimestamp()
    });
    
    successMessage.textContent = "Registration successful! You can now login.";
    successMessage.classList.remove('hidden');
    logAction('New user registered');
    
    // Clear form
    document.getElementById('register-form').reset();
  } catch (error) {
    const friendlyMessage = getFriendlyErrorMessage(error.code);
errorMessage.textContent = friendlyMessage;
    errorMessage.classList.remove('hidden');
    logAction(`Registration failed: ${error.message}`);
  }
});
function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/missing-password":
      return "Please enter a password.";
    case "auth/internal-error":
      return "Something went wrong. Please try again later.";
    default:
      return "Registration failed. Please try again.";
  }
}
