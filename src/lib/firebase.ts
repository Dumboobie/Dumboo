import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocFromServer,
  getDoc,
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, MonthlyBudget, UserProfile } from '../types/finance';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline or connecting.");
      return false;
    }
    // Permissions error or missing doc is normal for test doc
    return true;
  }
}

// Auth helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

export async function logoutUser() {
  return await firebaseSignOut(auth);
}

// Sync user profile
export async function syncUserProfile(user: User) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'ผู้ใช้งาน Dumboo',
      photoURL: user.photoURL || '',
      currency: 'THB',
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Transaction operations
export function subscribeUserTransactions(
  userId: string, 
  onData: (transactions: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/transactions`;
  const q = collection(db, 'users', userId, 'transactions');
  
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Transaction);
      });
      // Sort in memory by date descending then createdAt
      list.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

export async function saveTransaction(userId: string, transaction: Transaction) {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(docRef, transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeTransaction(userId: string, transactionId: string) {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Budget operations
export function subscribeMonthlyBudget(
  userId: string,
  yearMonth: string,
  onData: (budget: MonthlyBudget | null) => void
) {
  const path = `users/${userId}/budgets/${yearMonth}`;
  const docRef = doc(db, 'users', userId, 'budgets', yearMonth);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as MonthlyBudget);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveMonthlyBudget(userId: string, yearMonth: string, targetBudget: number) {
  const path = `users/${userId}/budgets/${yearMonth}`;
  try {
    const budgetDoc: MonthlyBudget = {
      id: yearMonth,
      userId,
      yearMonth,
      targetBudget,
      updatedAt: new Date().toISOString()
    };
    const docRef = doc(db, 'users', userId, 'budgets', yearMonth);
    await setDoc(docRef, budgetDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
