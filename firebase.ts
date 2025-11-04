// --- FILENAME: firebase.ts ---
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// VITAL: This is YOUR config from your Firebase project
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP-6U3Jo5MO3e9__bnvQSbLclb4p43rLc",
  authDomain: "my-habit-app-37dee.firebaseapp.com",
  projectId: "my-habit-app-37dee",
  storageBucket: "my-habit-app-37dee.firebasestorage.app",
  messagingSenderId: "311120390929",
  appId: "1:311120390929:web:571fd88a0843bcad8abab0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);