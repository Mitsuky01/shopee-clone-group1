import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Anda bisa tetap menggunakan getAnalytics jika diperlukan di bagian lain
// import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase Anda (ini sudah benar)
const firebaseConfig = {
  apiKey: "AIzaSyBQ077yXgX1cWzAJLQ_pPDPDKe1NsFgNeM",
  authDomain: "shopee-clone-ac378.firebaseapp.com",
  projectId: "shopee-clone-ac378",
  storageBucket: "shopee-clone-ac378.appspot.com",
  messagingSenderId: "561787923994",
  appId: "1:561787923994:web:f0120142e682e40462eba3"
};

// Inisialisasi Firebase dengan aman untuk mencegah error di Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// PERUBAHAN 1: Inisialisasi layanan Authentication dan Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// PERUBAHAN 2: Ekspor 'auth' dan 'db' agar bisa digunakan di halaman lain
export { app, auth, db };
