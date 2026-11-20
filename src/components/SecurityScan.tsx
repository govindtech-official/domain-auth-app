import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon, type IconName } from './Icon';
import { Badge, Button, Card, IconTile } from './ui';
import { colors, fonts, font, useNativeDriver } from '@/theme';

export type Check = { icon: IconName; title: string; detail: string; ok: boolean };

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const STEP_MS = 520;

/**
 * "Security posture" card that runs its checks live: each row goes
 * pending → checking → passed with a pop, while the score ring draws itself.
 * Re-run replays the scan.
 */
export function SecurityScan({ checks, compact = false, startDelay = 700 }: { checks: Check[]; compact?: boolean; startDelay?: number }) {
  const [done, setDone] = useState(0);
  const [run, setRun] = useState(0);
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setDone(0);
    ring.setValue(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    checks.forEach((_, i) => {
      timers.push(setTimeout(() => setDone(i + 1), (run === 0 ? startDelay : 250) + (i + 1) * STEP_MS));
    });
    return () => timers.forEach(clearTimeout);
  }, [run, checks, startDelay, ring]);

  const passed = checks.slice(0, done).filter((c) => c.ok).length;

  useEffect(() => {
    Animated.timing(ring, {
      toValue: checks.length ? passed / checks.length : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [passed, checks.length, ring]);

  const finished = done >= checks.length;
  const allOk = finished && passed === checks.length;

  return (
    <Card
      title="Security posture"
      subtitle={finished ? (allOk ? 'All checks passed for this session' : 'Some checks need attention') : `Running check ${Math.min(done + 1, checks.length)} of ${checks.length}…`}
      icon="shieldCheck"
      action={
        <View style={styles.headerRight}>
          {!compact && finished && (
            <Button label="Re-run" variant="ghost" size="sm" icon="refresh" onPress={() => setRun((r) => r + 1)} />
          )}
          <ScoreRing progress={ring} passed={passed} total={checks.length} ok={!finished || allOk} />
        </View>
      }
    >
      <View style={styles.list}>
        {checks.map((c, i) => {
          const state = i < done ? 'done' : i === done ? 'running' : 'pending';
          return (
            <View key={c.title} style={[styles.row, i < checks.length - 1 && styles.rowBorder, state === 'pending' && styles.pending]}>
              <IconTile name={c.icon} tone={state === 'done' ? (c.ok ? 'success' : 'warning') : 'neutral'} size={38} />
              <View style={styles.text}>
                <Text style={styles.title}>{c.title}</Text>
                <Text style={styles.detail}>{state === 'running' ? 'Checking…' : c.detail}</Text>
              </View>
              {state === 'running' ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : state === 'done' ? (
                <Pop key={`${run}-${i}`}>
                  {compact ? (
                    <View style={[styles.mark, !c.ok && styles.markWarn]}>
                      <Icon name={c.ok ? 'check' : 'alert'} size={13} color={c.ok ? colors.success : colors.warning} strokeWidth={3} />
                    </View>
                  ) : c.ok ? (
                    <Badge label="Passed" tone="success" icon="check" />
                  ) : (
                    <Badge label="Action needed" tone="warning" icon="alert" />
                  )}
                </Pop>
              ) : (
                <View style={styles.dot} />
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function Pop({ children }: { children: React.ReactNode }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(s, { toValue: 1, useNativeDriver, speed: 16, bounciness: 14 }).start();
  }, [s]);
  return (
    <Animated.View style={{ opacity: s.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale: s.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}>
      {children}
    </Animated.View>
  );
}

function ScoreRing({ progress, passed, total, ok }: { progress: Animated.Value; passed: number; total: number; ok: boolean }) {
  const size = 52;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = ok ? colors.primary : '#D97706';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF1F5" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [c, 0] })}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.score}>
        {passed}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  list: { marginTop: -4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  pending: { opacity: 0.45 },
  text: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text },
  detail: { ...font.small, color: colors.textMuted, marginTop: 1 },
  score: { fontFamily: fonts.extrabold, fontSize: 12.5, color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginRight: 9 },
  mark: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  markWarn: { backgroundColor: colors.warningSoft },
});
