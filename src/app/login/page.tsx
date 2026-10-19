"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function LoginPage() {
  const router = useRouter();

  // Authentication check: if already logged in, redirect away immediately
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Steps: "email" | "otp" | "workspace" | "success"
  const [step, setStep] = useState<"email" | "otp" | "workspace" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [availableCurrencies, setAvailableCurrencies] = useState<
    Array<{ code: string; name: string; symbol: string }>
  >([
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "GBP", name: "British Pound", symbol: "£" },
  ]);
  const [isNewUser, setIsNewUser] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer for resend
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Authenticated user session info
  const [authSession, setAuthSession] = useState<{
    userId?: string;
    workspaceId?: string;
    email?: string;
    workspaceName?: string;
  } | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auth check: once logged in, user can never return to this /login page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isKnown =
        localStorage.getItem("voxera_logged_in") === "true" ||
        document.cookie.includes("voxera_session");

      if (isKnown) {
        window.location.replace("/dashboard/assistants");
        return;
      }

      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            localStorage.setItem("voxera_logged_in", "true");
            window.location.replace("/dashboard/assistants");
          } else {
            setCheckingAuth(false);
          }
        })
        .catch(() => {
          setCheckingAuth(false);
        });
    }

    // Fetch active currencies from DB
    fetch("/api/currencies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.currencies) && data.currencies.length > 0) {
          const active = data.currencies.filter((c: any) => c.isEnabled !== false);
          if (active.length > 0) {
            setAvailableCurrencies(
              active.map((c: any) => ({
                code: c.code,
                name: c.name,
                symbol: c.symbol,
              }))
            );
            if (data.defaultCurrency?.code) {
              setCurrency(data.defaultCurrency.code);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const clean = email.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewUser(Boolean(data.isNewUser));
        setStep("otp");
        setCountdown(45);
        setCanResend(false);
        setSuccessMessage(`Verification code sent to ${clean}`);
        setTimeout(() => inputRefs[0]?.current?.focus(), 150);
      } else {
        setErrorMessage(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setErrorMessage("Network error while connecting to auth service.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP digit changes
  const handleOtpInput = (index: number, val: string) => {
    setErrorMessage("");
    const cleaned = val.replace(/[^0-9]/g, "");

    // Paste handling
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 4).split("");
      const nextOtp = [...otp];
      chars.forEach((c, i) => {
        nextOtp[i] = c;
      });
      setOtp(nextOtp);
      const targetIndex = Math.min(chars.length, 3);
      inputRefs[targetIndex]?.current?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = cleaned;
    setOtp(nextOtp);

    // Auto-advance
    if (cleaned && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) {
      setErrorMessage("Please enter the 4-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: enteredOtp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.isNewUser) {
          // New User: Proceed to Workspace Setup step!
          setIsNewUser(true);
          setFullName(data.suggestedName || "");
          setWorkspaceName(data.suggestedWorkspace || "");
          setStep("workspace");
        } else {
          // Existing User: Login successful! Set session and redirect immediately
          if (typeof window !== "undefined") {
            localStorage.setItem("voxera_logged_in", "true");
            localStorage.setItem(
              "voxera_user_session",
              JSON.stringify({
                userId: data.user?.id,
                workspaceId: data.workspace?.id,
                email: data.user?.email,
                workspaceName: data.workspace?.name,
              })
            );
          }
          // Redirect immediately with window.location.replace so /login is never in history
          window.location.replace("/dashboard/assistants");
          return;
        }
      } else {
        setErrorMessage(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMessage("Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Workspace Creation for New User
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!workspaceName.trim()) {
      setErrorMessage("Please enter a workspace name.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.join("") || "1234",
          fullName: fullName.trim(),
          workspaceName: workspaceName.trim(),
          currency: currency.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("voxera_logged_in", "true");
          localStorage.setItem(
            "voxera_user_session",
            JSON.stringify({
              userId: data.user?.id,
              workspaceId: data.workspace?.id,
              email: data.user?.email,
              workspaceName: data.workspace?.name,
            })
          );
        }
        // Redirect immediately with window.location.replace
        window.location.replace("/dashboard/assistants");
        return;
      } else {
        setErrorMessage(data.error || "Failed to create workspace.");
      }
    } catch (err) {
      setErrorMessage("Network error during workspace creation.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Simulation
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      setEmail("firozm613@gmail.com");
      setOtp(["1", "2", "3", "4"]);
      setStep("otp");
      setGoogleLoading(false);
    }, 600);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[#11E97F]" />
        <p className="text-xs font-semibold text-slate-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      {/* Main Centered Login Card */}
      <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-sm">
        {/* User Icon Circle with HackerRank Emerald Accent */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
          {step === "workspace" ? (
            <Building className="h-6 w-6 text-emerald-800 stroke-[2]" />
          ) : step === "success" ? (
            <Check className="h-6 w-6 text-emerald-800 stroke-[2.5]" />
          ) : (
            <User className="h-6 w-6 text-emerald-800 stroke-[2]" />
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {step === "email" && "Welcome back"}
            {step === "otp" && "Check your inbox"}
            {step === "workspace" && "Create workspace"}
            {step === "success" && "Welcome aboard"}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {step === "email" && `Sign in to ${BRAND_CONFIG.name}`}
            {step === "otp" && `Enter the 4-digit code sent to ${email}`}
            {step === "workspace" && "Set up your workspace to manage AI voice agents"}
            {step === "success" && "Redirecting to your dashboard..."}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && !errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: EMAIL ENTRY
            ========================================================================= */}
        {step === "email" && (
          <div>
            {/* Continue with Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full rounded-xl bg-[#0A0E1A] hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs py-3.5 px-4 flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer active:scale-98"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#11E97F]" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* OR Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">
                OR
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@voxera.ai"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#11E97F]/40 focus:border-[#11E97F] transition shadow-2xs font-medium"
                />
              </div>

              {/* Primary Theme Green Button (#11E97F) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#11E97F] hover:bg-[#0fd673] text-slate-950 font-black text-xs py-3.5 px-4 flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
              By continuing, you agree to {BRAND_CONFIG.name}&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>
        )}

        {/* =========================================================================
            STEP 2: OTP VERIFICATION (Fixed 1234)
            ========================================================================= */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700 truncate max-w-[240px]">{email}</span>
              <button
                onClick={() => {
                  setStep("email");
                  setErrorMessage("");
                }}
                className="text-emerald-600 hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>

            {/* 4 Square OTP Digit Inputs */}
            <div>
              <div className="flex items-center justify-center gap-2.5 my-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-13 w-13 text-center text-2xl font-black font-mono rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:border-[#11E97F] focus:ring-2 focus:ring-[#11E97F]/30 focus:bg-white transition shadow-2xs"
                  />
                ))}
              </div>
            </div>

            {/* Primary Theme Green Button (#11E97F) */}
            <button
              onClick={() => handleVerifyOtp()}
              disabled={loading || otp.join("").length < 4}
              className="w-full rounded-xl bg-[#11E97F] hover:bg-[#0fd673] disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 px-4 flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify OTP & Continue</span>
              )}
            </button>

            {/* Resend Countdown */}
            <div className="text-center pt-2">
              {canResend ? (
                <button
                  onClick={handleSendOtp}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  Resend OTP in <strong className="text-slate-700 font-mono">{countdown}s</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: WORKSPACE CREATION (For New Users)
            ========================================================================= */}
        {step === "workspace" && (
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Welcome to {BRAND_CONFIG.name}!</span>
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                Your workspace comes with{" "}
                <strong className="text-emerald-950 font-bold">
                  {(availableCurrencies.find((c) => c.code === currency)?.symbol || currency) + " 200.00"}
                </strong>{" "}
                starter welcome telephony credits.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Firoz Mohammad"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#11E97F]/40 focus:border-[#11E97F] transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Workspace Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Firoz Mohammad's Workspace"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#11E97F]/40 focus:border-[#11E97F] transition font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Your dedicated workspace for managing AI voice assistants & telephony.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Billing Currency <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#11E97F]/40 focus:border-[#11E97F] transition cursor-pointer pr-10"
                >
                  {availableCurrencies.map((c) => (
                    <option key={c.code} value={c.code} className="text-xs py-1">
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Telephony usage, call deductions, and invoices will be assigned in this currency.
              </p>
            </div>

            {/* Primary Theme Green Button (#11E97F) */}
            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="w-full rounded-xl bg-[#11E97F] hover:bg-[#0fd673] disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 px-4 flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Creating Workspace in DB...</span>
                </>
              ) : (
                <span>Create Workspace & Enter</span>
              )}
            </button>
          </form>
        )}

        {/* =========================================================================
            STEP 4: SUCCESS & SESSION METADATA CARD (Matching Screenshot 2)
            ========================================================================= */}
        {step === "success" && authSession && (
          <div className="space-y-4">
            {/* Metadata Card Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">EMAIL</span>
                <span className="text-slate-900 font-semibold truncate max-w-[220px]">{authSession.email}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">USER ID</span>
                <span className="text-slate-600 font-mono text-[11px] truncate max-w-[200px]">{authSession.userId}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">WORKSPACE</span>
                <span className="text-slate-900 font-bold truncate max-w-[200px]">{authSession.workspaceName}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">WORKSPACE ID</span>
                <span className="text-slate-600 font-mono text-[11px] truncate max-w-[200px]">{authSession.workspaceId}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DEVICE</span>
                <span className="text-slate-700 font-medium">Desktop · macOS</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">BROWSER</span>
                <span className="text-slate-700 font-medium">Chrome 155</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold py-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Launching dashboard...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
