import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check as per system instructions
async function testConnection() {
  try {
    // Attempting to read a dummy doc to verify connection
    await getDocFromServer(doc(db, '_internal_', 'connectivity-check'));
    console.log("Firebase connection verified.");
  } catch (error: any) {
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Firebase connection failed: Please check your configuration and internet connection.");
    } else if (error.code === 'permission-denied') {
      console.log("Firebase connection active (Received expected Permission Denied).");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
