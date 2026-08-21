import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { ChildProvider } from '@/providers/ChildProvider';
export default function AppLayout(){const s=useSession();if(!s.authenticated)return <Redirect href="/(auth)"/>;if(!s.onboardingComplete)return <Redirect href="/onboarding"/>;return <ChildProvider><Stack screenOptions={{headerShown:false}}/></ChildProvider>}
