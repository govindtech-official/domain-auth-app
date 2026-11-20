import { env } from '@/config/env';

/** Exact message required by the assignment for non-domain accounts. */
export const RESTRICTED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@/, '');
}

/**
 * Returns the lower-cased domain part of an email address, or null when the
 * value is not a well-formed `local@domain` address. Values with more than one
 * "@" (e.g. `me@gmail.com@hbplus.fit`) are rejected instead of guessed at.
 */
export function getEmailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const value = email.trim().toLowerCase();
  if (/\s/.test(value)) return null;

  const parts = value.split('@');
  if (parts.length !== 2) return null;

  const [local, domain] = parts;
  if (!local || !domain || !domain.includes('.')) return null;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return null;
  return domain;
}

/**
 * Domain check used everywhere on the client. The match is exact: a
 * look-alike such as `hbplus.fit.evil.com` or a subdomain such as
 * `mail.hbplus.fit` is NOT accepted.
 */
export function isAllowedEmail(
  email: string | null | undefined,
  allowedDomain: string = env.allowedEmailDomain,
): boolean {
  const domain = getEmailDomain(email);
  const allowed = normalizeDomain(allowedDomain);
  return domain !== null && allowed.length > 0 && domain === allowed;
}
