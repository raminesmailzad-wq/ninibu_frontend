import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();
function Navigation(){const {ready}=useSession();useEffect(()=>{if(ready)SplashScreen.hideAsync();},[ready]);if(!ready)return null;return <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.page},animation:'slide_from_left'}}/>}
export default function RootLayout(){return <SafeAreaProvider><SessionProvider><StatusBar style="dark"/><Navigation/></SessionProvider></SafeAreaProvider>}
