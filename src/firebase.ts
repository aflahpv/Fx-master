import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCP3JMP4sHEafmW85tFkL5KquVwh3vqORE",
  authDomain: "fxmaster-715bc.firebaseapp.com",
  projectId: "fxmaster-715bc",
  storageBucket: "fxmaster-715bc.firebasestorage.app",
  messagingSenderId: "23709176574",
  appId: "1:23709176574:web:c47ca5d0178fbcbed6cbaf",
  measurementId: "G-ZB0BHTBBWW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface SubscriptionStatus {
  active: boolean;
  expiresAt: number | null;
}

export async function getSubscriptionStatus(docId: string): Promise<SubscriptionStatus> {
  if (!docId) return { active: false, expiresAt: null };
  const ref = doc(db, 'subscriptions', docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { active: false, expiresAt: null };
  const data = snap.data();
  const expiresAt = data.expiresAt ?? null;
  const active = expiresAt !== null && expiresAt > Date.now();
  return { active, expiresAt };
}

export function watchSubscriptionStatus(
  docId: string,
  callback: (status: SubscriptionStatus) => void
) {
  if (!docId) {
    callback({ active: false, expiresAt: null });
    return () => {};
  }
  const ref = doc(db, 'subscriptions', docId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback({ active: false, expiresAt: null });
      return;
    }
    const data = snap.data();
    const expiresAt = data.expiresAt ?? null;
    const active = expiresAt !== null && expiresAt > Date.now();
    callback({ active, expiresAt });
  });
}
