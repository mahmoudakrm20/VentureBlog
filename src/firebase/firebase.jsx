// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYufIv5h3iHv--ZXpi83HsqWhNEHuorVs",
  authDomain: "reactblogproject-3abd0.firebaseapp.com",
  projectId: "reactblogproject-3abd0",
  storageBucket: "reactblogproject-3abd0.appspot.com",
  messagingSenderId: "721378642062",
  appId: "1:721378642062:web:86faeb322325b4f63a61df",
  measurementId: "G-QF2MF7NQZ6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, analytics, db, storage };
