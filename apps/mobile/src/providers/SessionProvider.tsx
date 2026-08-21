import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Profile, User } from '@ninibu/types';
import { ApiError, api, apiPaths, logout as clearSession } from '@/lib/api';
import { getTokens } from '@/lib/storage';

type SessionState={
  ready:boolean;
  authenticated:boolean;
  user?:User;
  profile?:Profile;
  onboardingComplete:boolean;
  refresh:()=>Promise<void>;
  signedIn:()=>Promise<void>;
  signOut:()=>Promise<void>;
};
const Context=createContext<SessionState|null>(null);

function sessionLog(message:string, meta?:Record<string,unknown>){
  if (!__DEV__) return;
  if(meta) console.log(`[NINIBU:SESSION] ${message}`, meta);
  else console.log(`[NINIBU:SESSION] ${message}`);
}

export function SessionProvider({children}:{children:ReactNode}){
  const [ready,setReady]=useState(false);
  const [user,setUser]=useState<User>();
  const [profile,setProfile]=useState<Profile>();

  async function loadSession(strict:boolean){
    const tokens=await getTokens();
    sessionLog('load session', { strict, hasTokens: !!tokens, hasAccessToken: !!tokens?.accessToken, hasRefreshToken: !!tokens?.refreshToken });
    if(!tokens){
      setUser(undefined);
      setProfile(undefined);
      setReady(true);
      if(strict) throw new ApiError('SESSION_TOKENS_MISSING','توکن نشست بعد از ورود ذخیره نشده است.');
      return;
    }

    try{
      sessionLog('requesting /auth/me');
      const me=await api<User>(apiPaths.me);
      sessionLog('/auth/me succeeded', { userId: me?.id, mobileSuffix: me?.mobile?.slice(-4) });
      setUser(me);
      try{
        sessionLog('requesting /profile');
        const nextProfile=await api<Profile>(apiPaths.profile);
        setProfile(nextProfile);
        sessionLog('/profile succeeded', { onboardingCompleted: !!nextProfile?.onboarding_completed });
      }catch(error){
        // A missing/incomplete profile is allowed. Authentication is determined by /auth/me.
        setProfile(undefined);
        sessionLog('/profile failed', {
          code: error instanceof ApiError ? error.code : undefined,
          status: error instanceof ApiError ? error.status : undefined,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }catch(error){
      setUser(undefined);
      setProfile(undefined);
      sessionLog('/auth/me failed', {
        code: error instanceof ApiError ? error.code : undefined,
        status: error instanceof ApiError ? error.status : undefined,
        message: error instanceof Error ? error.message : String(error)
      });
      if(strict) throw error;
    }finally{
      setReady(true);
    }
  }

  async function refresh(){ await loadSession(false); }
  async function signedIn(){ await loadSession(true); }

  useEffect(()=>{ void refresh(); },[]);

  const value=useMemo(()=>({
    ready,
    authenticated:!!user,
    user,
    profile,
    onboardingComplete:!!profile?.onboarding_completed,
    refresh,
    signedIn,
    signOut:async()=>{
      await clearSession();
      setUser(undefined);
      setProfile(undefined);
    }
  }),[ready,user,profile]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession(){const v=useContext(Context);if(!v)throw new Error('SessionProvider missing');return v;}
