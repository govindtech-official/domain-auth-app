import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/theme';

/** Gradient shield logo mark + optional wordmark. */
export function BrandMark({
  size = 36,
  light = false,
  showName = true,
}: {
  size?: number;
  light?: boolean;
  showName?: boolean;
}) {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={['#34D399', '#059669', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}
      >
        <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2.5 4.5 5.4v5.9c0 4.6 3.1 8.7 7.5 10.2 4.4-1.5 7.5-5.6 7.5-10.2V5.4L12 2.5Z"
            fill="rgba(255,255,255,0.18)"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="m8.6 12.2 2.4 2.4 4.6-4.8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </LinearGradient>
      {showName && (
        <View>
          <Text style={[styles.name, { color: light ? colors.inkText : colors.text }]}>Workspace</Text>
          <Text style={[styles.tag, { color: light ? colors.inkSubtle : colors.textSubtle }]}>SECURE PORTAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.extrabold, fontSize: 16.5, lineHeight: 19, letterSpacing: -0.3 },
  tag: { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 1.6, lineHeight: 12 },
});
