"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { normalizeIranMobile } from "@ninibu/validation";

type Mode = "login" | "signup" | "forgot";
type ApiFailure = { code?: string; message?: string };

type OtpResponse = { expires_in?: number; retry_after?: number; debug_code?: string };

function deviceId() {
  if (typeof window === "undefined") return "web";
  const key = "ninibu_device_id";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
  } catch { /* storage unavailable */ }
  const created = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}`;
  try { window.localStorage.setItem(key, created); } catch { /* storage unavailable */ }
  return created;
}

async function post<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!body.success) {
    const failure: ApiFailure = body.error ?? {};
    const error = new Error(failure.message || "خطا در ارتباط با سرور") as Error & { code?: string };
    error.code = failure.code;
    throw error;
  }
  return body.data as T;
}

function validMobile(value: string) {
  return /^\+989\d{9}$/.test(value);
}

export function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (retryAfter <= 0) return;
    const timer = window.setInterval(() => setRetryAfter((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter]);

  const copy = useMemo(() => {
    if (mode === "signup") return otpSent
      ? { title: "تایید شماره و ساخت حساب", description: `کد تایید ارسال‌شده به ${mobile} را وارد کنید.` }
      : { title: "ساخت حساب نینیبو", description: "رمز عبور را همین حالا تعریف کنید؛ فقط برای تایید اولین ثبت‌نام یک پیامک ارسال می‌شود." };
    if (mode === "forgot") return otpSent
      ? { title: "تایید و تغییر رمز عبور", description: `کد بازیابی ارسال‌شده به ${mobile} را وارد کنید.` }
      : { title: "بازیابی رمز عبور", description: "رمز جدید را تعریف کنید؛ برای تایید مالکیت شماره یک پیامک ارسال می‌شود." };
    return { title: "به نینیبو خوش آمدید", description: "برای ورود روزمره فقط شماره موبایل و رمز عبور لازم است و پیامکی ارسال نمی‌شود." };
  }, [mode, mobile, otpSent]);

  function resetState(nextMode: Mode) {
    setMode(nextMode);
    setOtpSent(false);
    setCode("");
    setConfirmPassword("");
    setRetryAfter(0);
    setError("");
    setInfo("");
  }

  function normalizedMobile() {
    const normalized = normalizeIranMobile(mobile);
    if (!validMobile(normalized)) throw new Error("شماره موبایل معتبر وارد کنید.");
    setMobile(normalized);
    return normalized;
  }

  function validateNewPassword() {
    if (!password.trim()) throw new Error("رمز عبور نمی‌تواند فقط شامل فاصله باشد.");
    if (Array.from(password).length < 8) throw new Error("رمز عبور باید حداقل ۸ کاراکتر باشد.");
    if (new TextEncoder().encode(password).length > 72) throw new Error("رمز عبور برای ذخیره امن بیش از حد طولانی است.");
    if (password !== confirmPassword) throw new Error("تکرار رمز عبور با رمز جدید یکسان نیست.");
  }

  async function login() {
    setError(""); setInfo(""); setLoading(true);
    try {
      const normalized = normalizedMobile();
      if (!password) throw new Error("رمز عبور را وارد کنید.");
      await post("/api/ninibu/auth/login", { mobile: normalized, password, device_id: deviceId() });
      onAuthenticated();
    } catch (caught) {
      const e = caught as Error & { code?: string };
      if (e.code === "PASSWORD_SETUP_REQUIRED") {
        setMode("forgot");
        setOtpSent(false);
        setConfirmPassword("");
        setInfo("این حساب از نسخه قبلی نینیبو منتقل شده و هنوز رمز عبور ندارد. یک رمز جدید تعریف کنید تا با پیامک تایید شود.");
      } else if (e.code === "INVALID_CREDENTIALS") {
        setError("شماره موبایل یا رمز عبور صحیح نیست.");
      } else {
        setError(e.message || "ورود ناموفق بود.");
      }
    } finally { setLoading(false); }
  }

  async function requestOtp() {
    setError(""); setInfo(""); setLoading(true);
    try {
      const normalized = normalizedMobile();
      validateNewPassword();
      const endpoint = mode === "signup"
        ? "/api/ninibu/auth/signup/request-otp"
        : "/api/ninibu/auth/password/forgot/request-otp";
      const payload = mode === "signup"
        ? { mobile: normalized, password }
        : { mobile: normalized, new_password: password };
      const result = await post<OtpResponse>(endpoint, payload);
      setOtpSent(true);
      setRetryAfter(result.retry_after ?? 60);
      if (result.debug_code) setCode(result.debug_code);
    } catch (caught) {
      const e = caught as Error & { code?: string };
      if (e.code === "ACCOUNT_EXISTS") {
        setMode("login");
        setOtpSent(false);
        setError("این شماره قبلاً ثبت‌نام کرده است؛ با رمز عبور وارد شوید یا بازیابی رمز را انتخاب کنید.");
      } else if (e.code === "OTP_RESEND_LIMIT" || e.code === "OTP_HOURLY_LIMIT") {
        setError("تعداد درخواست کد زیاد بوده است. کمی بعد دوباره تلاش کنید.");
      } else {
        setError(e.message || "ارسال کد تایید ناموفق بود.");
      }
    } finally { setLoading(false); }
  }

  async function completeOtpFlow() {
    setError(""); setInfo(""); setLoading(true);
    try {
      const normalized = normalizedMobile();
      validateNewPassword();
      if (!/^\d{6}$/.test(code.trim())) throw new Error("کد تایید ۶ رقمی را وارد کنید.");
      if (mode === "signup") {
        await post("/api/ninibu/auth/signup", { mobile: normalized, code: code.trim(), password, device_id: deviceId() });
      } else {
        await post("/api/ninibu/auth/password/reset", { mobile: normalized, code: code.trim(), new_password: password, device_id: deviceId() });
      }
      onAuthenticated();
    } catch (caught) {
      const e = caught as Error & { code?: string };
      if (e.code === "UNAUTHORIZED") setError("کد واردشده اشتباه است یا اعتبار آن تمام شده است.");
      else setError(e.message || "تایید کد ناموفق بود.");
    } finally { setLoading(false); }
  }

  return <section className="auth-card">
    <div className="brand-mark">n</div>
    <div><h1>{copy.title}</h1><p>{copy.description}</p></div>

    <Field label="شماره موبایل">
      <Input inputMode="tel" dir="ltr" autoComplete="tel" placeholder="0912 123 4567" value={mobile} disabled={otpSent} onChange={(e) => setMobile(e.target.value)} />
    </Field>

    <Field label={mode === "login" ? "رمز عبور" : mode === "signup" ? "رمز عبور" : "رمز عبور جدید"} hint={mode === "login" ? undefined : "حداقل ۸ کاراکتر"}>
      <Input type="password" dir="ltr" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} disabled={otpSent} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && mode === "login" && login()} />
    </Field>

    {mode !== "login" && <Field label="تکرار رمز عبور">
      <Input type="password" dir="ltr" autoComplete="new-password" value={confirmPassword} disabled={otpSent} onChange={(e) => setConfirmPassword(e.target.value)} />
    </Field>}

    {otpSent && <Field label="کد تایید">
      <Input inputMode="numeric" dir="ltr" autoComplete="one-time-code" autoFocus maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && completeOtpFlow()} />
    </Field>}

    {info && <p className="auth-info">{info}</p>}
    {error && <p className="error">{error}</p>}

    {mode === "login" ? <>
      <Button disabled={loading} onClick={login}>{loading ? "کمی صبر کنید…" : "ورود با رمز عبور"}</Button>
      <div className="auth-secondary-actions">
        <Button variant="ghost" onClick={() => resetState("forgot")}>رمز عبور را فراموش کرده‌ام</Button>
        <Button variant="secondary" onClick={() => resetState("signup")}>ثبت‌نام برای اولین بار</Button>
      </div>
    </> : !otpSent ? <>
      <Button disabled={loading} onClick={requestOtp}>{loading ? "کمی صبر کنید…" : mode === "signup" ? "ارسال کد ثبت‌نام" : "ارسال کد بازیابی"}</Button>
      <Button variant="ghost" onClick={() => resetState("login")}>بازگشت به ورود</Button>
    </> : <>
      <Button disabled={loading} onClick={completeOtpFlow}>{loading ? "کمی صبر کنید…" : mode === "signup" ? "تایید و ساخت حساب" : "تایید و تغییر رمز"}</Button>
      <div className="auth-secondary-actions">
        <Button variant="ghost" disabled={loading || retryAfter > 0} onClick={requestOtp}>{retryAfter > 0 ? `ارسال مجدد تا ${retryAfter} ثانیه` : "ارسال مجدد کد"}</Button>
        <Button variant="ghost" onClick={() => { setOtpSent(false); setRetryAfter(0); setCode(""); setError(""); }}>ویرایش اطلاعات</Button>
      </div>
    </>}
  </section>;
}
