"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Database,
  Loader2,
} from "lucide-react";

export default function AdminPaymentSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRazorpay, setIsSavingRazorpay] = useState(false);
  const [isSavingStripe, setIsSavingStripe] = useState(false);

  // ===========================================================================
  // 1. RAZORPAY CONFIGURATION STATE
  // ===========================================================================
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayMode, setRazorpayMode] = useState<"live" | "test">("live");
  const [razorpayEditTab, setRazorpayEditTab] = useState<"live" | "test">("live");

  // Razorpay Live Credentials
  const [razorpayLiveKey, setRazorpayLiveKey] = useState("rzp_live_89kjasd8213jks");
  const [razorpayLiveSecret, setRazorpayLiveSecret] = useState("••••••••••••••••••••");
  const [razorpayLiveWebhook, setRazorpayLiveWebhook] = useState("whsec_90812398129038102938");

  // Razorpay Test (Sandbox) Credentials
  const [razorpayTestKey, setRazorpayTestKey] = useState("rzp_test_12abcd890123");
  const [razorpayTestSecret, setRazorpayTestSecret] = useState("••••••••••••••••••••");
  const [razorpayTestWebhook, setRazorpayTestWebhook] = useState("whsec_test_90812398129038");

  // ===========================================================================
  // 2. STRIPE CONFIGURATION STATE
  // ===========================================================================
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripeMode, setStripeMode] = useState<"live" | "test">("live");
  const [stripeEditTab, setStripeEditTab] = useState<"live" | "test">("live");

  // Stripe Live Credentials
  const [stripeLivePublishable, setStripeLivePublishable] = useState("pk_live_51Ozx928123891023812");
  const [stripeLiveSecret, setStripeLiveSecret] = useState("••••••••••••••••••••");
  const [stripeLiveWebhook, setStripeLiveWebhook] = useState("whsec_stripe_89123890123");

  // Stripe Test (Sandbox) Credentials
  const [stripeTestPublishable, setStripeTestPublishable] = useState("pk_test_51Ozx928TEST991203812");
  const [stripeTestSecret, setStripeTestSecret] = useState("••••••••••••••••••••");
  const [stripeTestWebhook, setStripeTestWebhook] = useState("whsec_test_stripe_89123890123");

  // ===========================================================================
  // FETCH LIVE DATA FROM POSTGRESQL DATABASE
  // ===========================================================================
  const fetchGatewaysFromDB = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/payment-gateways");
      const data = await res.json();

      if (data.success && Array.isArray(data.gateways)) {
        // Find Razorpay
        const rzp = data.gateways.find((g: any) => g.provider === "razorpay");
        if (rzp) {
          setRazorpayEnabled(rzp.isEnabled);
          setRazorpayMode(rzp.mode as "live" | "test");
          setRazorpayEditTab(rzp.mode as "live" | "test");
          if (rzp.liveKeyId) setRazorpayLiveKey(rzp.liveKeyId);
          if (rzp.liveSecret) setRazorpayLiveSecret(rzp.liveSecret);
          if (rzp.liveWebhookSecret) setRazorpayLiveWebhook(rzp.liveWebhookSecret);
          if (rzp.testKeyId) setRazorpayTestKey(rzp.testKeyId);
          if (rzp.testSecret) setRazorpayTestSecret(rzp.testSecret);
          if (rzp.testWebhookSecret) setRazorpayTestWebhook(rzp.testWebhookSecret);
        }

        // Find Stripe
        const strp = data.gateways.find((g: any) => g.provider === "stripe");
        if (strp) {
          setStripeEnabled(strp.isEnabled);
          setStripeMode(strp.mode as "live" | "test");
          setStripeEditTab(strp.mode as "live" | "test");
          if (strp.liveKeyId) setStripeLivePublishable(strp.liveKeyId);
          if (strp.liveSecret) setStripeLiveSecret(strp.liveSecret);
          if (strp.liveWebhookSecret) setStripeLiveWebhook(strp.liveWebhookSecret);
          if (strp.testKeyId) setStripeTestPublishable(strp.testKeyId);
          if (strp.testSecret) setStripeTestSecret(strp.testSecret);
          if (strp.testWebhookSecret) setStripeTestWebhook(strp.testWebhookSecret);
        }
      }
    } catch (err) {
      console.error("Error loading payment gateways from DB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewaysFromDB();
  }, []);

  // ===========================================================================
  // LIVE TOGGLE SWITCH HANDLERS (ON CLICK -> IMMEDIATE DB UPDATE)
  // ===========================================================================
  const handleToggleRazorpay = async (newVal: boolean) => {
    setRazorpayEnabled(newVal);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "razorpay",
          isEnabled: newVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Razorpay is now ${newVal ? "ENABLED (ON)" : "DISABLED (OFF)"} in Database!`);
      } else {
        showToast(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating status");
    }
  };

  const handleToggleStripe = async (newVal: boolean) => {
    setStripeEnabled(newVal);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "stripe",
          isEnabled: newVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stripe is now ${newVal ? "ENABLED (ON)" : "DISABLED (OFF)"} in Database!`);
      } else {
        showToast(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating status");
    }
  };

  // ===========================================================================
  // LIVE MODE CHANGE HANDLERS (LIVE <-> TEST -> IMMEDIATE DB UPDATE)
  // ===========================================================================
  const handleModeChangeRazorpay = async (newMode: "live" | "test") => {
    setRazorpayMode(newMode);
    setRazorpayEditTab(newMode);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "razorpay",
          mode: newMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Razorpay switched to ${newMode.toUpperCase()} mode in Database!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating Razorpay mode");
    }
  };

  const handleModeChangeStripe = async (newMode: "live" | "test") => {
    setStripeMode(newMode);
    setStripeEditTab(newMode);
    try {
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "stripe",
          mode: newMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stripe switched to ${newMode.toUpperCase()} mode in Database!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating Stripe mode");
    }
  };

  // ===========================================================================
  // SAVE BUTTON HANDLERS (SAVES ALL KEYS, SECRETS & MODES TO DB)
  // ===========================================================================
  const handleSaveRazorpay = async () => {
    try {
      setIsSavingRazorpay(true);
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "razorpay",
          isEnabled: razorpayEnabled,
          mode: razorpayMode,
          liveKeyId: razorpayLiveKey,
          liveSecret: razorpayLiveSecret,
          liveWebhookSecret: razorpayLiveWebhook,
          testKeyId: razorpayTestKey,
          testSecret: razorpayTestSecret,
          testWebhookSecret: razorpayTestWebhook,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Razorpay settings (${razorpayMode.toUpperCase()} mode) saved in PostgreSQL!`);
      } else {
        showToast(data.error || "Failed to save Razorpay settings");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while saving Razorpay");
    } finally {
      setIsSavingRazorpay(false);
    }
  };

  const handleSaveStripe = async () => {
    try {
      setIsSavingStripe(true);
      const res = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "stripe",
          isEnabled: stripeEnabled,
          mode: stripeMode,
          liveKeyId: stripeLivePublishable,
          liveSecret: stripeLiveSecret,
          liveWebhookSecret: stripeLiveWebhook,
          testKeyId: stripeTestPublishable,
          testSecret: stripeTestSecret,
          testWebhookSecret: stripeTestWebhook,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Stripe settings (${stripeMode.toUpperCase()} mode) saved in PostgreSQL!`);
      } else {
        showToast(data.error || "Failed to save Stripe settings");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while saving Stripe");
    } finally {
      setIsSavingStripe(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <span>Payment Gateway Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Live & Test (Sandbox) mode credentials for Razorpay and Stripe with instant mode switching.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-500">Loading live gateway credentials from PostgreSQL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* =======================================================================
              RAZORPAY CARD (DYNAMIC POSTGRESQL)
              ======================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            {/* Top Provider Bar & Power Toggle (Auto-saves on change) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Razorpay (India UPI / Cards)</h3>
                  <p className="text-[11px] text-slate-500">
                    Status: {razorpayEnabled ? "Active & Accepting Payments" : "Disabled (Off)"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch with Immediate DB update on click */}
              <label className="relative inline-flex items-center cursor-pointer" title="Click to toggle ON / OFF in database">
                <input
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => handleToggleRazorpay(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* ACTIVE MODE SWITCHER (Live Mode vs Test Mode - Auto-saves on click) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Gateway Active Environment</span>
                <span className="text-[10px] text-slate-500">
                  {razorpayMode === "live"
                    ? "Real customer payments will be collected"
                    : "Dummy sandbox testing mode active"}
                </span>
              </div>

              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleModeChangeRazorpay("live")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    razorpayMode === "live"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Live Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChangeRazorpay("test")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    razorpayMode === "test"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Test Mode
                </button>
              </div>
            </div>

            {/* Active Mode Notice Banner */}
            {razorpayMode === "test" ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Razorpay is in <strong>Test Sandbox Mode</strong>. Real money will not be deducted.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Razorpay is in <strong>Live Production Mode</strong>. Real transactions enabled.</span>
              </div>
            )}

            {/* Key Tab Switcher (Live Keys vs Test Keys) */}
            <div className="border-b border-slate-200 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                API Credentials:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setRazorpayEditTab("live")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    razorpayEditTab === "live" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Live Keys
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpayEditTab("test")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    razorpayEditTab === "test" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Test (Sandbox) Keys
                </button>
              </div>
            </div>

            {/* Form Fields: Live vs Test */}
            {razorpayEditTab === "live" ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Live Key ID (starts with <span className="font-mono text-emerald-700">rzp_live_</span>)
                  </label>
                  <input
                    type="text"
                    value={razorpayLiveKey}
                    onChange={(e) => setRazorpayLiveKey(e.target.value)}
                    placeholder="rzp_live_..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Live Key Secret</label>
                  <input
                    type="password"
                    value={razorpayLiveSecret}
                    onChange={(e) => setRazorpayLiveSecret(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Live Webhook Secret</label>
                  <input
                    type="text"
                    value={razorpayLiveWebhook}
                    onChange={(e) => setRazorpayLiveWebhook(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs bg-amber-50/30 p-3 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Test Key ID (starts with <span className="font-mono text-amber-700">rzp_test_</span>)
                  </label>
                  <input
                    type="text"
                    value={razorpayTestKey}
                    onChange={(e) => setRazorpayTestKey(e.target.value)}
                    placeholder="rzp_test_..."
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Test Key Secret</label>
                  <input
                    type="password"
                    value={razorpayTestSecret}
                    onChange={(e) => setRazorpayTestSecret(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Test Webhook Secret</label>
                  <input
                    type="text"
                    value={razorpayTestWebhook}
                    onChange={(e) => setRazorpayTestWebhook(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveRazorpay}
              disabled={isSavingRazorpay}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isSavingRazorpay ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Saving to PostgreSQL Database...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Razorpay Settings</span>
                </>
              )}
            </button>
          </div>

          {/* =======================================================================
              STRIPE CARD (DYNAMIC POSTGRESQL)
              ======================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            {/* Top Provider Bar & Power Toggle (Auto-saves on change) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Stripe (International USD)</h3>
                  <p className="text-[11px] text-slate-500">
                    Status: {stripeEnabled ? "Active & Accepting Payments" : "Disabled (Off)"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch with Immediate DB update on click */}
              <label className="relative inline-flex items-center cursor-pointer" title="Click to toggle ON / OFF in database">
                <input
                  type="checkbox"
                  checked={stripeEnabled}
                  onChange={(e) => handleToggleStripe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* ACTIVE MODE SWITCHER (Live Mode vs Test Mode - Auto-saves on click) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Gateway Active Environment</span>
                <span className="text-[10px] text-slate-500">
                  {stripeMode === "live"
                    ? "Real cards will be charged in USD / EUR"
                    : "Stripe test 4242 dummy cards enabled"}
                </span>
              </div>

              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleModeChangeStripe("live")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    stripeMode === "live"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Live Mode
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChangeStripe("test")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    stripeMode === "test"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Test Mode
                </button>
              </div>
            </div>

            {/* Active Mode Notice Banner */}
            {stripeMode === "test" ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Stripe is in <strong>Test Sandbox Mode</strong>. Use 4242 4242... test credit cards.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-[11px] font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Stripe is in <strong>Live Production Mode</strong>. Real charges enabled.</span>
              </div>
            )}

            {/* Key Tab Switcher (Live Keys vs Test Keys) */}
            <div className="border-b border-slate-200 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                API Credentials:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setStripeEditTab("live")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    stripeEditTab === "live" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Live Keys
                </button>
                <button
                  type="button"
                  onClick={() => setStripeEditTab("test")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    stripeEditTab === "test" ? "bg-white text-slate-900 font-bold shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Test (Sandbox) Keys
                </button>
              </div>
            </div>

            {/* Form Fields: Live vs Test */}
            {stripeEditTab === "live" ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Live Publishable Key (starts with <span className="font-mono text-emerald-700">pk_live_</span>)
                  </label>
                  <input
                    type="text"
                    value={stripeLivePublishable}
                    onChange={(e) => setStripeLivePublishable(e.target.value)}
                    placeholder="pk_live_..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Live Secret Key</label>
                  <input
                    type="password"
                    value={stripeLiveSecret}
                    onChange={(e) => setStripeLiveSecret(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Live Webhook Signing Secret</label>
                  <input
                    type="text"
                    value={stripeLiveWebhook}
                    onChange={(e) => setStripeLiveWebhook(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs bg-amber-50/30 p-3 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Test Publishable Key (starts with <span className="font-mono text-amber-700">pk_test_</span>)
                  </label>
                  <input
                    type="text"
                    value={stripeTestPublishable}
                    onChange={(e) => setStripeTestPublishable(e.target.value)}
                    placeholder="pk_test_..."
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Test Secret Key</label>
                  <input
                    type="password"
                    value={stripeTestSecret}
                    onChange={(e) => setStripeTestSecret(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Test Webhook Signing Secret</label>
                  <input
                    type="text"
                    value={stripeTestWebhook}
                    onChange={(e) => setStripeTestWebhook(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSaveStripe}
              disabled={isSavingStripe}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isSavingStripe ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Saving to PostgreSQL Database...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Stripe Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
