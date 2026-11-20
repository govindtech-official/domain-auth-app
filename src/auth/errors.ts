import { RESTRICTED_MESSAGE } from './domain';

/**
 * Parses query-string AND hash-fragment parameters from a URL. Supabase may
 * return OAuth results in either place, and React Native's built-in URL
 * implementation is incomplete, so this avoids depending on it.
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');

  const query =
    queryIndex >= 0 && (hashIndex < 0 || queryIndex < hashIndex)
      ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined)
      : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';

  for (const part of [query, hash]) {
    for (const pair of part.split('&')) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      const rawKey = eq >= 0 ? pair.slice(0, eq) : pair;
      const rawValue = eq >= 0 ? pair.slice(eq + 1) : '';
      try {
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
      } catch {
        params[rawKey] = rawValue;
      }
    }
  }
  return params;
}

export interface OAuthRedirectError {
  error: string;
  description?: string;
  code?: string;
}

/** Extracts an OAuth error (if any) from redirect parameters. */
export function getRedirectError(params: Record<string, string>): OAuthRedirectError | null {
  if (!params.error && !params.error_code) return null;
  return {
    error: params.error ?? params.error_code,
    description: params.error_description,
    code: params.error_code,
  };
}

/**
 * Turns any auth failure into a message that is safe and useful to show.
 *
 * When the server-side domain trigger (supabase/schema.sql) rejects a
 * sign-up, Supabase redirects back with
 * `error_description=Database error saving new user`, so that case maps to
 * the domain-restriction message as well.
 */
export function toAuthErrorMessage(input: unknown): string {
  const text = describe(input).toLowerCase();

  if (
    text.includes('access restricted') ||
    text.includes('official domain') ||
    text.includes('database error saving new user') ||
    text.includes('database error granting user')
  ) {
    return RESTRICTED_MESSAGE;
  }
  if (text.includes('access_denied') || text.includes('cancel')) {
    return 'Google sign-in was cancelled. Please try again.';
  }
  if (text.includes('network') || text.includes('failed to fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return 'Sign-in failed. Please try again or contact your administrator.';
}

function describe(input: unknown): string {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (input instanceof Error) return input.message;
  if (typeof input === 'object') {
    const o = input as Record<string, unknown>;
    return [o.error, o.code, o.description, o.message].filter(Boolean).join(' ');
  }
  return String(input);
}
