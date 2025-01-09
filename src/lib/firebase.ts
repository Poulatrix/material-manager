import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9h_l67HpuuVYf9u6vWWyyDo4mwGIONY8",
  authDomain: "materialstock-fbb71.firebaseapp.com",
  projectId: "materialstock-fbb71",
  storageBucket: "materialstock-fbb71.firebasestorage.app",
  messagingSenderId: "835843249875",
  appId: "1:835843249875:web:860bfa79d2c1a8ca62a626"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);