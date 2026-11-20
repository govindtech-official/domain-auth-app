import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from './Icon';
import { Shimmer } from './Motion';
import { colors, fonts, radius, spacing } from '@/theme';

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden>
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Primary call-to-action: dark pill with the official multi-colour Google "G". */
export function GoogleButton({ onPress, loading = false, disabled = false }: Props) {
  const isDisabled = disabled || loading;
  const [width, setWidth] = useState(0);
  return (
    <Pressable
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Login with Google"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.button,
        hovered && !isDisabled && styles.hovered,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {({ hovered }: { pressed: boolean; hovered?: boolean }) => (
        <>
          {!loading && (
            <View pointerEvents="none" style={styles.shimmerClip}>
              <Shimmer width={width} every={2600} color="rgba(255,255,255,0.16)" />
            </View>
          )}
          <View style={styles.logo}>
            {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <GoogleLogo />}
          </View>
          <Text style={styles.label}>{loading ? 'Connecting to Google…' : 'Login with Google'}</Text>
          {!loading && (
            <View style={[styles.arrow, hovered && styles.arrowHover]}>
              <Icon name="arrowRight" size={16} color="rgba(255,255,255,0.85)" />
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: 8,
    paddingRight: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.text,
    shadowColor: '#0B1220',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  shimmerClip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.lg, overflow: 'hidden' },
  hovered: { backgroundColor: '#18233A', transform: [{ translateY: -2 }] },
  pressed: { transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.8 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontFamily: fonts.semibold, fontSize: 15.5, color: colors.white, letterSpacing: -0.1 },
  arrow: { opacity: 0.8 },
  arrowHover: { opacity: 1, transform: [{ translateX: 3 }] },
});
