"use client";

import { useState } from "react";
import { normalizeIranMobile } from "@ninibu/validation";
import { resolveApiErrorMessage } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ApiFailure = { code?: string; message?: string };

function deviceId() {
  if (typeof window === "undefined") return "admin-web";
  const key = "ninibu_admin_device_id";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
  } catch { /* storage unavailable */ }
  const created = globalThis.crypto?.randomUUID?.() ?? `admin-web-${Date.now()}`;
  try { window.localStorage.setItem(key, created); } catch { /* storage unavailable */ }
  return created;
}

export function AdminLogin({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setError("");
    setLoading(true);
    try {
      const normalized = normalizeIranMobile(mobile);
      if (!/^\+989\d{9}$/.test(normalized)) throw new Error("شماره موبایل معتبر وارد کنید.");
      if (!password) throw new Error("رمز عبور را وارد کنید.");

      let response: Response;
      try {
        response = await fetch("/api/ninibu/auth/admin/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mobile: normalized, password, device_id: deviceId() }),
        });
      } catch {
        throw new Error("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
      }
      let body: { success?: boolean; error?: ApiFailure };
      try {
        body = await response.json() as { success?: boolean; error?: ApiFailure };
      } catch {
        throw new Error("پاسخ سرور قابل خواندن نیست. لطفاً دوباره تلاش کنید.");
      }
      if (!body.success) throw new Error(resolveApiErrorMessage(body.error, response.status, "اطلاعات ورود مدیریت صحیح نیست."));
      onAuthenticated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ورود مدیریت ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="auth-card admin-auth-card">
    <div className="brand-mark">n</div>
    <div>
      <h1>ورود مدیریت</h1>
      <p>این بخش ثبت‌نام ندارد. اطلاعات حساب مدیریت در تنظیمات امن سرور تعریف می‌شود.</p>
    </div>
    <Field label="شماره موبایل">
      <Input inputMode="tel" dir="ltr" autoComplete="username" placeholder="0912 123 4567" value={mobile} onChange={(e) => setMobile(e.target.value)} />
    </Field>
    <Field label="رمز عبور">
      <Input type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void login()} />
    </Field>
    {error ? <p className="error">{error}</p> : null}
    <Button disabled={loading} onClick={() => void login()}>{loading ? "در حال ورود…" : "ورود به پنل مدیریت"}</Button>
  </section>;
}
