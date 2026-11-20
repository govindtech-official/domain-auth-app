import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

import { isConfigured } from '@/config/env';
import { supabase, type Profile, type Role } from '@/lib/supabase';
import { RESTRICTED_MESSAGE, isAllowedEmail } from './domain';
import { toAuthErrorMessage } from './errors';
import { consumeRedirectError, startGoogleSignIn } from './googleOAuth';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'misconfigured';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Where the profile came from: the `profiles` table, or the token as a fallback. */
  profileSource: 'database' | 'token' | null;
  role: Role;
  isAdmin: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_TIMEOUT_MS = 6000;

/**
 * Revokes the session server-side (refresh token invalidated) and always
 * clears the tokens stored on this device, even if the network call fails.
 */
async function revokeSession(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (!error) return;
  } catch {
    // fall through to local clear
  }
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
}

/** Builds a minimal profile from the Google identity when the DB is unavailable. */
function profileFromUser(user: User): Profile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: (user.email ?? '').toLowerCase(),
    full_name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    role: 'user',
    created_at: user.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isConfigured ? 'loading' : 'misconfigured');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileSource, setProfileSource] = useState<'database' | 'token' | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserId = useRef<string | null>(null);
  const profileLoad = useRef<Promise<void> | null>(null);

  const loadProfile = useCallback(async (user: User) => {
    // Don't keep the user on a spinner if the database is slow or unreachable.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('id', user.id)
      .abortSignal(controller.signal)
      .maybeSingle<Profile>();
    clearTimeout(timeout);

    if (dbError || !data) {
      // Table not created yet, or RLS denied: fall back to least privilege.
      if (dbError) console.warn('[auth] profile lookup failed:', dbError.message);
      setProfile(profileFromUser(user));
      setProfileSource('token');
      return;
    }
    setProfile(data);
    setProfileSource('database');
  }, []);

  /**
   * Single gate for every session the app ever sees (initial restore, OAuth
   * return, token refresh). A session for a non-allowed domain is revoked
   * before it is stored in React state, so no protected screen can render it.
   */
  const applySession = useCallback(
    async (next: Session | null) => {
      if (!next) {
        lastUserId.current = null;
        profileLoad.current = null;
        setSession(null);
        setProfile(null);
        setProfileSource(null);
        setStatus('signedOut');
        return;
      }

      if (!isAllowedEmail(next.user.email)) {
        await revokeSession();
        lastUserId.current = null;
        profileLoad.current = null;
        setSession(null);
        setProfile(null);
        setProfileSource(null);
        setError(RESTRICTED_MESSAGE);
        setStatus('signedOut');
        return;
      }

      setSession(next);
      // Initial restore and INITIAL_SESSION fire together: share one profile load
      // so neither marks the user signed in before the profile (and role) exists.
      if (lastUserId.current !== next.user.id || !profileLoad.current) {
        lastUserId.current = next.user.id;
        profileLoad.current = loadProfile(next.user);
      }
      await profileLoad.current;
      setStatus('signedIn');
    },
    [loadProfile],
  );

  useEffect(() => {
    if (!isConfigured) return;
    let mounted = true;

    const redirectError = consumeRedirectError();
    if (redirectError) setError(toAuthErrorMessage(redirectError));

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(toAuthErrorMessage(sessionError));
      void applySession(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      // Defer: calling other Supabase methods inside this callback can deadlock.
      setTimeout(() => {
        if (mounted) void applySession(next);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      const result = await startGoogleSignIn();
      // On web the page navigates away, so keep the loading state.
      if (result !== 'redirected') setIsSigningIn(false);
    } catch (e) {
      setError(toAuthErrorMessage(e));
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await revokeSession();
    } finally {
      setIsSigningOut(false);
      await applySession(null);
    }
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user);
  }, [session, loadProfile]);

  const clearError = useCallback(() => setError(null), []);

  // Signing in finished (or was abandoned) once we know the final status.
  useEffect(() => {
    if (status === 'signedIn' && Platform.OS === 'web') setIsSigningIn(false);
  }, [status]);

  const role: Role = profile?.role === 'admin' ? 'admin' : 'user';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      profileSource,
      role,
      isAdmin: status === 'signedIn' && role === 'admin',
      isSigningIn,
      isSigningOut,
      error,
      signInWithGoogle,
      signOut,
      clearError,
      refreshProfile,
    }),
    [
      status,
      session,
      profile,
      profileSource,
      role,
      isSigningIn,
      isSigningOut,
      error,
      signInWithGoogle,
      signOut,
      clearError,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
