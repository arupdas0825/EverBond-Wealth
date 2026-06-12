import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { generatePersonalId } from "./everbondId";

const firebaseConfig = {
  apiKey: "AIzaSyDOxUlBBtg6uUKPquGczqphLRIcgs14uFM",
  authDomain: "everbond-wealth.firebaseapp.com",
  projectId: "everbond-wealth",
  storageBucket: "everbond-wealth.firebasestorage.app",
  messagingSenderId: "357631027776",
  appId: "1:357631027776:web:f6a6b41a783e332fa64da5",
  measurementId: "G-R1Z1X5P97E"
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

