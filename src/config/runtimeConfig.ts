import type { FirebaseOptions } from 'firebase/app';

export const EXPECTED_FIREBASE_PROJECT_ID = 'localeats-5e26e';

export class RuntimeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeConfigurationError';
  }
}

const requireEnvironmentValue = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new RuntimeConfigurationError(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getFirebaseClientConfig = (): FirebaseOptions => {
  const projectId = requireEnvironmentValue('VITE_FIREBASE_PROJECT_ID');

  if (projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
    throw new RuntimeConfigurationError(
      `VITE_FIREBASE_PROJECT_ID must be ${EXPECTED_FIREBASE_PROJECT_ID}.`,
    );
  }

  return {
    apiKey: requireEnvironmentValue('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnvironmentValue('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId,
    storageBucket: requireEnvironmentValue('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnvironmentValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnvironmentValue('VITE_FIREBASE_APP_ID'),
  };
};

export const getLocalEatsApiBaseUrl = (): string => {
  const rawUrl = requireEnvironmentValue('VITE_LOCALEATS_API_URL');

  try {
    const parsedUrl = new URL(rawUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('unsupported protocol');
    }

    if (parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
      throw new Error('credentials, query strings, and fragments are not supported');
    }

    return parsedUrl.toString().replace(/\/+$/, '');
  } catch {
    throw new RuntimeConfigurationError(
      'VITE_LOCALEATS_API_URL must be an absolute HTTP(S) URL without credentials, a query string, or a fragment.',
    );
  }
};

export const validateRuntimeConfiguration = (): void => {
  getFirebaseClientConfig();
  getLocalEatsApiBaseUrl();
};
