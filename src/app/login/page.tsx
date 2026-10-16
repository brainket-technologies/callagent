"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Loader2 } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Google Login Simulation
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      // Simulate successful OAuth sign in
      router.push("/dashboard/assistants");
    }, 1200);
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpStep(true);
    }, 800);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP Verify
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/assistants");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      {/* Main Centered Login Card (Matching ringg.ai/login Screenshot) */}
      <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-sm">
        {/* User Icon Circle */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <User className="h-7 w-7 stroke-[1.75]" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Sign in to {BRAND_CONFIG.name}
          </p>
        </div>

        {!otpStep ? (
          <div>
            {/* Continue with Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full rounded-xl bg-[#0A0E1A] hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs py-3.5 px-4 flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer active:scale-98"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  {/* Google 'G' Icon */}
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
              <span className="relative bg-white px-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                OR
              </span>
            </div>

            {/* Email OTP Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder={`you@${BRAND_CONFIG.shortName.toLowerCase()}.ai`}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
                {errorMessage && (
                  <p className="text-[11px] text-red-500 mt-1.5">{errorMessage}</p>
                )}
              </div>

              {/* Send OTP Button (Matching grey tone when inactive, darker on focus/hover) */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-slate-500 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs py-3.5 px-4 transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: 6-Digit OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in-50">
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Verification code sent to <strong className="text-slate-900">{email}</strong>
              </p>
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold mt-1"
              >
                Change email
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-between gap-1.5 sm:gap-2 pt-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  className="h-12 w-11 sm:w-12 rounded-xl border border-slate-300 bg-slate-50 text-center text-lg font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-[11px] text-red-500 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0A0E1A] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-3.5 px-4 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Verify & Sign In ➔</span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  alert("A new 6-digit verification code has been re-sent to " + email);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
              >
                Didn&apos;t receive code? Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Footer Disclaimer (Exact match from screenshot) */}
        <p className="text-[11px] leading-relaxed text-slate-500 text-center mt-6">
          By continuing, you agree to {BRAND_CONFIG.name}&apos;s{" "}
          <Link href="/terms" className="underline hover:text-slate-800">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-slate-800">
            Privacy Policy
          </Link>
          , and to receive periodic emails with updates.
        </p>
      </div>
    </div>
  );
}
