/// <reference types="jest" />
import { RESTRICTED_MESSAGE, getEmailDomain, isAllowedEmail } from '../domain';
import { getRedirectError, parseUrlParams, toAuthErrorMessage } from '../errors';

const DOMAIN = 'hbplus.fit';

describe('isAllowedEmail', () => {
  it.each([
    'example@hbplus.fit',
    'Example@HBPlus.FIT',
    '  first.last@hbplus.fit  ',
    'first+tag@hbplus.fit',
  ])('allows %s', (email) => {
    expect(isAllowedEmail(email, DOMAIN)).toBe(true);
  });

  it.each([
    ['personal account', 'example@gmail.com'],
    ['look-alike suffix', 'example@hbplus.fit.evil.com'],
    ['look-alike prefix', 'example@nothbplus.fit'],
    ['subdomain', 'example@mail.hbplus.fit'],
    ['double @ spoof', 'example@gmail.com@hbplus.fit'],
    ['domain in local part', 'hbplus.fit@gmail.com'],
    ['no local part', '@hbplus.fit'],
    ['whitespace inside', 'exa mple@hbplus.fit'],
    ['empty', ''],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s (%s)', (_label, email) => {
    expect(isAllowedEmail(email as string | null | undefined, DOMAIN)).toBe(false);
  });

  it('accepts the configured domain with a leading @', () => {
    expect(isAllowedEmail('a@hbplus.fit', '@HBPLUS.fit')).toBe(true);
  });

  it('rejects everything when no domain is configured', () => {
    expect(isAllowedEmail('a@hbplus.fit', '', [])).toBe(false);
  });
});

describe('isAllowedEmail with individually allowed test emails', () => {
  const extras = ['tester@gmail.com'];

  it('allows a listed address on another domain, ignoring case and spaces', () => {
    expect(isAllowedEmail('tester@gmail.com', DOMAIN, extras)).toBe(true);
    expect(isAllowedEmail('  Tester@GMAIL.com ', DOMAIN, extras)).toBe(true);
  });

  it('still allows the domain alongside the listed address', () => {
    expect(isAllowedEmail('someone@hbplus.fit', DOMAIN, extras)).toBe(true);
  });

  it.each([
    ['other address on the same domain', 'someone-else@gmail.com'],
    ['listed address as a prefix', 'tester@gmail.com.evil.com'],
    ['double @ spoof', 'x@hbplus.fit@tester@gmail.com'],
  ])('rejects %s (%s)', (_label, email) => {
    expect(isAllowedEmail(email, DOMAIN, extras)).toBe(false);
  });

  it('allows nothing extra when the list is empty', () => {
    expect(isAllowedEmail('tester@gmail.com', DOMAIN, [])).toBe(false);
  });
});

describe('getEmailDomain', () => {
  it('lower-cases and trims', () => {
    expect(getEmailDomain(' A@HBPLUS.FIT ')).toBe('hbplus.fit');
  });
  it('returns null for malformed domains', () => {
    expect(getEmailDomain('a@localhost')).toBeNull();
    expect(getEmailDomain('a@hbplus..fit')).toBeNull();
  });
});

describe('OAuth redirect handling', () => {
  it('parses query and hash parameters', () => {
    const params = parseUrlParams('https://app.test/auth/callback?code=abc%20123#state=x&foo=a+b');
    expect(params).toEqual({ code: 'abc 123', state: 'x', foo: 'a b' });
  });

  it('detects the server-side domain rejection and maps it to the required message', () => {
    const params = parseUrlParams(
      'https://app.test/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user',
    );
    const error = getRedirectError(params);
    expect(error).not.toBeNull();
    expect(toAuthErrorMessage(error)).toBe(RESTRICTED_MESSAGE);
  });

  it('maps a cancelled consent screen to a friendly message', () => {
    expect(toAuthErrorMessage({ error: 'access_denied' })).toMatch(/cancelled/i);
  });

  it('returns null when there is no error', () => {
    expect(getRedirectError(parseUrlParams('https://app.test/auth/callback?code=1'))).toBeNull();
  });
});
