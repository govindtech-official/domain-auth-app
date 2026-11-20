import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, useNativeDriver } from '@/theme';

/** One soft colour glow that drifts slowly in a loop. */
function Blob({
  id,
  color,
  size,
  top,
  left,
  drift,
  duration,
  opacity = 0.55,
}: {
  id: string;
  color: string;
  size: number;
  top: number | `${number}%`;
  left: number | `${number}%`;
  drift: [number, number];
  duration: number;
  opacity?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, drift[0]] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, drift[1]] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
        ],
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Dark "aurora" backdrop: deep ink base, drifting emerald / teal / violet
 * glows, a faint engineering grid and an edge vignette.
 */
export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink }]} />

      <Blob id="aurora-emerald" color="#10B981" size={1000} top="12%" left="22%" drift={[90, 60]} duration={9000} opacity={0.75} />
      <Blob id="aurora-violet" color="#7C3AED" size={860} top="92%" left="12%" drift={[70, -80]} duration={11000} opacity={0.6} />
      <Blob id="aurora-teal" color="#06B6D4" size={820} top="22%" left="88%" drift={[-90, 60]} duration={10000} opacity={0.5} />

      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <Pattern id="aurora-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <Path d="M44 0H0V44" fill="none" stroke="#FFFFFF" strokeOpacity={0.045} strokeWidth={1} />
          </Pattern>
          <RadialGradient id="aurora-vignette" cx="50%" cy="45%" rx="75%" ry="70%">
            <Stop offset="0.55" stopColor={colors.ink} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.ink} stopOpacity={0.7} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#aurora-grid)" />
        <Rect width="100%" height="100%" fill="url(#aurora-vignette)" />
      </Svg>
    </View>
  );
}
