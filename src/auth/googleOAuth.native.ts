import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';
import { getRedirectError, parseUrlParams, type OAuthRedirectError } from './errors';

/**
 * iOS / Android: open Google sign-in in a secure system browser session
 * (ASWebAuthenticationSession / Custom Tabs, never an embedded WebView), then
 * exchange the returned PKCE code for a session.
 *
 * The redirect is `exp://.../--/auth/callback` in Expo Go and
 * `domainauth://auth/callback` in a development / production build.
 */
export async function startGoogleSignIn(): Promise<'success' | 'cancelled'> {
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase did not return an OAuth URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancelled';

  const params = parseUrlParams(result.url);
  const redirectError = getRedirectError(params);
  if (redirectError) throw redirectError;

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (exchangeError) throw exchangeError;
    return 'success';
  }

  // Fallback if the project is configured for the implicit flow.
  if (params.access_token && params.refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (sessionError) throw sessionError;
    return 'success';
  }

  throw new Error('No authorization code was returned.');
}

/** Native errors are returned from startGoogleSignIn directly. */
export function consumeRedirectError(): OAuthRedirectError | null {
  return null;
}
