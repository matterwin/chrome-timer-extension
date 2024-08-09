import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export const PROVIDER = new GoogleAuthProvider();

globalThis.addEventListener('message', function({data}) {
  if (data.initAuth) {
    signInWithPopup(FIREBASE_AUTH, PROVIDER)
      .then(sendResponse)
      .catch(sendResponse)
  }
});
