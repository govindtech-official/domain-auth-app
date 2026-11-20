import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { env } from '@/config/env';
import { colors, font, fonts, radius, spacing } from '@/theme';

const LAST_UPDATED = '21 November 2026';

/**
 * Public privacy policy (linked from the Google OAuth consent screen).
 * Reachable signed in or out: it is registered outside the guards in
 * src/app/_layout.tsx. Keep it in sync with what the app actually stores.
 */
export default function PrivacyPolicy() {
  const domain = env.allowedEmailDomain;

  const sections: { title: string; body: string[] }[] = [
    {
      title: 'What this app is',
      body: [
        `Workspace Portal is an internal sign-in portal for members of @${domain}. You sign in with your Google account, and only accounts on the @${domain} domain are allowed in.`,
      ],
    },
    {
      title: 'What we collect',
      body: [
        'When you sign in with Google, we receive your email address, your name and your profile picture URL. We do not receive your Google password and we do not ask Google for access to your Gmail, Drive, Calendar or contacts.',
        `If your email is not on @${domain}, sign-in is refused and no account is created for you.`,
      ],
    },
    {
      title: 'How we use it',
      body: [
        'Your email is used to check that you belong to the allowed domain. Your name and picture are shown on your dashboard and, for administrators, in the team directory. Each account also has a role (user or admin) that controls what you can see.',
        'We do not sell your data, use it for advertising, or share it with anyone outside the services listed below.',
      ],
    },
    {
      title: 'Where it is stored',
      body: [
        'Account data is stored in a Supabase (PostgreSQL) database, protected by row-level security so that users can read only their own profile and administrators can read the team list.',
        'Your session tokens are kept in your browser’s local storage on the web, or in encrypted storage on your phone. Signing out revokes the session and removes them.',
        'The website is hosted on Netlify, which keeps standard server logs such as IP addresses and request times.',
      ],
    },
    {
      title: 'Cookies and tracking',
      body: ['This app does not use analytics, advertising cookies or third-party tracking scripts.'],
    },
    {
      title: 'Your choices',
      body: [
        'You can sign out at any time. To have your account and profile deleted, ask your workspace administrator. You can also remove this app’s access from your Google Account under Security → Third-party apps & services.',
      ],
    },
    {
      title: 'Changes',
      body: ['If this policy changes, the updated version will be posted on this page with a new date.'],
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.page}>
          <Link href="/" accessibilityLabel="Go to Workspace Portal home">
            <BrandMark size={34} />
          </Link>

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Privacy policy
            </Text>
            <Text style={styles.updated}>Last updated {LAST_UPDATED}</Text>
          </View>

          {sections.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {s.title}
              </Text>
              {s.body.map((p) => (
                <Text key={p.slice(0, 32)} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
            </View>
          ))}

          <Link href="/" style={styles.back}>
            ← Back to Workspace Portal
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  page: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...font.h1, color: colors.text },
  updated: { ...font.small, color: colors.textSubtle },
  section: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionTitle: { ...font.h3, color: colors.text },
  paragraph: { ...font.body, color: colors.textMuted },
  back: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
});
