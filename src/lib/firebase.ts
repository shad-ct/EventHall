import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNpdB-bGz1MLBDFMQ9GDqKTj-_9krWRTw",
  authDomain: "events-fc01b.firebaseapp.com",
  projectId: "events-fc01b",
  storageBucket: "events-fc01b.firebasestorage.app",
  messagingSenderId: "821493260837",
  appId: "1:821493260837:web:c33933d41d3888fa6fd5cc",
  measurementId: "G-HBC521ZFDT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Force long-polling / disable streaming to avoid QUIC/HTTP3 network issues in some browsers/networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
