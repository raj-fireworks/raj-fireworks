import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-DfihT02J4gqOGGVSEsFjzvObGaOE0Wc",
  authDomain: "aj-fireworks.firebaseapp.com",
  projectId: "aj-fireworks",
  storageBucket: "aj-fireworks.appspot.com",
  messagingSenderId: "212861357188",
  appId: "1:212861357188:web:6310e8b6f59162e50124fc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc, onSnapshot };
