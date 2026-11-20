import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

/** Deep ink → emerald gradient with a soft glow, faint grid and concentric rings (top-right). */
export function HeroBackdrop({ id }: { id: string }) {
  return (
    <>
      <LinearGradient
        colors={['#070D1A', '#0A1F24', '#064E3B']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <Pattern id={`${id}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
            <Path d="M32 0H0V32" fill="none" stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={1} />
          </Pattern>
          <RadialGradient id={`${id}-glow`} cx="85%" cy="10%" rx="55%" ry="90%">
            <Stop offset="0" stopColor="#34D399" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#34D399" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}-glow2`} cx="5%" cy="110%" rx="45%" ry="80%">
            <Stop offset="0" stopColor="#8B5CF6" stopOpacity={0.28} />
            <Stop offset="1" stopColor="#8B5CF6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id}-grid)`} />
        <Rect width="100%" height="100%" fill={`url(#${id}-glow)`} />
        <Rect width="100%" height="100%" fill={`url(#${id}-glow2)`} />
      </Svg>
      <Svg style={styles.rings} width={420} height={420} viewBox="0 0 420 420" pointerEvents="none">
        {[60, 110, 160, 210].map((r) => (
          <Circle key={r} cx={210} cy={210} r={r} stroke="#FFFFFF" strokeOpacity={0.06} strokeWidth={1} fill="none" />
        ))}
      </Svg>
    </>
  );
}

const styles = StyleSheet.create({
  rings: { position: 'absolute', top: -170, right: -120 },
});
