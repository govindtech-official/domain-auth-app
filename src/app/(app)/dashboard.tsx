import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/auth/AuthProvider';
import { getEmailDomain } from '@/auth/domain';
import { HeroBackdrop } from '@/components/HeroBackdrop';
import { Icon, type IconName } from '@/components/Icon';
import { CountUp, HoverLift, Reveal, Shimmer, Spin, WordReveal } from '@/components/Motion';
import { SecurityScan, type Check } from '@/components/SecurityScan';
import { SessionTimer } from '@/components/SessionTimer';
import { Avatar, Button, Card, IconTile, InfoRow } from '@/components/ui';
import { formatDate, formatTime, greeting, shortId, timeAgo } from '@/lib/format';
import { breakpoints, colors, font, fonts, glassBlur, radius, spacing } from '@/theme';

export default function DashboardScreen() {
  const { user, profile, profileSource, session, role, isAdmin } = useAuth();
  const { width } = useWindowDimensions();
  const isPhone = width < breakpoints.tablet;
  const [heroW, setHeroW] = useState(0);

  const email = profile?.email ?? '';
  const domain = getEmailDomain(email) ?? '';
  const provider = (user?.app_metadata?.provider as string | undefined) ?? 'google';
  const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);

  // Memoised on primitives so a background token refresh doesn't restart the scan.
  const checks = useMemo<Check[]>(
    () => [
      {
        icon: 'fingerprint',
        title: 'Google identity verified',
        detail: `Signed in with ${providerLabel} OAuth 2.0 (authorization code + PKCE)`,
        ok: true,
      },
      { icon: 'globe', title: 'Domain restriction passed', detail: `${email} matches the @${domain} policy`, ok: true },
      {
        icon: 'shieldCheck',
        title: 'Server-side sign-up gate',
        detail: 'A database trigger rejects accounts from any other domain',
        ok: true,
      },
      {
        icon: 'database',
        title: 'Row-level security',
        detail:
          profileSource === 'database'
            ? 'Your profile is readable only by you and admins'
            : 'Database profile unavailable. Run supabase/schema.sql',
        ok: profileSource === 'database',
      },
      {
        icon: 'lock',
        title: 'Secure token storage',
        detail:
          Platform.OS === 'web'
            ? 'Short-lived access token, rotated refresh token'
            : 'Encrypted with AES-256, key in Keychain / Keystore',
        ok: true,
      },
    ],
    [providerLabel, email, domain, profileSource],
  );

  if (!user || !profile || !session) return null;

  const name = profile.full_name ?? email.split('@')[0];
  const firstName = name.split(' ')[0];
  const issuedAt = session.expires_at && session.expires_in ? session.expires_at - session.expires_in : undefined;
  const daysWithAccess = Math.max(1, Math.round((Date.now() - new Date(profile.created_at).getTime()) / 864e5));

  const stats: {
    icon: IconName;
    tone: 'admin' | 'primary' | 'success' | 'neutral';
    label: string;
    value: string | number;
    hint: string;
  }[] = [
    {
      icon: role === 'admin' ? 'crown' : 'user',
      tone: role === 'admin' ? 'admin' : 'primary',
      label: 'Access level',
      value: role === 'admin' ? 'Admin' : 'User',
      hint: profileSource === 'database' ? 'Role from database' : 'Default role',
    },
    { icon: 'globe', tone: 'success', label: 'Organization', value: `@${domain}`, hint: 'Verified domain' },
    { icon: 'key', tone: 'neutral', label: 'Sign-in method', value: providerLabel, hint: 'OAuth 2.0 · PKCE' },
    { icon: 'calendar', tone: 'neutral', label: 'Days with access', value: daysWithAccess, hint: `Since ${formatDate(profile.created_at)}` },
  ];

  const nameSize = isPhone ? 26 : 34;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.page}>
        {/* ---------- Hero ---------- */}
        <Reveal distance={20} scale>
          <View style={[styles.hero, isPhone && styles.heroPhone]} onLayout={(e) => setHeroW(e.nativeEvent.layout.width)}>
            <HeroBackdrop id="dash-hero" />
            <Shimmer width={heroW} every={5200} band={220} color="rgba(255,255,255,0.06)" />
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <View style={styles.heroIdentity}>
                  <OrbitAvatar name={name} uri={profile.avatar_url} size={isPhone ? 58 : 74} />
                  <View style={styles.heroText}>
                    <Reveal delay={200} distance={8}>
                      <Text style={styles.heroEyebrow}>{greeting().toUpperCase()}</Text>
                    </Reveal>
                    <WordReveal
                      delay={260}
                      lineHeight={nameSize * 1.15}
                      style={[styles.heroName, { fontSize: nameSize }]}
                      lines={[
                        [
                          { text: `${firstName},` },
                          { text: 'welcome back', style: [styles.heroSerif, { fontSize: nameSize * 1.1 }] },
                        ],
                      ]}
                    />
                    <Reveal delay={600} distance={6}>
                      <Text style={styles.heroEmail} selectable numberOfLines={1}>
                        {email}
                      </Text>
                    </Reveal>
                  </View>
                </View>
                <View style={styles.heroChips}>
                  {[
                    { icon: (role === 'admin' ? 'crown' : 'user') as IconName, label: role === 'admin' ? 'Admin' : 'User', accent: role === 'admin' ? '#C4B5FD' : colors.mint },
                    { icon: 'shieldCheck' as IconName, label: 'Domain verified', accent: colors.mint },
                    { icon: 'key' as IconName, label: `${providerLabel} SSO`, accent: '#93C5FD' },
                  ].map((c, i) => (
                    <Reveal key={c.label} delay={700 + i * 90} distance={8} scale>
                      <HeroChip icon={c.icon} label={c.label} accent={c.accent} />
                    </Reveal>
                  ))}
                </View>
              </View>
              <Reveal delay={450} distance={16} style={isPhone ? styles.fullWidth : undefined}>
                <SessionTimer expiresAt={session.expires_at} lifetime={session.expires_in} fullWidth={isPhone} />
              </Reveal>
            </View>
          </View>
        </Reveal>

        {/* ---------- Stats ---------- */}
        <View style={styles.stats}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={250 + i * 90} style={[styles.statWrap, isPhone && styles.statWrapPhone]}>
              <HoverLift>
                <View style={[styles.stat, isPhone && styles.statPhone]}>
                  <IconTile name={s.icon} tone={s.tone} size={isPhone ? 34 : 40} />
                  <View style={styles.statText}>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    {typeof s.value === 'number' ? (
                      <CountUp value={s.value} style={styles.statValue} delay={500 + i * 90} />
                    ) : (
                      <Text style={styles.statValue} numberOfLines={1}>
                        {s.value}
                      </Text>
                    )}
                    <Text style={styles.statHint}>{s.hint}</Text>
                  </View>
                </View>
              </HoverLift>
            </Reveal>
          ))}
        </View>

        {/* ---------- Main grid ---------- */}
        <View style={styles.grid}>
          <Reveal delay={450} style={styles.colMain}>
            <SecurityScan checks={checks} compact={isPhone} startDelay={900} />
          </Reveal>

          <View style={styles.colSide}>
            {isAdmin && (
              <Reveal delay={520}>
                <HoverLift>
                  <AdminPromo />
                </HoverLift>
              </Reveal>
            )}

            <Reveal delay={600}>
              <Card title="Account" icon="user">
                <InfoRow icon="user" label="Full name" value={profile.full_name ?? '—'} />
                <InfoRow icon="mail" label="Email" value={email} />
                <InfoRow icon="key" label="User ID" value={shortId(user.id)} />
                <InfoRow icon="globe" label="Provider" value={providerLabel} last />
              </Card>
            </Reveal>

            <Reveal delay={680}>
              <Card title="Recent activity" icon="activity">
                <Timeline
                  items={[
                    { title: 'Signed in', meta: `${formatTime(user.last_sign_in_at)} · ${timeAgo(user.last_sign_in_at)}`, color: colors.primary },
                    { title: 'Access token issued', meta: issuedAt ? `${formatTime(issuedAt)} · ${timeAgo(issuedAt)}` : '—', color: '#0EA5E9' },
                    { title: 'Account created', meta: formatDate(profile.created_at), color: colors.admin },
                  ]}
                />
              </Card>
            </Reveal>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/** Avatar with a slowly orbiting gradient ring and an "online" dot. */
