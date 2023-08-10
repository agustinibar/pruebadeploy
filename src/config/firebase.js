import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC_YrDe0cR-pUS5vk_QvZ6Z28f_lylJCJ8",
  authDomain: "pruebadeploy-8f459.firebaseapp.com",
  projectId: "pruebadeploy-8f459",
  storageBucket: "pruebadeploy-8f459.appspot.com",
  messagingSenderId: "191809447425",
  appId: "1:191809447425:web:30b9622277fc63f85b4200",
  measurementId: "G-KK3JWKX9LE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
  