import { supabase } from '@/lib/supabase';
import { getRedirectError, parseUrlParams, type OAuthRedirectError } from './errors';

/**
 * Web: full-page redirect to Google (via Supabase Auth). The browser comes
 * back to /auth/callback?code=..., where supabase-js (detectSessionInUrl)
 * exchanges the one-time code for a session using the stored PKCE verifier.
 */
export async function startGoogleSignIn(): Promise<'redirected'> {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // Always show the account chooser so users can switch to their work account.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  return 'redirected';
}

/**
 * Reads an OAuth error that Supabase/Google appended to the redirect URL
 * (e.g. when the server-side domain check rejected the account) and strips
 * it from the address bar so a refresh does not show it again.
 */
export function consumeRedirectError(): OAuthRedirectError | null {
  if (typeof window === 'undefined') return null;
  const error = getRedirectError(parseUrlParams(window.location.href));
  if (error) {
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }
  return error;
}