function OrbitAvatar({ name, uri, size }: { name: string; uri: string | null; size: number }) {
  const outer = size + 10;
  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      <Spin duration={7000} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#6EE7B7', '#2DD4BF', '#8B5CF6', 'rgba(139,92,246,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: outer, height: outer, borderRadius: outer / 2 }}
        />
      </Spin>
      <View style={{ padding: 3, borderRadius: size, backgroundColor: '#0A1A20' }}>
        <Avatar name={name} uri={uri} size={size - 2} />
      </View>
      <View style={styles.onlineDot} />
    </View>
  );
}

function AdminPromo() {
  const [w, setW] = useState(0);
  return (
    <View style={styles.adminCard} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <LinearGradient colors={['#3B0764', '#6D28D9', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Shimmer width={w} every={3800} band={160} color="rgba(255,255,255,0.14)" />
      <View style={styles.adminIcon}>
        <Icon name="crown" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.adminTitle}>
        Admin <Text style={styles.adminSerif}>console</Text>
      </Text>
      <Text style={styles.adminBody}>Review every member and promote or demote roles.</Text>
      <View style={styles.adminBtn}>
        <Button label="Open console" variant="secondary" iconRight="arrowRight" onPress={() => router.navigate('/admin')} />
      </View>
    </View>
  );
}

function HeroChip({ icon, label, accent }: { icon: IconName; label: string; accent: string }) {
  return (
    <View style={[styles.heroChip, glassBlur]}>
      <Icon name={icon} size={13} color={accent} strokeWidth={2.3} />
      <Text style={styles.heroChipText}>{label}</Text>
    </View>
  );
}

function Timeline({ items }: { items: { title: string; meta: string; color: string }[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <Reveal key={it.title} delay={900 + i * 140} distance={8}>
          <View style={styles.tlRow}>
            <View style={styles.tlRail}>
              <View style={[styles.tlDot, { borderColor: it.color }]} />
              {i < items.length - 1 && <View style={styles.tlLine} />}
            </View>
            <View style={styles.tlBody}>
              <Text style={styles.tlTitle}>{it.title}</Text>
              <Text style={styles.tlMeta}>{it.meta}</Text>
            </View>
          </View>
        </Reveal>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  page: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  fullWidth: { width: '100%' },

  hero: { borderRadius: 28, overflow: 'hidden', padding: 32 },
  heroPhone: { padding: 20, borderRadius: 22 },
  heroContent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xl },
  heroLeft: { flex: 1, minWidth: 260, gap: spacing.xl },
  heroIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg + 4 },
  onlineDot: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34D399',
    borderWidth: 3,
    borderColor: '#0A1F24',
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  heroEyebrow: { ...font.label, color: colors.mint },
  heroName: { fontFamily: fonts.extrabold, letterSpacing: -0.9, color: colors.inkText },
  heroSerif: { fontFamily: fonts.serif, color: colors.mint, letterSpacing: -0.3 },
  heroEmail: { ...font.body, color: colors.inkMuted },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroChipText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkText },

  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  statWrap: { flexGrow: 1, flexShrink: 1, flexBasis: 220 },
  statWrapPhone: { flexBasis: 140 },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.lg + 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPhone: { flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 14 },
  statText: { flex: 1, minWidth: 0 },
  statLabel: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.textMuted },
  statValue: { fontFamily: fonts.extrabold, fontSize: 19, lineHeight: 25, color: colors.text, letterSpacing: -0.3 },
  statHint: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textSubtle },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, alignItems: 'flex-start' },
  colMain: { flexGrow: 1.4, flexShrink: 1, flexBasis: 440, minWidth: 280 },
  colSide: { flexGrow: 1, flexShrink: 1, flexBasis: 320, minWidth: 280, gap: spacing.xl },

  adminCard: { borderRadius: radius.xl, overflow: 'hidden', padding: spacing.xl, gap: 6 },
  adminIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  adminTitle: { ...font.h2, fontSize: 22, color: colors.white },
  adminSerif: { fontFamily: fonts.serif, fontSize: 25, color: '#DDD6FE' },
  adminBody: { ...font.small, color: 'rgba(255,255,255,0.78)' },
  adminBtn: { marginTop: spacing.lg, alignSelf: 'flex-start' },

  tlRow: { flexDirection: 'row', gap: 14 },
  tlRail: { width: 14, alignItems: 'center' },
  tlDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3, backgroundColor: colors.surface, marginTop: 4 },
  tlLine: { flex: 1, width: 2, backgroundColor: '#EEF1F5', marginVertical: 4 },
  tlBody: { flex: 1, paddingBottom: 18 },
  tlTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  tlMeta: { ...font.small, color: colors.textMuted },
});
