import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { TopBar } from '@/components/TopBar';
import { colors } from '@/theme';

/**
 * Layout for every signed-in screen. The root layout only mounts this group
 * when a valid, allowed-domain session exists; the admin screen is guarded a
 * second time by role.
 */
export default function AppLayout() {
  const { isAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TopBar />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Stack.Protected guard={isAdmin} redirectTo="/dashboard">
          <Stack.Screen name="admin" options={{ title: 'Admin' }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
