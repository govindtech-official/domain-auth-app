/**
 * Public runtime configuration.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` at build time, but only when each
 * variable is accessed with a static, dotted name, so keep the accesses below
 * exactly in this form.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';
const ALLOWED_EMAIL_DOMAIN = process.env.EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? 'hbplus.fit';
// Optional, comma-separated: individual off-domain addresses allowed in for
// testing. Must match the rows in public.allowed_emails (supabase/schema.sql).
const ALLOWED_TEST_EMAILS = process.env.EXPO_PUBLIC_ALLOWED_TEST_EMAILS ?? '';

export const env = {
  supabaseUrl: SUPABASE_URL.trim(),
  supabaseKey: SUPABASE_KEY.trim(),
  allowedEmailDomain: ALLOWED_EMAIL_DOMAIN.trim().toLowerCase().replace(/^@/, ''),
  allowedTestEmails: String(ALLOWED_TEST_EMAILS)
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean),
} as const;

/** True when the Supabase project URL and public key are both present. */
export const isConfigured = env.supabaseUrl.length > 0 && env.supabaseKey.length > 0;

/** Env var names that are still missing, used by the setup screen. */
export const missingEnvVars: string[] = [
  !env.supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
  !env.supabaseKey && 'EXPO_PUBLIC_SUPABASE_KEY',
].filter((name): name is string => Boolean(name));
