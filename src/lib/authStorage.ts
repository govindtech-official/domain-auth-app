/**
 * Session storage for the web build.
 *
 * Passing `undefined` lets supabase-js use `window.localStorage`, the standard
 * for a static SPA (there is no server to hold an httpOnly cookie). Risk is
 * reduced by: PKCE flow (no tokens in the URL), short-lived access tokens with
 * refresh-token rotation, no third-party scripts, and React's default output
 * escaping (XSS protection).
 */
export const authStorage = undefined;
export const storageLabel = 'Browser storage (PKCE)';
