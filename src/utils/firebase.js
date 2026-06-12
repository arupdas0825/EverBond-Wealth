import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { generatePersonalId } from "./everbondId";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log("FIRESTORE INIT SUCCESS");

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');

/**
 * Creates or retrieves the Firestore user document for a given user.
 * Guarantees no duplicates and logs status at each step.
 */
export async function createUserDocument(user, fullName = '', providerId = 'password') {
  if (!user) return null;
  const userDocRef = doc(db, 'users', user.uid);
  
  try {
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const existingData = userSnap.data();
      console.log("USER DOCUMENT FOUND:", existingData);
      return existingData;
    }
  } catch (readErr) {
    console.warn("Could not read user document before creation (ignoring to attempt write):", readErr.code, readErr.message);
  }

  console.log("CREATING USER DOCUMENT");
  const data = {
    uid: user.uid,
    ebId: generatePersonalId(),
    fullName: fullName || user.displayName || 'User',
    email: user.email || '',
    authProvider: providerId,
    mode: '',
    country: '',
    age: '',
    createdAt: new Date().toISOString(),
    onboardingCompleted: false
  };

  try {
    await setDoc(userDocRef, data);
    console.log("USER DOCUMENT CREATED");
    return data;
  } catch (err) {
    console.error("Firestore write failed (exact error code):", err.code, err.message);
    throw err;
  }
}

