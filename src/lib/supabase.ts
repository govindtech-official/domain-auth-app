import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';
import { authStorage } from './authStorage';

export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

/**
 * Single Supabase client for the whole app.
 *
 * - flowType "pkce": the OAuth redirect only carries a one-time code that is
 *   exchanged for tokens using a verifier kept on this device.
 * - detectSessionInUrl only on web, where the browser returns to /auth/callback.
 * - When env vars are missing we still create a client with placeholders so
 *   imports never crash; AuthProvider shows a setup screen instead of using it.
 */
export const supabase = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseKey || 'missing-key',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  },
);

// On native, only refresh tokens while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
