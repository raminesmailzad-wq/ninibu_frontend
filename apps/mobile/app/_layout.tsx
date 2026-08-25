import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { colors } from '@/theme';
import { NINIBU_FONT_ASSETS } from '@/theme/generated-font';

SplashScreen.preventAutoHideAsync();

function Navigation() {
  const { ready } = useSession();
  const [fontsLoaded, fontError] = useFonts(NINIBU_FONT_ASSETS);
  const visualReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready && visualReady) SplashScreen.hideAsync();
  }, [ready, visualReady]);

  if (!ready || !visualReady) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page }, animation: 'slide_from_left' }} />;
}

export default function RootLayout() {
  return <SafeAreaProvider><SessionProvider><StatusBar style="dark" /><Navigation /></SessionProvider></SafeAreaProvider>;
}
