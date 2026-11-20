import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { FullScreenLoader } from '@/components/ui';

/**
 * OAuth return URL (web: https://<site>/auth/callback, native: deep link).
 * By the time this renders, AuthProvider has already exchanged the code and
 * run the domain check, so we only route onward. Errors are shown on /login.
 */
export default function AuthCallback() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenLoader label="Completing sign-in…" />;
  return <Redirect href={status === 'signedIn' ? '/dashboard' : '/login'} />;
}
