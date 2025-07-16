// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6Ez-QXKI0O6t-2o9xlePaRMnJOgc3npQ",
  authDomain: "hospi-4ba00.firebaseapp.com",
  projectId: "hospi-4ba00",
  storageBucket: "hospi-4ba00.appspot.com", 
  messagingSenderId: "34339336108",
  appId: "1:34339336108:web:93be8758433ed3b7b71409",
  measurementId: "G-FRVNB69RF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
