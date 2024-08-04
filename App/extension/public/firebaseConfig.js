import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'

const firebaseConfig = {
  apiKey: "AIzaSyBMxF0lP0MqZuXIvEWE8RIDYX1DLb-Uows",
  authDomain: "timer-734bc.firebaseapp.com",
  projectId: "timer-734bc",
  storageBucket: "timer-734bc.appspot.com",
  messagingSenderId: "190169259119",
  appId: "1:190169259119:web:8dc2d28d2a78ec5a4c419a"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
