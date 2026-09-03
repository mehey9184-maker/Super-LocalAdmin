import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type NextOrObserver,
  type User,
} from 'firebase/auth';
import {
  EXPECTED_FIREBASE_PROJECT_ID,
  RuntimeConfigurationError,
  getFirebaseClientConfig,
} from '../config/runtimeConfig';

const ADMIN_FIREBASE_APP_NAME = 'localeats-super-admin';

let adminAuth: Auth | undefined;

const getAdminFirebaseApp = (): FirebaseApp => {
  const incompatibleApp = getApps().find(
    (app) => app.options.projectId && app.options.projectId !== EXPECTED_FIREBASE_PROJECT_ID,
  );

  if (incompatibleApp) {
    throw new RuntimeConfigurationError(
      `Refusing to initialize Super Admin beside Firebase project ${incompatibleApp.options.projectId}.`,
    );
  }

  const existingAdminApp = getApps().find(
    (app) => app.options.projectId === EXPECTED_FIREBASE_PROJECT_ID,
  );
  return existingAdminApp ?? initializeApp(getFirebaseClientConfig(), ADMIN_FIREBASE_APP_NAME);
};

export const getAdminAuth = (): Auth => {
  if (!adminAuth) {
    const app = getAdminFirebaseApp();

    if (app.options.projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
      throw new RuntimeConfigurationError(
        `Super Admin Firebase must use ${EXPECTED_FIREBASE_PROJECT_ID}.`,
      );
    }

    adminAuth = getAuth(app);
  }

  return adminAuth;
};

export const observeAdminAuth = (
  onUserChanged: NextOrObserver<User>,
  onError: (error: Error) => void,
): (() => void) => onAuthStateChanged(getAdminAuth(), onUserChanged, onError);

export const signInAdmin = (email: string, password: string) =>
  signInWithEmailAndPassword(getAdminAuth(), email.trim(), password);

export const signOutAdmin = (): Promise<void> => signOut(getAdminAuth());
