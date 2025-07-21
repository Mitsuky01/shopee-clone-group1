import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBQ077yXgX1cWzAJLQ_pPDPDKe1NsFgNeM",
  authDomain: "shopee-clone-ac378.firebaseapp.com",
  projectId: "shopee-clone-ac378",
  storageBucket: "shopee-clone-ac378.appspot.com",
  messagingSenderId: "561787923994",
  appId: "1:561787923994:web:f0120142e682e40462eba3"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

const auth = getAuth(app)
const db = getFirestore(app)

let analytics
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { app, auth, db, analytics }
