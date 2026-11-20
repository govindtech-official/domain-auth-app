import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from './Icon';
import { PulseDot } from './Motion';
import { colors, fonts, glassBlur, radius, spacing, useNativeDriver } from '@/theme';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/**
 * Live countdown to access-token expiry. Supabase refreshes the token
 * automatically before it runs out, at which point the countdown resets.
 */
export function SessionTimer({
  expiresAt,
  lifetime,
  fullWidth = false,
}: {
  expiresAt?: number;
  lifetime?: number;
  fullWidth?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000);
    Animated.timing(intro, {
      toValue: 1,
      duration: 1400,
      delay: 600,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver,
    }).start();
    return () => clearInterval(id);
  }, [intro]);

  const total = lifetime && lifetime > 0 ? lifetime : 3600;
  const remaining = Math.max(0, Math.floor((expiresAt ?? now) - now));
  const pct = Math.min(1, remaining / total);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const label = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  return (
    <View style={[styles.panel, glassBlur, fullWidth && { width: '100%' }]}>
      <View style={styles.top}>
        <View style={styles.live}>
          <PulseDot color={colors.mint} size={7} />
          <Text style={styles.liveText}>Session active</Text>
        </View>
        <Icon name="clock" size={15} color={colors.inkSubtle} />
      </View>
      <Text style={styles.caption}>Access token refreshes in</Text>
      <Text style={styles.time} accessibilityLabel={`Token refreshes in ${m} minutes ${s} seconds`}>
        {label}
      </Text>
      <View style={styles.track}>
        <Animated.View style={{ width: `${Math.max(3, pct * 100)}%`, transformOrigin: 'left', transform: [{ scaleX: intro }] }}>
          <LinearGradient colors={['#6EE7B7', '#2DD4BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
        </Animated.View>
      </View>
      <Text style={styles.foot}>Auto-refresh with token rotation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    minWidth: 250,
    padding: spacing.lg + 2,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  live: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.mint },
  caption: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSubtle },
  time: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.inkText,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
    marginBottom: spacing.md,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  foot: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.inkSubtle, marginTop: 10 },
});
