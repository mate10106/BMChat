import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "bmchat-11489.firebaseapp.com",
  projectId: "bmchat-11489",
  storageBucket: "bmchat-11489.appspot.com",
  messagingSenderId: "116923953450",
  appId: "1:116923953450:web:7c73148a92bd8a99be2e53",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
