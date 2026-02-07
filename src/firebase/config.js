import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxk5XeakH5_q4u1Ca8XQy39hwKakn8N78",
  authDomain: "trustkits-9afcc.firebaseapp.com",
  projectId: "trustkits-9afcc",
  storageBucket: "trustkits-9afcc.firebasestorage.app",
  messagingSenderId: "539095831217",
  appId: "1:539095831217:web:db636e8ed6146b790f4890",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebaseConfig };
export default app;
