import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { missingEnvVars } from '@/config/env';
import { BrandMark } from './BrandMark';
import { Card } from './ui';
import { colors, font, radius, spacing } from '@/theme';

/** Shown instead of the app when Supabase env vars were not provided at build time. */
export function SetupRequired() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <BrandMark />
        <Text style={styles.title}>Configuration required</Text>
        <Text style={styles.body}>
          This build is missing its Supabase settings. Add the following environment variables
          (locally in <Text style={styles.code}>.env</Text>, or in Netlify → Site configuration →
          Environment variables) and rebuild:
        </Text>
        <View style={styles.list}>
          {missingEnvVars.map((name) => (
            <Text key={name} style={styles.envVar}>
              {name}
            </Text>
          ))}
        </View>
        <Text style={styles.hint}>See README.md → “Setup” for step-by-step instructions.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: { width: '100%', maxWidth: 520, gap: spacing.lg },
  title: { ...font.h2, color: colors.text },
  body: { ...font.body, color: colors.textMuted },
  code: { fontFamily: 'monospace', color: colors.text },
  list: { gap: spacing.sm },
  envVar: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hint: { ...font.small, color: colors.textSubtle },
});
