import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { useNativeDriver } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SHIELD = 'M12 2.5 4.5 5.4v5.9c0 4.6 3.1 8.7 7.5 10.2 4.4-1.5 7.5-5.6 7.5-10.2V5.4L12 2.5Z';
const CHECK = 'm8.6 12.2 2.4 2.4 4.6-4.8';
const SHIELD_LEN = 62;
const CHECK_LEN = 11;

/** The brand shield drawing itself, then the check mark, then a gentle breathing loop. */
export function AnimatedLogo({ size = 76 }: { size?: number }) {
  const draw = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(draw, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
      Animated.timing(tick, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(breathe, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [draw, tick, breathe]);

  return (
    <View style={{ width: size * 1.9, height: size * 1.9, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size * 1.9,
          height: size * 1.9,
          borderRadius: size,
          backgroundColor: 'rgba(52,211,153,0.10)',
          opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
          transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.05] }) }],
        }}
      />
      <LinearGradient
        colors={['#34D399', '#059669', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <AnimatedPath
            d={SHIELD}
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinejoin="round"
            strokeDasharray={`${SHIELD_LEN} ${SHIELD_LEN}`}
            strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [SHIELD_LEN, 0] })}
          />
          <AnimatedPath
            d={CHECK}
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${CHECK_LEN} ${CHECK_LEN}`}
            strokeDashoffset={tick.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] })}
          />
        </Svg>
      </LinearGradient>
    </View>
  );
}
