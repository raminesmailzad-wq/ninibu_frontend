import { Redirect, Stack } from 'expo-router';
import { href } from '@/lib/navigation';
import { useSession } from '@/providers/SessionProvider';
import { ChildProvider } from '@/providers/ChildProvider';
export default function AppLayout(){const s=useSession();if(!s.authenticated)return <Redirect href={href("/login")}/>;if(!s.onboardingComplete)return <Redirect href={href("/onboarding")}/>;return <ChildProvider><Stack screenOptions={{headerShown:false}}/></ChildProvider>}
