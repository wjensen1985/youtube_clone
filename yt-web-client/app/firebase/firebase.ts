// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebaseConfig from './config';

import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";

import { getFunctions } from "firebase/functions";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const functions = getFunctions();

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with teh user's credentials.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}


/**
 * Siigns the user out.
 * @returns a promise that resolves when the user is signed out.
 */
export function signOut(){
    return auth.signOut();
}

/**
 * Tigger a callback when the user auth state changes.
 * @returns a function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
