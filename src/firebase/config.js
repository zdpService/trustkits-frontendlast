// src/firebase.js

// Import des fonctions Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxk5XeakH5_q4u1Ca8XQy39hwKakn8N78",
  authDomain: "trustkits-9afcc.firebaseapp.com",
  projectId: "trustkits-9afcc",
  storageBucket: "trustkits-9afcc.firebasestorage.app",
  messagingSenderId: "539095831217",
  appId: "1:539095831217:web:db636e8ed6146b790f4890",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services Firebase
export const db = getFirestore(app); // Firestore
export const auth = getAuth(app); // Authentification
export default app;
export { app };
