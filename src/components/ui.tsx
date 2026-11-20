import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedLogo } from './AnimatedLogo';
import { Icon, type IconName } from './Icon';
import { colors, font, fonts, radius, shadow, spacing } from '@/theme';

type PressState = { pressed: boolean; hovered?: boolean };

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  icon?: IconName;
  iconRight?: IconName;
  accessibilityLabel?: string;
}

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string; border: string; hover: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary, hover: colors.primaryHover },
  dark: { bg: colors.text, fg: colors.white, border: colors.text, hover: '#1C2536' },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border, hover: colors.surfaceMuted },
  ghost: { bg: 'transparent', fg: colors.textMuted, border: 'transparent', hover: '#EEF1F5' },
  danger: { bg: colors.surface, fg: colors.danger, border: colors.dangerBorder, hover: colors.dangerSoft },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  size = 'md',
  icon,
  iconRight,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = buttonVariants[variant];
  const iconSize = size === 'sm' ? 15 : 17;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed, hovered }: PressState) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: v.bg, borderColor: v.border },
        (hovered || pressed) && !isDisabled && { backgroundColor: v.hover },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        icon && <Icon name={icon} size={iconSize} color={v.fg} />
      )}
      {label ? (
        <Text style={[styles.buttonLabel, size === 'sm' && styles.buttonLabelSm, { color: v.fg }]}>{label}</Text>
      ) : null}
      {iconRight && !loading && <Icon name={iconRight} size={iconSize} color={v.fg} />}
    </Pressable>
  );
}

/* ---------- Card ---------- */

export function Card({
  children,
  style,
  title,
  subtitle,
  icon,
  action,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || action) && (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {icon && <IconTile name={icon} />}
            <View style={styles.flex}>
              {title && <Text style={styles.cardTitle}>{title}</Text>}
              {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            </View>
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

/* ---------- Icon tile ---------- */

type Tone = 'neutral' | 'success' | 'admin' | 'primary' | 'warning' | 'danger';

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: '#EEF1F5', fg: colors.textMuted },
  success: { bg: colors.successSoft, fg: colors.success },
  admin: { bg: colors.adminSoft, fg: colors.admin },
  primary: { bg: colors.primarySoft, fg: colors.primary },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function IconTile({ name, tone = 'primary', size = 36 }: { name: IconName; tone?: Tone; size?: number }) {
  const t = tones[tone];
  return (
    <View style={[styles.iconTile, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: t.bg }]}>
      <Icon name={name} size={size * 0.5} color={t.fg} />
    </View>
  );
}

/* ---------- Badge ---------- */

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} strokeWidth={2.5} /> : <View style={[styles.badgeDot, { backgroundColor: t.fg }]} />}
      <Text style={[styles.badgeLabel, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({
  name,
  uri,
  size = 40,
  ring = false,
}: {
  name?: string | null;
  uri?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const initials =
    (name ?? '')
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?';
  const dims = { width: size, height: size, borderRadius: size / 2 };
  const inner = uri ? (
    <Image source={{ uri }} style={[dims, styles.avatarImage]} accessibilityLabel={name ?? 'Avatar'} />
  ) : (
    <LinearGradient
      colors={['#34D399', '#059669', '#065F46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[dims, styles.avatarFallback]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.36 }]} accessibilityLabel={name ?? 'Avatar'}>
        {initials}
      </Text>
    </LinearGradient>
  );
  if (!ring) return inner;
  const pad = Math.max(2, Math.round(size * 0.05));
  return (
    <LinearGradient
      colors={['#6EE7B7', '#2DD4BF', '#8B5CF6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: pad, borderRadius: size }}
    >
      <View style={{ padding: pad, borderRadius: size, backgroundColor: colors.ink2 }}>{inner}</View>
    </LinearGradient>
  );
}

/* ---------- Alert ---------- */

export function ErrorAlert({
  message,
  onDismiss,
  animatedStyle,
}: {
  message: string;
  onDismiss?: () => void;
  animatedStyle?: object;
}) {
  return (
    <Animated.View style={[styles.alert, animatedStyle]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.alertIcon}>
        <Icon name="lock" size={15} color={colors.white} strokeWidth={2.4} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.alertTitle}>Sign-in blocked</Text>
        <Text style={styles.alertText}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss error" hitSlop={10}>
          <Icon name="x" size={16} color={colors.danger} />
        </Pressable>
      )}
    </Animated.View>
  );
}

/* ---------- Key / value row ---------- */

export function InfoRow({
  label,
  value,
  icon,
  last = false,
}: {
  label: string;
  value: ReactNode;
  icon?: IconName;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoLeft}>
        {icon && <Icon name={icon} size={15} color={colors.textSubtle} />}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {typeof value === 'string' ? (
        <Text style={styles.infoValue} numberOfLines={1} selectable>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

/* ---------- Full-screen loader ---------- */

export function FullScreenLoader({ label = 'Loading…', dark = false }: { label?: string; dark?: boolean }) {
  return (
    <View
      style={[styles.loader, dark && { backgroundColor: colors.ink }]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <AnimatedLogo size={64} />
      <Text style={[styles.loaderLabel, dark && { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  buttonSm: { minHeight: 36, paddingHorizontal: 12, borderRadius: 10 },
  buttonLabel: { fontFamily: fonts.semibold, fontSize: 14.5 },
  buttonLabelSm: { fontSize: 13.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  cardTitle: { ...font.h3, color: colors.text },
  cardSubtitle: { ...font.small, color: colors.textMuted, marginTop: 1 },

  iconTile: { alignItems: 'center', justifyContent: 'center' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeLabel: { fontFamily: fonts.semibold, fontSize: 12 },

  avatarImage: { backgroundColor: colors.border },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: colors.white, fontFamily: fonts.bold },

  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSoft,
  },
  alertIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: { fontFamily: fonts.bold, fontSize: 13.5, color: '#9F1239' },
  alertText: { ...font.small, color: '#BE123C', marginTop: 1 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { ...font.small, color: colors.textMuted },
  infoValue: { ...font.smallBold, color: colors.text, flexShrink: 1, textAlign: 'right' },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  loaderLabel: { ...font.smallMedium, color: colors.textMuted },
});
