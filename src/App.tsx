import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { AlertTriangle, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { ControlCenterShell } from './components/ControlCenterShell';
import { validateRuntimeConfiguration } from './config/runtimeConfig';
import { AdminApiError, adminApi, type AdminIdentity } from './services/adminApi';
import { observeAdminAuth, signInAdmin, signOutAdmin } from './services/adminAuth';

type AccessState =
  | { status: 'auth-loading' }
  | { status: 'signed-out' }
  | { status: 'verifying-admin'; user: User }
  | { status: 'authorized'; user: User; admin: AdminIdentity }
  | { status: 'unauthorized'; user: User; message: string }
  | { status: 'forbidden'; user: User; message: string }
  | { status: 'error'; user: User | null; message: string; httpStatus: number | null };

const getSafeLoginMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String(error.code);

    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-email' ||
      code === 'auth/user-disabled' ||
      code === 'auth/user-not-found' ||
      code === 'auth/wrong-password'
    ) {
      return 'The email or password was not accepted.';
    }

    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait before trying again.';
    }
  }

  return 'Firebase sign-in failed. Please try again.';
};

const getSafeAuthObserverMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Firebase authentication could not be initialized.';

const LoadingScreen = ({ message }: { message: string }) => (
  <main className="min-h-screen bg-[#F8F9FA] px-6 py-12 text-[#1A1A1A]">
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
      <div className="w-full rounded-sm border border-gray-200 bg-white p-8 text-center shadow-lg">
        <LoaderCircle aria-hidden="true" className="mx-auto mb-4 h-8 w-8 animate-spin text-[#FF5A36]" />
        <p className="text-sm font-semibold text-gray-700" role="status">
          {message}
        </p>
      </div>
    </div>
  </main>
);

interface SignInScreenProps {
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}

