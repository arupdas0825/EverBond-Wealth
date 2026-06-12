import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, deleteUser } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { generatePersonalId } from "./everbondId";

let app = null;
let auth = null;
let db = null;
let storage = null;
let initError = null;

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = [];
const configErrors = [];

requiredEnvVars.forEach(key => {
  const value = import.meta.env[key];
  if (!value) {
    missingVars.push(key);
  } else {
    if (value.trim() !== value) {
      configErrors.push(`Environment variable ${key} has leading or trailing whitespace.`);
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      configErrors.push(`Environment variable ${key} has accidental surrounding quotes.`);
    }
    if (value === 'undefined') {
      configErrors.push(`Environment variable ${key} has string value 'undefined'.`);
    }
  }
});

const sanitize = (val) => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

const firebaseConfig = {
  apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: sanitize(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID)
};

if (missingVars.length > 0) {
  initError = {
    type: 'MISSING_ENV_VARS',
    message: `Missing required environment variables: ${missingVars.join(', ')}`,
    details: missingVars
  };
  console.error("Firebase Initialization Guard Failed: ", initError.message);
} else if (configErrors.length > 0) {
  initError = {
    type: 'MALFORMED_ENV_VARS',
    message: `Malformed environment variables detected:\n${configErrors.join('\n')}`,
    details: configErrors
  };
  console.error("Firebase Initialization Guard Failed: ", initError.message);
} else {
  try {
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API Key is empty or invalid.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("FIRESTORE INIT SUCCESS");
  } catch (error) {
    initError = {
      type: 'INITIALIZATION_FAILED',
      message: `Firebase failed to initialize: ${error.message}`,
      details: [error.stack || error.message]
    };
    console.error("Firebase Initialization Failed: ", error);
  }
}

export { app, auth, db, storage, initError };

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

/**
 * Enterprise-grade account and data scrub.
 * Deletes user's document in Firestore and deletes Auth record in Firebase Auth.
 */
export async function deleteUserAccountAndData(user) {
  if (!user) return;
  const userDocRef = doc(db, 'users', user.uid);
  try {
    await deleteDoc(userDocRef);
    console.log("FIRESTORE USER DOCUMENT DELETED SUCCESSFULLY");
  } catch (err) {
    console.error("Firestore user document deletion failed:", err);
  }
  try {
    await deleteUser(user);
    console.log("FIREBASE AUTH USER DELETED SUCCESSFULLY");
  } catch (err) {
    console.error("Firebase Auth user account deletion failed:", err);
    throw err;
  }
}

