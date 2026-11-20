import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { env } from '@/config/env';
import { HeroBackdrop } from '@/components/HeroBackdrop';
import { Icon, type IconName } from '@/components/Icon';
import { CountUp, HoverLift, Reveal } from '@/components/Motion';
import { Avatar, Badge, Button, Card, ErrorAlert } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/format';
import { supabase, type Profile, type Role } from '@/lib/supabase';
import { breakpoints, colors, font, fonts, glassBlur, radius, spacing } from '@/theme';

type Filter = 'all' | 'admin' | 'user';

/**
 * Admin console. Reaching this screen requires role = admin (route guard), but
 * the real enforcement is in the database: RLS only returns other users'
 * profiles to admins, and set_user_role() re-checks the caller's role.
 */
export default function AdminScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < breakpoints.tablet;

  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at')
      .order('created_at', { ascending: true });
    if (dbError) setError('Could not load team members. ' + dbError.message);
    setMembers((data as Profile[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const changeRole = async (member: Profile, role: Role) => {
    setUpdatingId(member.id);
    setError(null);
    const { error: rpcError } = await supabase.rpc('set_user_role', { target_user: member.id, new_role: role });
    if (rpcError) {
      setError('Could not update role. ' + rpcError.message);
    } else {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    }
    setUpdatingId(null);
  };

  const admins = members.filter((m) => m.role === 'admin').length;
  const newThisWeek = members.filter((m) => Date.now() - new Date(m.created_at).getTime() < 7 * 864e5).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        (filter === 'all' || m.role === filter) &&
        (!q || m.email.includes(q) || (m.full_name ?? '').toLowerCase().includes(q)),
    );
  }, [members, query, filter]);

  const stats: { icon: IconName; label: string; value: number | string }[] = [
    { icon: 'users', label: 'Members', value: members.length },
    { icon: 'crown', label: 'Admins', value: admins },
    { icon: 'user', label: 'Users', value: members.length - admins },
    { icon: 'sparkles', label: 'New this week', value: newThisWeek },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.page}>
        <Reveal>
          <View style={[styles.hero, compact && styles.heroPhone]}>
            <HeroBackdrop id="admin-hero" />
            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Icon name="crown" size={13} color="#C4B5FD" />
                <Text style={styles.heroBadgeText}>ADMIN CONSOLE</Text>
              </View>
              <Text style={[styles.heroTitle, compact && styles.heroTitlePhone]} accessibilityRole="header">
                Team & <Text style={styles.heroSerif}>access</Text>
              </Text>
              <Text style={styles.heroBody}>
                Everyone who has signed in with an approved @{env.allowedEmailDomain} account. Role changes are
                verified again by the database.
              </Text>
            </View>
            <View style={styles.heroStats}>
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={200 + i * 90} distance={12} scale style={styles.heroStatWrap}>
                  <HoverLift>
                    <View style={[styles.heroStat, glassBlur]}>
                      <Icon name={s.icon} size={15} color={colors.mint} />
                      {loading ? (
                        <Text style={styles.heroStatValue}>–</Text>
                      ) : (
                        <CountUp value={Number(s.value)} style={styles.heroStatValue} delay={i * 90} />
                      )}
                      <Text style={styles.heroStatLabel}>{s.label}</Text>
                    </View>
                  </HoverLift>
                </Reveal>
              ))}
            </View>
          </View>
        </Reveal>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <Reveal delay={150}>
          <Card
            title="Directory"
            subtitle={loading ? 'Loading…' : `${visible.length} of ${members.length} members`}
            icon="users"
            action={<Button label={compact ? '' : 'Refresh'} accessibilityLabel="Refresh" variant="ghost" size="sm" icon="refresh" onPress={load} />}
          >
            <View style={styles.toolbar}>
              <View style={styles.search}>
                <Icon name="search" size={16} color={colors.textSubtle} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by name or email"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Search members"
                />
              </View>
              <View style={styles.segment} accessibilityRole="radiogroup">
                {(['all', 'admin', 'user'] as Filter[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: filter === f }}
                    style={[styles.segmentItem, filter === f && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, filter === f && styles.segmentTextActive]}>
                      {f === 'all' ? 'All' : f === 'admin' ? 'Admins' : 'Users'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {loading ? (
              <View>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.row, styles.rowBorder]}>
                    <View style={[styles.skeleton, { width: 42, height: 42, borderRadius: 21 }]} />
                    <View style={{ flex: 1, gap: 8 }}>
                      <View style={[styles.skeleton, { width: '40%', height: 12 }]} />
                      <View style={[styles.skeleton, { width: '60%', height: 10 }]} />
                    </View>
                  </View>
                ))}
              </View>
            ) : visible.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="search" size={22} color={colors.textSubtle} />
                <Text style={styles.emptyTitle}>No members found</Text>
                <Text style={styles.emptyBody}>Try a different search or filter.</Text>
              </View>
            ) : (
              visible.map((m, i) => {
                const isSelf = m.id === user?.id;
                const isAdminRow = m.role === 'admin';
                return (
                  <Reveal key={m.id} delay={i * 70} distance={10}>
                  <View style={[styles.row, i < visible.length - 1 && styles.rowBorder]}>
                    <Avatar name={m.full_name ?? m.email} uri={m.avatar_url} size={42} />
                    <View style={styles.rowMain}>
                      <View style={styles.rowNameLine}>
                        <Text style={styles.rowName} numberOfLines={1}>
                          {m.full_name ?? m.email.split('@')[0]}
                        </Text>
                        {isSelf && <Badge label="You" tone="neutral" />}
                      </View>
                      <Text style={styles.rowEmail} numberOfLines={1}>
                        {m.email}
                      </Text>
                    </View>
                    {!compact && (
                      <View style={styles.rowJoined}>
                        <Text style={styles.rowJoinedValue}>{formatDate(m.created_at)}</Text>
                        <Text style={styles.rowJoinedLabel}>{timeAgo(m.created_at)}</Text>
                      </View>
                    )}
                    {/* key on role: the badge re-animates when the role changes */}
                    <Reveal key={m.role} distance={0} scale duration={420}>
                      <Badge label={isAdminRow ? 'Admin' : 'User'} tone={isAdminRow ? 'admin' : 'primary'} icon={isAdminRow ? 'crown' : 'user'} />
                    </Reveal>
                    <View style={[styles.actionCol, compact && styles.actionColCompact]}>
                      {!isSelf && (
                        <Button
                          size="sm"
                          variant="secondary"
                          label={compact ? '' : isAdminRow ? 'Make user' : 'Make admin'}
                          accessibilityLabel={isAdminRow ? 'Make user' : 'Make admin'}
                          icon={isAdminRow ? 'user' : 'crown'}
                          loading={updatingId === m.id}
                          disabled={updatingId !== null}
                          onPress={() => changeRole(m, isAdminRow ? 'user' : 'admin')}
                        />
                      )}
                    </View>
                  </View>
                  </Reveal>
                );
              })
            )}
          </Card>
        </Reveal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  page: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },

  hero: { borderRadius: 28, overflow: 'hidden', padding: 32, gap: spacing.xl },
  heroPhone: { padding: 20, borderRadius: 22 },
  heroTop: { gap: 8, maxWidth: 640 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.3)',
  },
  heroBadgeText: { ...font.label, fontSize: 10.5, color: '#DDD6FE' },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.9, color: colors.inkText },
  heroTitlePhone: { fontSize: 26, lineHeight: 32 },
  heroSerif: { fontFamily: fonts.serif, fontSize: 36, color: colors.mint, letterSpacing: -0.3 },
  heroBody: { ...font.body, color: colors.inkMuted },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  heroStatWrap: { flexGrow: 1, flexBasis: 130 },
  heroStat: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 4,
  },
  heroStatValue: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, color: colors.inkText, marginTop: 6 },
  heroStatLabel: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkMuted },

  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.sm },
  search: {
    flexGrow: 1,
    flexBasis: 240,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text, paddingVertical: 0, minWidth: 0 },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: '#EEF1F5',
  },
  segmentItem: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9 },
  segmentItemActive: {
    backgroundColor: colors.surface,
    shadowColor: '#0B1220',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
  segmentTextActive: { color: colors.text },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF1F5' },
  rowMain: { flex: 1, minWidth: 0 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowName: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.text, flexShrink: 1 },
  rowEmail: { ...font.small, color: colors.textMuted },
  rowJoined: { alignItems: 'flex-end', marginRight: spacing.sm },
  rowJoinedValue: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.text },
  rowJoinedLabel: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textSubtle },

  actionCol: { width: 122, alignItems: 'flex-end' },
  actionColCompact: { width: 44 },
  skeleton: { backgroundColor: '#EEF1F5', borderRadius: 6 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 6 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 4 },
  emptyBody: { ...font.small, color: colors.textMuted },
});
