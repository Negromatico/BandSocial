// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAS9p4Ifg_gxA6EfTj5pWoQ9vK-KKOfzw0',
  authDomain: 'bandas-f9c77.firebaseapp.com',
  projectId: 'bandas-f9c77',
  storageBucket: 'bandas-f9c77.appspot.com', // Corregido
  messagingSenderId: '1040136309254',
  appId: '1:1040136309254:web:3454ff467b23236e1fd187',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
