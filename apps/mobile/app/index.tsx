import { Redirect } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
export default function Index(){const s=useSession();if(!s.ready)return null;if(!s.authenticated)return <Redirect href="/(auth)"/>;if(!s.onboardingComplete)return <Redirect href="/onboarding"/>;return <Redirect href="/(app)/(tabs)"/>}
