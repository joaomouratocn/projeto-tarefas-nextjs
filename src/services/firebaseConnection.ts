import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyABOWlLLc85cIoONKvoVw5udu5QjBPKfbA",
    authDomain: "taskapp-7b865.firebaseapp.com",
    projectId: "taskapp-7b865",
    storageBucket: "taskapp-7b865.firebasestorage.app",
    messagingSenderId: "561381893443",
    appId: "1:561381893443:web:d8e99c90a1f1bc21eb3bf6"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };