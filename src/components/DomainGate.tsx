import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from './Icon';
import { PulseDot } from './Motion';
import { colors, fonts, glassBlur, radius, spacing, useNativeDriver } from '@/theme';

type Attempt = { user: string; domain: string; ok: boolean; ms: number };

const ATTEMPTS: Attempt[] = [
  { user: 'priya.sharma', domain: 'hbplus.fit', ok: true, ms: 41 },
  { user: 'alex.jordan', domain: 'gmail.com', ok: false, ms: 38 },
  { user: 'ops.team', domain: 'hbplus.fit', ok: true, ms: 36 },
  { user: 'sam.lee', domain: 'hbplus.fit.co', ok: false, ms: 44 },
  { user: 'neha.kapoor', domain: 'hbplus.fit', ok: true, ms: 39 },
  { user: 'dev', domain: 'outlook.com', ok: false, ms: 35 },
];

type Phase = 'travel' | 'scan' | 'granted' | 'blocked';

const STAGE_H = 132;
const TOKEN_H = 40;
const GREEN = '#34D399';
const RED = '#FB7185';

/**
 * Signature login animation. Email "tokens" glide toward a gate; a scanner
 * sweeps them; allowed domains pass through into the workspace, everything
 * else is rejected and drops away. It's the domain rule, visualised.
 */
