"use client";

import { useEffect, useState } from "react";
import { Splash } from "@/components/auth/splash";
import { Login } from "@/components/auth/login";
import { Onboarding } from "@/components/onboarding/onboarding";
import { AppFrame } from "@/components/app/app-frame";

type Phase = "splash" | "login" | "onboarding" | "app";

export function AppShell() {
  const [phase, setPhase] = useState<Phase>("splash");

  async function resolve() {
    try {
      const response = await fetch("/api/ninibu/auth/session", { cache: "no-store" });
      const body = await response.json();
      if (body.data?.authenticated) setPhase(body.data.onboardingCompleted ? "app" : "onboarding");
      else setPhase("login");
    } catch {
      setPhase("login");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(resolve, 1050);
    return () => window.clearTimeout(timer);
  }, []);

  if (phase === "splash") return <Splash />;
  if (phase === "login") return <div className="center-stage"><Login onAuthenticated={resolve} /></div>;
  if (phase === "onboarding") return <div className="center-stage"><Onboarding onComplete={() => setPhase("app")} /></div>;
  return <AppFrame onLogout={() => setPhase("login")} />;
}
