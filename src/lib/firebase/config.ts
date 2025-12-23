import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCT-lXPqlD0ocUQeEaKavoU7JvbqBE9uSo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "adv-labs.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "adv-labs",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "adv-labs.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "227032080106",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:227032080106:web:b11927d925a3937fe4c193"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app

