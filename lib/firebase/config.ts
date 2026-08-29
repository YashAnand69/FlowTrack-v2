import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your-api-key') &&
  !firebaseConfig.projectId.includes('your-project-id')
)

// Initialize Firebase safely for SSR/Client
const app = getApps().length === 0
  ? initializeApp(isFirebaseConfigured ? firebaseConfig : {
      apiKey: 'demo-api-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'flowtrack-demo',
      storageBucket: 'demo.appspot.com',
      messagingSenderId: '0000000000',
      appId: '1:0000000000:web:0000000000',
    })
  : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