export function DomainGate({ domain, compact = false }: { domain: string; compact?: boolean }) {
  const [stageW, setStageW] = useState(0);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>('travel');
  const [log, setLog] = useState<Attempt[]>([]);
  const [counts, setCounts] = useState({ ok: 0, blocked: 0 });

  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const flashOk = useRef(new Animated.Value(0)).current;
  const flashNo = useRef(new Animated.Value(0)).current;
  const beam = useRef(new Animated.Value(0)).current;

  const tokenW = compact ? 168 : 236;
  const gateX = stageW * (compact ? 0.66 : 0.62);
  const attempt = ATTEMPTS[i % ATTEMPTS.length];

  // Scanner beam sweeping up and down forever.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beam, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(beam, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [beam]);

  // One full journey per attempt.
  useEffect(() => {
    if (!stageW) return;
    let cancelled = false;
    const startX = -tokenW - 10;
    const stopX = gateX - tokenW - 14;
    const endX = stageW + 10;

    x.setValue(startX);
    y.setValue(0);
    fade.setValue(0);
    shake.setValue(0);
    setPhase('travel');

    const travel = Animated.parallel([
      Animated.timing(x, { toValue: stopX, duration: 1050, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver }),
    ]);

    travel.start(({ finished }) => {
      if (!finished || cancelled) return;
      setPhase('scan');
      setTimeout(() => {
        if (cancelled) return;
        const ok = attempt.ok;
        setPhase(ok ? 'granted' : 'blocked');
        setLog((l) => [attempt, ...l].slice(0, 3));
        setCounts((c) => (ok ? { ...c, ok: c.ok + 1 } : { ...c, blocked: c.blocked + 1 }));

        const flash = ok ? flashOk : flashNo;
        Animated.sequence([
          Animated.timing(flash, { toValue: 1, duration: 140, useNativeDriver }),
          Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver }),
        ]).start();

        const exit = ok
          ? Animated.sequence([
              Animated.delay(260),
              Animated.parallel([
                Animated.timing(x, { toValue: endX, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver }),
                Animated.timing(fade, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver }),
              ]),
            ])
          : Animated.sequence([
              Animated.sequence(
                [9, -8, 6, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver })),
              ),
              Animated.delay(200),
              Animated.parallel([
                Animated.timing(y, { toValue: 46, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver }),
                Animated.timing(x, { toValue: stopX - 40, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver }),
                Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver }),
              ]),
            ]);
        exit.start(({ finished: done }) => {
          if (done && !cancelled) setTimeout(() => !cancelled && setI((n) => n + 1), 250);
        });
      }, 620);
    });

    return () => {
      cancelled = true;
      x.stopAnimation();
      y.stopAnimation();
      fade.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, stageW]);

  const onLayout = (e: LayoutChangeEvent) => setStageW(Math.round(e.nativeEvent.layout.width));

  const tone =
    phase === 'granted' ? GREEN : phase === 'blocked' ? RED : phase === 'scan' ? '#FCD34D' : 'rgba(226,232,240,0.55)';

  return (
    <View style={[styles.panel, glassBlur]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* header */}
      <View style={styles.header}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#F87171' }]} />
          <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
          <View style={[styles.dot, { backgroundColor: '#34D399' }]} />
        </View>
        <Text style={styles.headerTitle}>domain-gate</Text>
        <View style={styles.live}>
          <PulseDot color={colors.mint} size={6} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* stage */}
      <View style={styles.stage} onLayout={onLayout}>
        {/* track */}
        <View style={styles.track} />
        <View style={[styles.zoneLabel, { left: 14 }]}>
          <Text style={styles.zoneText}>INCOMING</Text>
        </View>
        {stageW > 0 && (
          <View style={[styles.zoneLabel, { right: 14 }]}>
            <Text style={styles.zoneText}>WORKSPACE</Text>
          </View>
        )}

        {/* gate */}
        {stageW > 0 && (
          <View style={[styles.gate, { left: gateX - 1 }]}>
            <LinearGradient
              colors={['transparent', 'rgba(110,231,183,0.7)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.gateFlash, { backgroundColor: GREEN, opacity: flashOk }]} />
            <Animated.View style={[styles.gateFlash, { backgroundColor: RED, opacity: flashNo }]} />
            <Animated.View
              style={[
                styles.beam,
                {
                  transform: [{ translateY: beam.interpolate({ inputRange: [0, 1], outputRange: [8, STAGE_H - 26] }) }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(110,231,183,0.9)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={styles.gateBadge}>
              <Icon name="shieldCheck" size={12} color={colors.mint} />
              <Text style={styles.gateBadgeText}>@{domain}</Text>
            </View>
          </View>
        )}

        {/* token */}
        {stageW > 0 && (
          <Animated.View
            style={[
              styles.token,
              {
                width: tokenW,
                borderColor: tone,
                backgroundColor:
                  phase === 'granted'
                    ? 'rgba(52,211,153,0.14)'
                    : phase === 'blocked'
                      ? 'rgba(251,113,133,0.14)'
                      : 'rgba(15,23,42,0.85)',
                opacity: fade,
                transform: [{ translateX: Animated.add(x, shake) }, { translateY: y }],
              },
            ]}
          >
            <View style={[styles.tokenAvatar, { backgroundColor: tone }]}>
              <Text style={styles.tokenAvatarText}>{attempt.user[0].toUpperCase()}</Text>
            </View>
            {/* The name may truncate; the domain (the part being judged) never does. */}
            <View style={styles.tokenEmail}>
              <Text style={[styles.tokenUser, compact && { fontSize: 11.5 }]} numberOfLines={1}>
                {attempt.user}
              </Text>
              <Text style={[styles.tokenDomain, compact && { fontSize: 11.5 }, { color: phase === 'travel' ? colors.inkMuted : tone }]} numberOfLines={1}>
                @{attempt.domain}
              </Text>
            </View>
            {phase === 'granted' && <Icon name="check" size={13} color={GREEN} strokeWidth={3} />}
            {phase === 'blocked' && <Icon name="x" size={13} color={RED} strokeWidth={3} />}
          </Animated.View>
        )}
      </View>

      {/* log */}
      <View style={styles.log}>
        {log.length === 0 ? (
          <Text style={styles.logEmpty}>waiting for sign-in attempts…</Text>
        ) : (
          log.map((a, idx) => (
            <View key={`${a.user}-${counts.ok + counts.blocked - idx}`} style={[styles.logRow, { opacity: 1 - idx * 0.28 }]}>
              <Text style={[styles.logStatus, { color: a.ok ? GREEN : RED }]}>{a.ok ? 'ALLOW' : 'DENY '}</Text>
              <Text style={styles.logEmail} numberOfLines={1}>
                {a.user}@{a.domain}
              </Text>
              <Text style={styles.logMs}>{a.ms}ms</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          <Text style={{ color: GREEN }}>{counts.ok} allowed</Text>
          {'   '}
          <Text style={{ color: RED }}>{counts.blocked} denied</Text>
        </Text>
        <Text style={styles.footerText}>app · trigger · RLS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    maxWidth: 560,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    backgroundColor: 'rgba(10, 16, 30, 0.6)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkBorder,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, opacity: 0.85 },
  headerTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkMuted, letterSpacing: 0.3 },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  liveText: { fontFamily: fonts.bold, fontSize: 10, color: colors.mint, letterSpacing: 1.2 },

  stage: { height: STAGE_H, overflow: 'hidden', justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: STAGE_H / 2,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  zoneLabel: { position: 'absolute', top: 12 },
  zoneText: { fontFamily: fonts.bold, fontSize: 9.5, letterSpacing: 1.6, color: colors.inkSubtle },

  gate: { position: 'absolute', top: 0, bottom: 0, width: 2, alignItems: 'center' },
  gateFlash: { position: 'absolute', top: 0, bottom: 0, left: -3, right: -3, borderRadius: 3 },
  beam: { position: 'absolute', left: -22, width: 46, height: 3, borderRadius: 2 },
  gateBadge: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(6,10,19,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.35)',
    width: 112,
    marginLeft: -55,
    justifyContent: 'center',
  },
  gateBadgeText: { fontFamily: fonts.bold, fontSize: 10.5, color: colors.mint },

  token: {
    position: 'absolute',
    left: 0,
    top: STAGE_H / 2 - TOKEN_H / 2,
    height: TOKEN_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tokenAvatar: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tokenAvatarText: { fontFamily: fonts.extrabold, fontSize: 12, color: '#060A13' },
  tokenEmail: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  tokenUser: { flexShrink: 1, fontFamily: fonts.semibold, fontSize: 12.5, color: colors.inkText },
  tokenDomain: { flexShrink: 0, fontFamily: fonts.semibold, fontSize: 12.5 },

  log: {
    minHeight: 78,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.inkBorder,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  logEmpty: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSubtle, paddingTop: 2 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logStatus: { fontFamily: fonts.extrabold, fontSize: 10.5, letterSpacing: 1, width: 44 },
  logEmail: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted },
  logMs: { fontFamily: fonts.medium, fontSize: 11, color: colors.inkSubtle },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.inkBorder,
  },
  footerText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.inkSubtle },
});
