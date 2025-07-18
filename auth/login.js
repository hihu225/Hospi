// login.js
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from "../js/firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is admin
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    if (userData && userData.role === 'admin') {
      window.location.href = '../admin/add-schedule.html';
    } else {
      window.location.href = '../user/view-schedule.html';
    }
  } catch (error) {
    const friendlyMessage = getFriendlyLoginError(error.code);
errorMessage.textContent = friendlyMessage;

    errorMessage.classList.remove('hidden');
    console.error('Login failed:', error);
  }
});
function getFriendlyLoginError(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/internal-error":
      return "Something went wrong. Please try again.";
    default:
      return "Login failed. Please check your credentials.";
  }
}
