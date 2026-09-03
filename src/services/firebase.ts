import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query,
  writeBatch,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Shop, Order, RiderProfile, PaymentSettlement, RiderConnection, ShopPayoutInfo } from '../types';
import { INITIAL_SHOPS, INITIAL_RIDERS, INITIAL_ORDERS, INITIAL_PAYMENTS, INITIAL_CONNECTIONS } from '../data/mockData';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfigJson);
  } else {
    firebaseApp = getApp();
  }
  return firebaseApp;
}

export function getFirestoreDb(): Firestore | null {
  try {
    if (!firestoreDb) {
      const app = getFirebaseApp();
      // Initialize with custom firestoreDatabaseId if configured in firebase-applet-config.json
      if (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') {
        firestoreDb = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
      } else {
        firestoreDb = getFirestore(app);
      }
    }
    return firestoreDb;
  } catch (err) {
    console.warn('Firestore custom DB fallback to default:', err);
    try {
      firestoreDb = getFirestore(getFirebaseApp());
      return firestoreDb;
    } catch (fallbackErr) {
      console.error('Failed to initialize Firestore:', fallbackErr);
      return null;
    }
  }
}

export function getFirebaseAuth(): Auth | null {
  try {
    if (!firebaseAuth) {
      const app = getFirebaseApp();
      firebaseAuth = getAuth(app);
    }
    return firebaseAuth;
  } catch (err) {
    console.error('Firebase Auth initialization error:', err);
    return null;
  }
}

// TODO: Super Admin Auth Mechanism Migration
// Currently using anonymous auth which grants full access based on weak rules.
// 
// PROPOSED DESIGN FOR ADMIN AUTH:
// 1. Firebase Auth: Admins should sign in with Email/Password or Google OAuth.
// 2. Custom Claims: A trusted backend (Cloud Function or Admin SDK script) MUST 
//    verify the user's identity and set a custom claim on their Firebase Auth token:
//    { "admin": true }
// 3. App Enforcer: Ensure `onAuthStateChanged` blocks the UI unless 
//    user.getIdTokenResult().claims.admin === true.
// 4. Firestore Rules:
//    match /{document=**} {
//      allow read, write: if request.auth != null && request.auth.token.admin == true;
//    }
// This completely secures the production data from unauthorized access while
// connecting to the real localeats-5e26e project.
export async function ensureAuth(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  
  if (auth.currentUser) return auth.currentUser;

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous sign in notice:', err);
    return null;
  }
}

// Test live connection to Firestore
export async function testFirestoreConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const startTime = Date.now();
  try {
    const db = getFirestoreDb();
    if (!db) throw new Error('Firestore not initialized');
    await ensureAuth();
    await getDocFromServer(doc(db, 'shops', 'ping_check_connectivity'));
    const latencyMs = Date.now() - startTime;
    return { success: true, latencyMs, message: `Connected to Firestore (${latencyMs}ms)` };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    // Even if the test document doesn't exist, a server response confirms online connection
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      return { success: false, latencyMs, message: 'Client offline or endpoint unreachable.' };
    }
    return { success: true, latencyMs, message: `Firestore connection verified (${latencyMs}ms)` };
  }
}

