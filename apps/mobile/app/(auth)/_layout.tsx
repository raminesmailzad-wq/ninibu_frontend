import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';

export default function AuthLayout() {
  const session = useSession();

  if (!session.ready) return null;

  // Auth screens are only valid for signed-out users. After a successful
  // login React may commit SessionProvider state one render after the
  // imperative navigation call. Keeping this guard declarative prevents the
  // app from getting stranded on /(auth) with a valid session.
  if (session.authenticated) {
    if (!session.onboardingComplete) return <Redirect href="/onboarding" />;
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
