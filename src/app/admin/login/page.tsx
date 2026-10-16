"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function AdminLoginPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already authenticated, redirect to /admin immediately — never show login page again
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("voxera_admin_authenticated");
      if (isAuth === "true") {
        window.location.replace("/admin");
        return;
      }
      setCheckingAuth(false);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your administrator username or email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("voxera_admin_authenticated", "true");
          localStorage.setItem("voxera_admin_user", data.admin?.email || email);
          localStorage.setItem("voxera_admin_login_time", new Date().toISOString());
          document.cookie = "voxera_admin_authenticated=true; path=/; max-age=604800";
        }
        setSuccess(true);
        // Replace page in history so back button cannot return to login
        window.location.replace("/admin");
        return;
      } else {
        setLoading(false);
        setError(data.message || "Invalid administrator credentials.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center p-4 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      {/* Background Soft Dot Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* Ambient Emerald Radial Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-[#11E97F]/16 via-emerald-100/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#11E97F]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[350px] w-[350px] rounded-full bg-emerald-200/20 blur-3xl" />

      {/* Main Single Centered Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60">
        {/* Shield Icon Circle */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-2xs">
          <ShieldCheck className="h-7 w-7 text-emerald-600 stroke-[1.75]" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Login
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Sign in to {BRAND_CONFIG.name} Control Plane
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Authenticated successfully. Redirecting to Admin Plane...</span>
          </div>
        )}

        {/* Form: Email & Password (Autofill strictly disabled) */}
        <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
          {/* Honeypot hidden fields to divert Chrome password manager */}
          <div className="sr-only" aria-hidden="true">
            <input type="text" name="chrome_prevent_autofill_user" tabIndex={-1} autoComplete="off" />
            <input type="password" name="chrome_prevent_autofill_pwd" tabIndex={-1} autoComplete="new-password" />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="text"
                name="voxera_adm_u7x"
                id="voxera_adm_u7x"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                readOnly
                onFocus={(e) => {
                  e.target.readOnly = false;
                }}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter admin email"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-100 focus:outline-none transition shadow-2xs"
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="voxera_adm_p9k"
                id="voxera_adm_p9k"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                readOnly
                onFocus={(e) => {
                  e.target.readOnly = false;
                }}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter admin password"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-100 focus:outline-none transition shadow-2xs"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-12 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] disabled:opacity-50 text-[#0A0E1A] font-extrabold text-xs transition shadow-sm hover:shadow-md hover:shadow-[#11E97F]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#0A0E1A]" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 text-center mt-6">
          Authorized personnel only • Protected by enterprise TLS encryption
        </p>
      </div>
    </div>
  );
}
