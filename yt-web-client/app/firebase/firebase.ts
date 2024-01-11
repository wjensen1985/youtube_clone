// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFcrVKZ5l5hdvWxuU1KupsRAunOPUnteI",
  authDomain: "yt-clone-a3be3.firebaseapp.com",
  projectId: "yt-clone-a3be3",
  appId: "1:196510588861:web:bbb42b23342b73d9bf7cd4",
  measurementId: "G-JY76T0DH5F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

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
