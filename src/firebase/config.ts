import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro na autenticação com Google:', error);
    throw error;
  }
}

export async function registerWithEmailPassword(email: string, password: string, displayName: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user && displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  } catch (error) {
    console.error('Erro ao registar utilizador com email/password:', error);
    throw error;
  }
}

export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    console.error('Erro ao autenticar com email/password:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao terminar sessão:', error);
    throw error;
  }
}

// CRITICAL CONSTRAINT: Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Verifique a sua configuração do Firebase (cliente offline).');
    } else {
      console.warn('Conexão inicial Firestore verificada com aviso:', error);
    }
    return false;
  }
}

testFirestoreConnection();
