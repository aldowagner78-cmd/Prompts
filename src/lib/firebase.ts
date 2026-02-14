import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC2P52KF_NjEQtb84VYxLUnSOm17IpqwjU",
    authDomain: "prompt-master-app-2026.firebaseapp.com",
    projectId: "prompt-master-app-2026",
    storageBucket: "prompt-master-app-2026.firebasestorage.app",
    messagingSenderId: "1006146058579",
    appId: "1:1006146058579:web:c279bde67b20b5878749a6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
