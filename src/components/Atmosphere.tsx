import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const isWeb = Platform.OS === 'web';
const SIZE = 720;

/** A soft light that follows the cursor (web only; renders nothing on native). */
export function Spotlight({ color = '#34D399' }: { color?: string }) {
  const pos = useRef(new Animated.ValueXY({ x: -SIZE, y: -SIZE })).current;

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;
    const move = (e: PointerEvent) => {
      Animated.spring(pos, {
        toValue: { x: e.clientX - SIZE / 2, y: e.clientY - SIZE / 2 },
        useNativeDriver: false,
        speed: 6,
        bounciness: 0,
      }).start();
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [pos]);

  if (!isWeb) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.spot, { transform: pos.getTranslateTransform() }]}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <RadialGradient id="spotlight" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={0.16} />
            <Stop offset="0.5" stopColor={color} stopOpacity={0.05} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={SIZE} height={SIZE} fill="url(#spotlight)" />
      </Svg>
    </Animated.View>
  );
}

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Fine film grain over the whole surface (web only), for a tactile, printed feel. */
export function Grain({ opacity = 0.07 }: { opacity?: number }) {
  if (!isWeb) return null;
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity, backgroundImage: NOISE, mixBlendMode: 'overlay' } as unknown as ViewStyle]}
    />
  );
}

const styles = StyleSheet.create({
  spot: { position: Platform.OS === 'web' ? ('fixed' as 'absolute') : 'absolute', top: 0, left: 0, width: SIZE, height: SIZE },
});
