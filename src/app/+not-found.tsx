import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { colors, font, spacing } from '@/theme';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.body}>The page you are looking for doesn’t exist or has moved.</Text>
      <Button label="Go to home" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  code: { fontSize: 14, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  title: { ...font.h1, color: colors.text },
  body: { ...font.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
