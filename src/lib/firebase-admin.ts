import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Transaction } from './types';

let adminApp: App;

// Initialize Firebase Admin (server-side)
export function getAdminApp() {
  if (!adminApp) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

export function getAdminDb() {
  const app = getAdminApp();
  return getFirestore(app);
}

// Save a new transaction to Firestore
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(transaction.userId);
  const transactionRef = userRef.collection('transactions').doc(transaction.id);

  await transactionRef.set({
    ...transaction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// Update transaction status
export async function updateTransactionStatus(
  userId: string,
  transactionId: string,
  status: Transaction['status'],
  boldTransactionId?: string
): Promise<void> {
  const db = getAdminDb();
  const transactionRef = db
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .doc(transactionId);

  const updateData: any = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (boldTransactionId) {
    updateData.boldTransactionId = boldTransactionId;
  }

  await transactionRef.update(updateData);
}

// Get a transaction by ID
export async function getTransaction(
  userId: string,
  transactionId: string
): Promise<Transaction | null> {
  const db = getAdminDb();
  const transactionRef = db
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .doc(transactionId);

  const doc = await transactionRef.get();
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Transaction;
}
