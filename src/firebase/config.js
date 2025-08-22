import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB13KedKVSAhsmKQ_zO_XXLETK7xdY_0z4",
  authDomain: "flambeau-c6361.firebaseapp.com",
  projectId: "flambeau-c6361",
  storageBucket: "flambeau-c6361.firebasestorage.app",
  messagingSenderId: "97715588836",
  appId: "1:97715588836:web:b8d4b0bb4ebe19e9f826f1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