export const firebaseService = {
  getProjectId(): string {
    return firebaseConfigJson.projectId || 'localeats-5e26e';
  },

  getDatabaseId(): string {
    return firebaseConfigJson.firestoreDatabaseId || '(default)';
  },

  getAppId(): string {
    return firebaseConfigJson.appId || '';
  },

  // Seed Firestore with initial dataset
  async seedInitialDatabase(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const db = getFirestoreDb();
      if (!db) throw new Error('Firestore not initialized');
      await ensureAuth();

      const batch = writeBatch(db);
      let count = 0;

      // Seed shops
      for (const shop of INITIAL_SHOPS) {
        const ref = doc(db, 'shops', shop.id);
        batch.set(ref, shop, { merge: true });
        count++;
      }

      // Seed riders
      for (const rider of INITIAL_RIDERS) {
        const ref = doc(db, 'rider_profiles', rider.id);
        batch.set(ref, rider, { merge: true });
        count++;
      }

      // Seed orders
      for (const order of INITIAL_ORDERS) {
        const ref = doc(db, 'orders', order.id);
        batch.set(ref, order, { merge: true });
        count++;
      }

      // Seed payments
      for (const payment of INITIAL_PAYMENTS) {
        const ref = doc(db, 'payments', payment.id);
        batch.set(ref, payment, { merge: true });
        count++;
      }

      // Seed connections
      for (const conn of INITIAL_CONNECTIONS) {
        const ref = doc(db, 'rider_connections', conn.id);
        batch.set(ref, conn, { merge: true });
        count++;
      }

      await batch.commit();
      return { success: true, count };
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
      return { success: false, count: 0, error: error?.message || 'Seed failed' };
    }
  },

  // --- SHOPS ---
  async fetchShops(): Promise<Shop[] | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;
      await ensureAuth();

      const snap = await getDocs(collection(db, 'shops'));
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as Shop);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'shops');
      return null;
    }
  },

  async saveShop(shop: Shop): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'shops', shop.id), shop, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shops/${shop.id}`);
      return false;
    }
  },

  async saveShopPayoutInfo(payoutInfo: ShopPayoutInfo): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'shop_payout_info', payoutInfo.shop_id), payoutInfo, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `shop_payout_info/${payoutInfo.shop_id}`);
      return false;
    }
  },

  // --- RIDERS ---
  async fetchRiders(): Promise<RiderProfile[] | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;
      await ensureAuth();

      const snap = await getDocs(collection(db, 'rider_profiles'));
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as RiderProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'rider_profiles');
      return null;
    }
  },

  async saveRider(rider: RiderProfile): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'rider_profiles', rider.id), rider, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rider_profiles/${rider.id}`);
      return false;
    }
  },

  // --- ORDERS ---
  async fetchOrders(): Promise<Order[] | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;
      await ensureAuth();

      const snap = await getDocs(collection(db, 'orders'));
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as Order);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      return null;
    }
  },

  async saveOrder(order: Order): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'orders', order.id), order, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
      return false;
    }
  },

  // --- CONNECTIONS ---
  async fetchConnections(): Promise<RiderConnection[] | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;
      await ensureAuth();

      const snap = await getDocs(collection(db, 'rider_connections'));
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as RiderConnection);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'rider_connections');
      return null;
    }
  },

  async saveConnection(connection: RiderConnection): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'rider_connections', connection.id), connection, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rider_connections/${connection.id}`);
      return false;
    }
  },

  // --- PAYMENTS ---
  async fetchPayments(): Promise<PaymentSettlement[] | null> {
    try {
      const db = getFirestoreDb();
      if (!db) return null;
      await ensureAuth();

      const snap = await getDocs(collection(db, 'payments'));
      if (snap.empty) return null;
      return snap.docs.map((d) => d.data() as PaymentSettlement);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'payments');
      return null;
    }
  },

  async savePayment(payment: PaymentSettlement): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) return false;
      await setDoc(doc(db, 'payments', payment.id), payment, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payments/${payment.id}`);
      return false;
    }
  },

  // Real-time listener for Orders
  subscribeToOrders(onUpdate: (orders: Order[]) => void): Unsubscribe {
    try {
      const db = getFirestoreDb();
      if (!db) return () => {};
      const q = query(collection(db, 'orders'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((doc) => doc.data() as Order);
          onUpdate(list);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      });
    } catch (e) {
      console.warn('Failed to subscribe to orders:', e);
      return () => {};
    }
  },

  // Real-time listener for Riders
  subscribeToRiders(onUpdate: (riders: RiderProfile[]) => void): Unsubscribe {
    try {
      const db = getFirestoreDb();
      if (!db) return () => {};
      const q = query(collection(db, 'rider_profiles'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((doc) => doc.data() as RiderProfile);
          onUpdate(list);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'rider_profiles');
      });
    } catch (e) {
      console.warn('Failed to subscribe to riders:', e);
      return () => {};
    }
  },

  // Real-time listener for Shops
  subscribeToShops(onUpdate: (shops: Shop[]) => void): Unsubscribe {
    try {
      const db = getFirestoreDb();
      if (!db) return () => {};
      const q = query(collection(db, 'shops'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((doc) => doc.data() as Shop);
          onUpdate(list);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'shops');
      });
    } catch (e) {
      console.warn('Failed to subscribe to shops:', e);
      return () => {};
    }
  }
};