const SignInScreen = ({ submitting, errorMessage, onSubmit }: SignInScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-12 text-[#1A1A1A]">
      <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">
        <section
          className="w-full rounded-sm border border-gray-200 bg-white p-8 shadow-xl"
          aria-labelledby="sign-in-heading"
        >
          <BrandLogo variant="full" size={190} className="mb-8" />
          <div className="mb-6 flex items-start gap-3">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#FF5A36]" />
            <div>
              <h1 id="sign-in-heading" className="text-xl font-extrabold tracking-tight">
                Super Admin sign in
              </h1>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Sign in with your LocalEats Firebase account. Access is granted only after server authorization.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700"
                htmlFor="admin-email"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700"
                htmlFor="admin-password"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#FF5A36] focus:ring-2 focus:ring-[#FF5A36]/20 disabled:bg-gray-100"
              />
            </div>

            {errorMessage ? (
              <p
                className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#FF5A36] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#e04a29] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound aria-hidden="true" className="h-4 w-4" />
              )}
              {submitting ? 'Signing in…' : 'Sign in securely'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

interface AccessDeniedScreenProps {
  title: string;
  message: string;
  user: User | null;
  canRetry: boolean;
  busy: boolean;
  onRetry: () => void;
  onSignOut: () => Promise<void>;
}

const AccessDeniedScreen = ({
  title,
  message,
  user,
  canRetry,
  busy,
  onRetry,
  onSignOut,
}: AccessDeniedScreenProps) => (
  <main className="min-h-screen bg-[#F8F9FA] px-6 py-12 text-[#1A1A1A]">
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
      <section
        className="w-full rounded-sm border border-amber-200 bg-white p-8 shadow-xl"
        aria-labelledby="access-state-heading"
      >
        <AlertTriangle aria-hidden="true" className="mb-4 h-9 w-9 text-amber-600" />
        <h1 id="access-state-heading" className="text-xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-700">{message}</p>
        {user?.email ? <p className="mt-2 text-xs text-gray-500">Signed in as {user.email}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {canRetry ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={busy}
              className="rounded-sm bg-[#FF5A36] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              Retry authorization
            </button>
          ) : null}
          {user ? (
            <button
              type="button"
              onClick={() => void onSignOut()}
              disabled={busy}
              className="rounded-sm border border-gray-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-800 disabled:opacity-60"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </section>
    </div>
  </main>
);

export default function App() {
  const [access, setAccess] = useState<AccessState>({ status: 'auth-loading' });
  const [signInPending, setSignInPending] = useState(false);
  const [signOutPending, setSignOutPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const verificationSequence = useRef(0);

  const verifyAdmin = useCallback(async (user: User) => {
    const sequence = ++verificationSequence.current;
    setAccess({ status: 'verifying-admin', user });

    try {
      const admin = await adminApi.getMe();

      if (verificationSequence.current === sequence) {
        setAccess({ status: 'authorized', user, admin });
      }
    } catch (error) {
      if (verificationSequence.current !== sequence) {
        return;
      }

      if (error instanceof AdminApiError) {
        if (error.status === 401) {
          setAccess({
            status: 'unauthorized',
            user,
            message: 'The LocalEats API rejected this Firebase session. Sign out and sign in again.',
          });
          return;
        }

        if (error.status === 403) {
          setAccess({
            status: 'forbidden',
            user,
            message: 'This Firebase account is not provisioned as an active LocalEats super_admin.',
          });
          return;
        }

        setAccess({
          status: 'error',
          user,
          message: error.message,
          httpStatus: error.status,
        });
        return;
      }

      setAccess({
        status: 'error',
        user,
        message: error instanceof Error ? error.message : 'Admin authorization failed.',
        httpStatus: null,
      });
    }
  }, []);

  useEffect(() => {
    try {
      validateRuntimeConfiguration();
      return observeAdminAuth(
        (user) => {
          if (!user) {
            verificationSequence.current += 1;
            setAccess({ status: 'signed-out' });
            return;
          }

          void verifyAdmin(user);
        },
        (error) => {
          verificationSequence.current += 1;
          setAccess({
            status: 'error',
            user: null,
            message: getSafeAuthObserverMessage(error),
            httpStatus: null,
          });
        },
      );
    } catch (error) {
      setAccess({
        status: 'error',
        user: null,
        message: getSafeAuthObserverMessage(error),
        httpStatus: null,
      });
      return undefined;
    }
  }, [verifyAdmin]);

  const handleSignIn = async (email: string, password: string) => {
    setLoginError(null);
    setSignInPending(true);

    try {
      await signInAdmin(email, password);
    } catch (error) {
      setLoginError(getSafeLoginMessage(error));
    } finally {
      setSignInPending(false);
    }
  };

  const handleSignOut = async () => {
    const signedInUser = 'user' in access ? access.user : null;
    verificationSequence.current += 1;
    setSignOutPending(true);

    try {
      await signOutAdmin();
    } catch {
      setAccess({
        status: 'error',
        user: signedInUser,
        message: 'Firebase sign-out failed. Please retry.',
        httpStatus: null,
      });
    } finally {
      setSignOutPending(false);
    }
  };

  const handleAuthorizationFailure = useCallback((status: 401 | 403) => {
    verificationSequence.current += 1;
    setAccess((current) => {
      if (current.status !== 'authorized') return current;

      if (status === 401) {
        return {
          status: 'unauthorized',
          user: current.user,
          message: 'The LocalEats API rejected this Firebase session. Sign out and sign in again.',
        };
      }

      return {
        status: 'forbidden',
        user: current.user,
        message: 'This Firebase account is not provisioned as an active LocalEats super_admin.',
      };
    });
  }, []);

  if (access.status === 'auth-loading') {
    return <LoadingScreen message="Checking Firebase authentication…" />;
  }

  if (access.status === 'signed-out') {
    return (
      <SignInScreen submitting={signInPending} errorMessage={loginError} onSubmit={handleSignIn} />
    );
  }

  if (access.status === 'verifying-admin') {
    return <LoadingScreen message="Verifying Super Admin authorization with the LocalEats API…" />;
  }

  if (access.status === 'authorized') {
    return (
      <ControlCenterShell
        admin={access.admin}
        signOutPending={signOutPending}
        onSignOut={handleSignOut}
        onAuthorizationFailure={handleAuthorizationFailure}
      />
    );
  }

  if (access.status === 'unauthorized') {
    return (
      <AccessDeniedScreen
        title="Session not authorized"
        message={access.message}
        user={access.user}
        canRetry
        busy={signOutPending}
        onRetry={() => void verifyAdmin(access.user)}
        onSignOut={handleSignOut}
      />
    );
  }

  if (access.status === 'forbidden') {
    return (
      <AccessDeniedScreen
        title="Super Admin access denied"
        message={access.message}
        user={access.user}
        canRetry
        busy={signOutPending}
        onRetry={() => void verifyAdmin(access.user)}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <AccessDeniedScreen
      title={access.httpStatus ? `Admin API error (${access.httpStatus})` : 'Configuration or server error'}
      message={access.message}
      user={access.user}
      canRetry={access.user !== null}
      busy={signOutPending}
      onRetry={() => {
        if (access.user) {
          void verifyAdmin(access.user);
        }
      }}
      onSignOut={handleSignOut}
    />
  );
}
