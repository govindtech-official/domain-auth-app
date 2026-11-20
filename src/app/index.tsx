import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';

/** Entry route: send the user to the right place for their auth state. */
export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === 'signedIn' ? '/dashboard' : '/login'} />;
}
