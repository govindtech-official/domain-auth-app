import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useNativeDriver } from '@/theme';

const isWeb = Platform.OS === 'web';

/* ------------------------------------------------------------------ */
/* Reveal: fade + slide in once                                        */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  distance = 14,
  duration = 620,
  scale = false,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  scale?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(p, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver,
    }).start();
  }, [p, delay, duration]);

  const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const transform = scale
    ? [{ translateY }, { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }]
    : [{ translateY }];

  return <Animated.View style={[style, { opacity: p, transform }]}>{children}</Animated.View>;
}

/* ------------------------------------------------------------------ */
/* WordReveal: each word rises out of a mask, staggered                */
/* ------------------------------------------------------------------ */

export type Segment = { text: string; style?: StyleProp<TextStyle> };

export function WordReveal({
  lines,
  style,
  lineHeight,
  delay = 0,
  stagger = 70,
}: {
  lines: Segment[][];
  style: StyleProp<TextStyle>;
  lineHeight: number;
  delay?: number;
  stagger?: number;
}) {
  let index = 0;
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={lines.map((l) => l.map((s) => s.text).join(' ')).join(' ')}>
      {lines.map((segments, li) => (
        <View key={li} style={styles.wordLine}>
          {segments.flatMap((seg, si) =>
            seg.text.split(' ').filter(Boolean).map((word, wi) => {
              const d = delay + index++ * stagger;
              return (
                <View key={`${si}-${wi}`} style={[styles.wordMask, { height: lineHeight * 1.08 }]}>
                  <RisingWord delay={d} distance={lineHeight}>
                    <Text style={[style, seg.style, { lineHeight }]}>{word + ' '}</Text>
                  </RisingWord>
                </View>
              );
            }),
          )}
        </View>
      ))}
    </View>
  );
}

function RisingWord({ children, delay, distance }: { children: ReactNode; delay: number; distance: number }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(p, {
      toValue: 1,
      duration: 900,
      delay,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver,
    }).start();
  }, [p, delay]);
  return (
    <Animated.View
      style={{
        opacity: p.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
        transform: [
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['4deg', '0deg'] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* ScrambleText: characters "decode" into the final string             */
/* ------------------------------------------------------------------ */

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

export function ScrambleText({
  text,
  style,
  delay = 0,
  speed = 28,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  delay?: number;
  speed?: number;
}) {
  const [shown, setShown] = useState(text.replace(/[^ ]/g, '·'));

  useEffect(() => {
    let frame = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => {
        frame++;
        const settled = Math.floor(frame / 2);
        setShown(
          text
            .split('')
            .map((ch, i) =>
              i < settled || ch === ' ' || ch === '.' || ch === '@'
                ? ch
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(''),
        );
        if (settled >= text.length && id) clearInterval(id);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [text, delay, speed]);

  return (
    <Text style={style} accessibilityLabel={text}>
      {shown}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp: animated number                                            */
/* ------------------------------------------------------------------ */

export function CountUp({
  value,
  style,
  duration = 1100,
  delay = 0,
}: {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
  delay?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = v.addListener(({ value: x }) => setN(Math.round(x)));
    Animated.timing(v, {
      toValue: value,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => v.removeListener(id);
  }, [v, value, duration, delay]);

  return <Text style={[style, { fontVariant: ['tabular-nums'] }]}>{n}</Text>;
}

/* ------------------------------------------------------------------ */
/* PulseDot                                                            */
/* ------------------------------------------------------------------ */

export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
        }}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Shimmer: a light band that sweeps across its parent periodically    */
/* ------------------------------------------------------------------ */

export function Shimmer({
  width,
  every = 3200,
  color = 'rgba(255,255,255,0.22)',
  band = 120,
}: {
  width: number;
  every?: number;
  color?: string;
  band?: number;
}) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!width) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(every),
        Animated.timing(x, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver }),
        Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x, width, every]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Animated.View
        style={{
          position: 'absolute',
          top: -20,
          bottom: -20,
          width: band,
          transform: [
            { translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-band * 1.5, width + band] }) },
            { rotate: '18deg' },
          ],
        }}
      >
        <LinearGradient
          colors={['transparent', color, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* HoverLift: springs up on pointer hover (web), static on native      */
/* ------------------------------------------------------------------ */

export function HoverLift({ children, style, lift = 4 }: { children: ReactNode; style?: StyleProp<ViewStyle>; lift?: number }) {
  const h = useRef(new Animated.Value(0)).current;
  const to = (v: number) => Animated.spring(h, { toValue: v, useNativeDriver, speed: 18, bounciness: 6 }).start();
  return (
    <Animated.View
      style={[style, { transform: [{ translateY: h.interpolate({ inputRange: [0, 1], outputRange: [0, -lift] }) }] }]}
      {...(isWeb ? { onPointerEnter: () => to(1), onPointerLeave: () => to(0) } : {})}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt: 3D tilt toward the cursor (web only)                          */
/* ------------------------------------------------------------------ */

export function Tilt({ children, max = 5, style }: { children: ReactNode; max?: number; style?: StyleProp<ViewStyle> }) {
  // On web, a host component ref is the underlying DOM element.
  const ref = useRef<unknown>(null);
  const rx = useRef(new Animated.Value(0)).current;
  const ry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isWeb) return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el?.addEventListener) return;
    const spring = (v: Animated.Value, to: number) =>
      Animated.spring(v, { toValue: to, useNativeDriver: false, speed: 14, bounciness: 4 }).start();
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      spring(ry, px * max * 2);
      spring(rx, -py * max * 2);
    };
    const leave = () => {
      spring(rx, 0);
      spring(ry, 0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [rx, ry, max]);

  return (
    <Animated.View
      ref={ref as never}
      style={[
        style,
        {
          transform: [
            { perspective: 1200 },
            { rotateX: rx.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] }) },
            { rotateY: ry.interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* useShake                                                            */
/* ------------------------------------------------------------------ */

export function useShake() {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () => {
    x.setValue(0);
    Animated.sequence(
      [10, -8, 6, -4, 0].map((toValue) =>
        Animated.timing(x, { toValue, duration: 60, easing: Easing.linear, useNativeDriver }),
      ),
    ).start();
  };
  return { style: { transform: [{ translateX: x }] }, shake };
}

/* ------------------------------------------------------------------ */
/* Spin: continuous rotation                                           */
/* ------------------------------------------------------------------ */

export function Spin({ children, duration = 6000, style }: { children: ReactNode; duration?: number; style?: StyleProp<ViewStyle> }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(r, { toValue: 1, duration, easing: Easing.linear, useNativeDriver }));
    loop.start();
    return () => loop.stop();
  }, [r, duration]);
  return (
    <Animated.View style={[style, { transform: [{ rotate: r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wordLine: { flexDirection: 'row', flexWrap: 'wrap' },
  wordMask: { overflow: 'hidden' },
});
