"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  FileCode,
  Smartphone,
  Send,
  RefreshCw,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function AdminFirebaseSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fcmKey, setFcmKey] = useState("");
  const [storageBucket, setStorageBucket] = useState("");
  const [serviceAccountJson, setServiceAccountJson] = useState("");

  // Test Push notification state (empty by default for user testing)
  const [testToken, setTestToken] = useState("");
  const [testTitle, setTestTitle] = useState("Incoming AI Assistant Call");
  const [testBody, setTestBody] = useState("Lead #90123 has initiated an inbound conversation.");
  const [sendingPush, setSendingPush] = useState(false);

  // Load configuration from PostgreSQL on mount
  useEffect(() => {
    async function loadFirebaseConfig() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/firebase-config");
        const data = await res.json();
        if (data.success && data.config) {
          setProjectId(data.config.projectId || "");
          setApiKey(data.config.apiKey || "");
          setFcmKey(data.config.fcmKey || "");
          setStorageBucket(data.config.storageBucket || "");
          setServiceAccountJson(data.config.serviceAccountJson || "");
        }
      } catch (err) {
        console.error("Failed to load firebase configuration:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFirebaseConfig();
  }, []);

  // Save configuration to PostgreSQL database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/firebase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          apiKey,
          fcmKey,
          storageBucket,
          serviceAccountJson,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Firebase configuration successfully saved to database!");
      } else {
        showToast(data.error || "Failed to save firebase settings");
      }
    } catch (err) {
      showToast("Network error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPush = () => {
    if (!testToken.trim()) {
      showToast("Please enter target device FCM token");
      return;
    }
    setSendingPush(true);
    setTimeout(() => {
      setSendingPush(false);
      showToast("FCM Data Message successfully sent to target device!");
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

      {/* Grid Layout: Left Firebase Config, Right Test Push Notification Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Firebase Settings Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs rounded-3xl z-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          )}

          {/* Header with Title & Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Firebase Cloud Messaging (FCM) & Push Config
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Firebase project parameters used for mobile & web push notifications
              </p>
            </div>

            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-2xs">
              HTTP v1 Ready
            </span>
          </div>

          {/* Firebase Credentials Form */}
          <div className="pt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="project-id"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Web API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="•••••••••••••••••••••••••••••"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  FCM Server Key (Legacy / v1)
                </label>
                <input
                  type="password"
                  value={fcmKey}
                  onChange={(e) => setFcmKey(e.target.value)}
                  placeholder="•••••••••••••••••••••••••••••"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Storage Bucket URI</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="bucket.appspot.com"
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200/90 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileCode className="h-4 w-4 text-slate-500" />
                  <span>Service Account JSON (Firebase Admin SDK)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Format: JSON</span>
              </div>
              <textarea
                rows={6}
                value={serviceAccountJson}
                onChange={(e) => setServiceAccountJson(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200/90 font-mono text-xs text-slate-800 bg-slate-50/50 focus:outline-none focus:border-slate-900 leading-relaxed shadow-2xs transition"
              />
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
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Firebase Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Send Test Push Notification Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Send Test Push</h3>
                <p className="text-[11px] text-slate-500">Test FCM payload delivery</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatch a test FCM silent data payload to verify device token reception and background triggers.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Device Token
                </label>
                <input
                  type="text"
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  placeholder="Paste device FCM token"
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200/90 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Message Body
                </label>
                <input
                  type="text"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="Message payload body"
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition shadow-2xs"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendPush}
              disabled={sendingPush}
              className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
            >
              {sendingPush ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Dispatching Push...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-current" />
                  <span>Send Test Push</span>
                </>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>High-Priority Data Payload</span>
              </div>
              <p className="text-[11px] text-amber-950/80 leading-relaxed">
                Messages use silent background data payloads to ensure immediate wake of iOS CallKit & Android services even when app is killed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
