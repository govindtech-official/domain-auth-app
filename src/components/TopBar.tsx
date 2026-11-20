import { usePathname, router, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { BrandMark } from './BrandMark';
import { Icon, type IconName } from './Icon';
import { Avatar, Button } from './ui';
import { breakpoints, colors, fonts, radius, spacing } from '@/theme';

const webBlur: ViewStyle =
  Platform.OS === 'web'
    ? ({ backdropFilter: 'saturate(180%) blur(14px)', backgroundColor: 'rgba(255,255,255,0.82)' } as unknown as ViewStyle)
    : {};

/** App header shared by every signed-in screen: brand, navigation, user, logout. */
export function TopBar() {
  const { profile, isAdmin, role, signOut, isSigningOut } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.tablet;

  const links: { label: string; icon: IconName; href: Href; active: boolean }[] = [
    { label: 'Dashboard', icon: 'grid', href: '/dashboard', active: pathname === '/dashboard' },
  ];
  if (isAdmin) links.push({ label: 'Admin', icon: 'crown', href: '/admin', active: pathname === '/admin' });

  return (
    <View style={[styles.wrapper, webBlur, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          <BrandMark size={34} showName={!compact} />
          {!compact && <View style={styles.divider} />}
          <View style={styles.nav} accessibilityRole="tablist">
            {links.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => router.navigate(link.href)}
                accessibilityRole="tab"
                accessibilityLabel={link.label}
                accessibilityState={{ selected: link.active }}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.navItem,
                  link.active && styles.navItemActive,
                  (hovered || pressed) && !link.active && styles.navItemHover,
                ]}
              >
                <Icon name={link.icon} size={15} color={link.active ? colors.text : colors.textSubtle} />
                {!compact && <Text style={[styles.navLabel, link.active && styles.navLabelActive]}>{link.label}</Text>}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.right}>
          {profile && (
            <View style={styles.userPill}>
              <Avatar name={profile.full_name ?? profile.email} uri={profile.avatar_url} size={30} />
              {!compact && (
                <View style={styles.user}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {profile.full_name ?? profile.email}
                  </Text>
                  <Text style={[styles.userRole, role === 'admin' && { color: colors.admin }]}>
                    {role === 'admin' ? 'Administrator' : 'Member'}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Button
            label={compact ? 'Logout' : 'Log out'}
            accessibilityLabel="Logout"
            variant="secondary"
            size="sm"
            icon="logOut"
            onPress={signOut}
            loading={isSigningOut}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  bar: {
    width: '100%',
    maxWidth: 1232,
    alignSelf: 'center',
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexShrink: 1 },
  divider: { width: 1, height: 24, backgroundColor: colors.border },
  nav: { flexDirection: 'row', gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  navItemActive: { backgroundColor: '#EEF1F5' },
  navItemHover: { backgroundColor: colors.surfaceMuted },
  navLabel: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.textMuted },
  navLabelActive: { color: colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  userPill: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  user: { maxWidth: 200 },
  userName: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.text },
  userRole: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textSubtle },
});
