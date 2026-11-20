import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import each weight from its own entry so only these 5 font files are bundled.
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif/400Regular_Italic';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { FullScreenLoader } from '@/components/ui';
import { SetupRequired } from '@/components/SetupRequired';
import { colors } from '@/theme';

/**
 * Route protection lives here, in one place.
 *
 * - While the stored session is being restored we render a loader instead of
 *   any route, so a deep link to /dashboard can never flash protected content
 *   or bounce to /login before we know the user's state.
 * - `Stack.Protected` removes guarded screens from the navigator entirely:
 *   typing /dashboard (or /admin) in the address bar while signed out
 *   redirects to /login, and /login redirects to /dashboard once signed in.
 */
function RootNavigator() {
  const { status } = useAuth();

  if (status === 'misconfigured') return <SetupRequired />;
  if (status === 'loading') return <FullScreenLoader dark label="Checking your session…" />;

  const isSignedIn = status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/callback" />

      <Stack.Protected guard={!isSignedIn} redirectTo="/dashboard">
        <Stack.Screen name="login" options={{ title: 'Sign in', contentStyle: { backgroundColor: colors.ink } }} />
      </Stack.Protected>

      <Stack.Protected guard={isSignedIn} redirectTo="/login">
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    InstrumentSerif_400Regular_Italic,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* If fonts fail to load we still render with system fonts. */}
        {fontsLoaded || fontError ? <RootNavigator /> : <FullScreenLoader dark label="Loading…" />}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
