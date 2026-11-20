import { useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { Grain, Spotlight } from '@/components/Atmosphere';
import { AuroraBackground } from '@/components/AuroraBackground';
import { BrandMark } from '@/components/BrandMark';
import { DomainGate } from '@/components/DomainGate';
import { GoogleButton } from '@/components/GoogleButton';
import { Icon, type IconName } from '@/components/Icon';
import { Reveal, ScrambleText, Tilt, WordReveal, useShake } from '@/components/Motion';
import { ErrorAlert } from '@/components/ui';
import { env } from '@/config/env';
import { breakpoints, colors, font, fonts, glassBlur, radius, shadow, spacing } from '@/theme';

const TRUST: { icon: IconName; label: string }[] = [
  { icon: 'key', label: 'OAuth 2.0 · PKCE' },
  { icon: 'globe', label: 'Domain lock' },
  { icon: 'database', label: 'Row-level security' },
  { icon: 'lock', label: 'Encrypted' },
];

/** Gradient-filled text on web; solid accent colour on native. */
const gradientText: TextStyle =
  Platform.OS === 'web'
    ? ({
        backgroundImage: 'linear-gradient(92deg, #6EE7B7 0%, #2DD4BF 50%, #A78BFA 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        paddingRight: 6,
      } as unknown as TextStyle)
    : { color: colors.mint };

export default function LoginScreen() {
  const { signInWithGoogle, isSigningIn, error, clearError } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoints.desktop;
  const isPhone = width < breakpoints.tablet;
  const domain = env.allowedEmailDomain;
  const { style: shakeStyle, shake } = useShake();

  useEffect(() => {
    if (error) shake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const displaySize = isWide ? 60 : 40;
  const headline = (
    <WordReveal
      delay={isWide ? 150 : 100}
      lineHeight={displaySize * 1.08}
      style={[styles.display, { fontSize: displaySize, letterSpacing: isWide ? -2 : -1.2 }]}
      lines={[
        [{ text: 'One sign-in.' }],
        [{ text: 'Only your team.', style: [styles.serif, { fontSize: displaySize * 1.08 }, gradientText] }],
      ]}
    />
  );

  const steps = ['Choose your Google account', `We verify it ends with @${domain}`, 'You land on your secure dashboard'];

  const card = (
    <View style={[styles.card, isPhone && styles.cardPhone]}>
      <View style={styles.cardChip}>
        <Icon name="fingerprint" size={13} color={colors.primary} />
        <Text style={styles.cardChipText}>Single sign-on</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        Welcome <Text style={styles.titleSerif}>back</Text>
      </Text>
      <Text style={styles.subtitle}>
        Sign in with your{' '}
        <ScrambleText text={`@${domain}`} style={styles.domain} delay={700} />
        {' '}Google account to access the workspace.
      </Text>

      {error && (
        <View style={styles.alert}>
          <ErrorAlert message={error} onDismiss={clearError} animatedStyle={shakeStyle} />
        </View>
      )}

      <GoogleButton onPress={signInWithGoogle} loading={isSigningIn} />

      <View style={styles.steps}>
        <Text style={styles.stepsLabel}>HOW IT WORKS</Text>
        {steps.map((s, i) => (
          <Reveal key={s} delay={900 + i * 120} distance={8}>
            <View style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          </Reveal>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Icon name="shieldCheck" size={15} color={colors.textSubtle} />
        <Text style={styles.cardFooterText}>Personal and non-company accounts are blocked automatically.</Text>
      </View>

      <Link href="/privacy" style={styles.privacyLink}>
        Privacy policy
      </Link>
    </View>
  );

  const trust = (
    <View style={styles.trust}>
      {TRUST.map((t, i) => (
        <Reveal key={t.label} delay={(isWide ? 900 : 700) + i * 80} distance={8}>
          <View style={[styles.trustChip, glassBlur]}>
            <Icon name={t.icon} size={13} color={colors.mint} />
            <Text style={styles.trustText}>{t.label}</Text>
          </View>
        </Reveal>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuroraBackground />
      <Spotlight />
      <Grain />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
          keyboardShouldPersistTaps="handled"
        >
          {isWide ? (
            <View style={styles.wide}>
              <View style={styles.left}>
                <Reveal>
                  <BrandMark light size={42} />
                </Reveal>
                <View style={styles.heroBlock}>
                  <Reveal delay={60}>
                    <View style={[styles.eyebrow, glassBlur]}>
                      <Icon name="sparkles" size={13} color={colors.mint} />
                      <Text style={styles.eyebrowText}>Secure workspace access</Text>
                    </View>
                  </Reveal>
                  {headline}
                  <Reveal delay={520}>
                    <Text style={styles.lead}>
                      Google single sign-on with a hard domain lock. Only verified @{domain} accounts get in,
                      on web, iOS and Android.
                    </Text>
                  </Reveal>
                  <Reveal delay={680} distance={24} scale>
                    <DomainGate domain={domain} />
                  </Reveal>
                </View>
                {trust}
              </View>

              <View style={styles.right}>
                <Reveal delay={300} distance={36} scale>
                  <Tilt max={4}>{card}</Tilt>
                </Reveal>
                <Reveal delay={800}>
                  <Text style={styles.below}>No passwords are stored. Authentication is handled by Google.</Text>
                </Reveal>
              </View>
            </View>
          ) : (
            <View style={styles.narrow}>
              <Reveal>
                <BrandMark light size={38} />
              </Reveal>
              {headline}
              <Reveal delay={360} distance={28} scale>
                {card}
              </Reveal>
              <Reveal delay={520} distance={20}>
                <DomainGate domain={domain} compact />
              </Reveal>
              {trust}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, overflow: 'hidden' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  scrollWide: { justifyContent: 'center' },

  wide: {
    flex: 1,
    width: '100%',
    maxWidth: 1260,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 72,
    paddingHorizontal: 56,
    paddingVertical: 44,
  },
  left: { flex: 1.15, minHeight: 680, justifyContent: 'space-between', gap: spacing.xxl },
  heroBlock: { gap: spacing.xl },
  right: { flex: 1, maxWidth: 460, gap: spacing.lg },

  narrow: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.25)',
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  eyebrowText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.mint },
  display: { fontFamily: fonts.extrabold, color: colors.inkText },
  serif: { fontFamily: fonts.serif, letterSpacing: -0.5 },
  lead: { ...font.body, fontSize: 17, lineHeight: 27, color: colors.inkMuted, maxWidth: 500 },

  trust: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    backgroundColor: colors.glass,
  },
  trustText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkMuted },

  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...shadow.lifted,
  },
  cardPhone: { padding: 24, borderRadius: 24 },
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.lg,
  },
  cardChipText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  title: { ...font.h1, fontSize: 32, lineHeight: 38, color: colors.text },
  titleSerif: { fontFamily: fonts.serif, fontSize: 36, color: colors.primary, letterSpacing: -0.3 },
  subtitle: { ...font.body, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.xl },
  domain: { fontFamily: fonts.bold, color: colors.text },
  alert: { marginBottom: spacing.lg },

  steps: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: '#EEF1F5',
    gap: 12,
  },
  stepsLabel: { ...font.label, color: colors.textSubtle, marginBottom: 2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.primary },
  stepText: { ...font.smallMedium, color: colors.text, flex: 1 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xl },
  cardFooterText: { ...font.small, color: colors.textSubtle, flex: 1 },
  privacyLink: { ...font.smallMedium, color: colors.textMuted, marginTop: spacing.md, alignSelf: 'flex-start' },

  below: { ...font.small, color: colors.inkSubtle, textAlign: 'center' },
});
