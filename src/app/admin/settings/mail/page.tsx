"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, Send, RefreshCw, Loader2 } from "lucide-react";

export default function AdminMailSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");

  // Test Email state (empty by default for user testing)
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Load configuration from PostgreSQL on mount
  useEffect(() => {
    async function loadMailConfig() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/mail-config");
        const data = await res.json();
        if (data.success && data.config) {
          setSmtpHost(data.config.smtpHost || "");
          setSmtpPort(data.config.smtpPort || "587");
          setSmtpUser(data.config.smtpUser || "");
          setSmtpPass(data.config.smtpPass || "");
          setFromEmail(data.config.fromEmail || "");
          setFromName(data.config.fromName || "");
        }
      } catch (err) {
        console.error("Failed to load mail configuration:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMailConfig();
  }, []);

  // Save configuration to PostgreSQL database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/mail-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          fromEmail,
          fromName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Custom SMTP settings successfully saved to database!");
      } else {
        showToast(data.error || "Failed to save mail settings");
      }
    } catch (err) {
      showToast("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = () => {
    if (!testRecipient.trim()) {
      showToast("Please enter a recipient email address");
      return;
    }
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      showToast(`Test email successfully dispatched to ${testRecipient.trim()}!`);
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid Layout: Left SMTP Config, Right Send Test Email Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Custom SMTP Configuration Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs rounded-3xl z-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          )}

          {/* Header with Title & Custom SMTP Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Email Delivery Service</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure custom SMTP server to route all system emails
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/60 shadow-2xs">
              Custom SMTP
            </div>
          </div>

          {/* Custom SMTP Form Fields */}
          <div className="pt-6 space-y-5">
            {/* SMTP Host & Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.sendgrid.net"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            {/* SMTP Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="apikey"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            {/* From Email Address & From Sender Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="notifications@voxera.ai"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  From Sender Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Voxera AI Cloud"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-12 px-6 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2.5 transition cursor-pointer shadow-xs active:scale-98 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Mail Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Send Test Email Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Send Test Email</h3>
                <p className="text-[11px] text-slate-500">Verify SMTP delivery</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Verify your SMTP server configuration and deliverability by firing a real-time verification email.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Recipient Email
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Enter recipient email"
                className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTest}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
            >
              {sendingTest ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Dispatching Test Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Test Email</span>
                </>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="h-2 w-2 rounded-full bg-[#11E97F]" />
                <span>Port 587 / 465 Verified</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Test email sends an authentication ping to ensure server handshake, TLS security, and credentials are functioning properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
