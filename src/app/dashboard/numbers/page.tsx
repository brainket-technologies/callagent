"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import {
  Hash,
  Plus,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Copy,
  ExternalLink,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function NumbersPage() {
  const { phoneNumbers, numberPools } = useStore();
  const [localNumbers, setLocalNumbers] = useState(phoneNumbers);

  const [channel, setChannel] = useState<"phone" | "whatsapp">("phone");
  const [tab, setTab] = useState<"numbers" | "pools">("numbers");
  const [addNumberModalOpen, setAddNumberModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Telephony Carriers fetched from Admin / DB
  const [providers, setProviders] = useState<{ slug: string; name: string; logoUrl?: string; description: string }[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProviderSlug, setSelectedProviderSlug] = useState("tata_tele");
  const [providerName, setProviderName] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [providerApiKey, setProviderApiKey] = useState("");
  const [providerAuthToken, setProviderAuthToken] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch active providers configured by SuperAdmin
  const loadProviders = async () => {
    try {
      setLoadingProviders(true);
      const res = await fetch("/api/telephony-providers");
      const data = await res.json();
      if (data.success && Array.isArray(data.providers) && data.providers.length > 0) {
        setProviders(data.providers);
        setSelectedProviderSlug(data.providers[0].slug);
      }
    } catch (err) {
      console.error("Failed to load active telephony providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  React.useEffect(() => {
    loadProviders();
  }, []);

  const handleOpenAddModal = () => {
    loadProviders();
    setAddNumberModalOpen(true);
  };

  const selectedProviderObj = providers.find((p) => p.slug === selectedProviderSlug) || {
    slug: selectedProviderSlug,
    name: selectedProviderSlug.replace(/_/g, " "),
    logoUrl: "",
    description: "",
  };

  const handleConnectProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || !providerApiKey.trim() || !providerAuthToken.trim()) {
      showToast("Please fill in all required fields (Name, API Key, Auth Token)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/telephony-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerSlug: selectedProviderSlug,
          name: providerName,
          phoneNumber: phoneNumberInput || "+91 80 6558 " + Math.floor(1000 + Math.random() * 9000),
          apiKey: providerApiKey,
          authToken: providerAuthToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assignedNumber = phoneNumberInput.trim() || ("+91 80 6558 " + Math.floor(1000 + Math.random() * 9000));
        
        // Add new number to table
        const newEntry = {
          id: `num-${Date.now()}`,
          workspaceId: "ws-default",
          number: assignedNumber,
          countryCode: "IN",
          provider: selectedProviderObj.name.toLowerCase() as any,
          status: "active" as const,
          spamReputationScore: 98,
          monthlyRentalPaise: 149900,
          addedAt: new Date().toISOString(),
          assignedAssistantName: "Default Assistant",
        };

        setLocalNumbers((prev) => [newEntry, ...prev]);
        showToast(`Connected ${selectedProviderObj.name} trunk & added ${assignedNumber}!`);
        
        // Reset form
        setProviderName("");
        setPhoneNumberInput("");
        setProviderApiKey("");
        setProviderAuthToken("");
        setAddNumberModalOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Connect provider error:", err);
      showToast(err?.message || "Failed to connect carrier credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-neutral-700">
          <CheckCircle2 className="h-4 w-4 text-[#11E97F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Numbers</h1>
          <p className="text-sm text-neutral-500 mt-1">
            View all workspace numbers and group them into pools so calls rotate across them and spam-flagged numbers are skipped.
          </p>
        </div>

        {channel === "phone" && (
          <Button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add number
          </Button>
        )}
      </div>

      {/* Channel Pills (Phone vs WhatsApp) */}
      <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold w-fit">
        <button
          onClick={() => setChannel("phone")}
          className={`rounded-lg px-4 py-1.5 transition ${
            channel === "phone" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
          }`}
        >
          Phone
        </button>
        <button
          onClick={() => setChannel("whatsapp")}
          className={`rounded-lg px-4 py-1.5 transition ${
            channel === "whatsapp" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
          }`}
        >
          WhatsApp
        </button>
      </div>

      {channel === "phone" ? (
        <div className="space-y-4">
          {/* Subtabs (All Numbers vs Number Pools) */}
          <div className="flex border-b border-neutral-200 text-xs font-semibold">
            <button
              onClick={() => setTab("numbers")}
              className={`pb-3 px-3 border-b-2 transition ${
                tab === "numbers" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
              }`}
            >
              All Numbers
            </button>
            <button
              onClick={() => setTab("pools")}
              className={`pb-3 px-3 border-b-2 transition ${
                tab === "pools" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
              }`}
            >
              Number Pools
            </button>
          </div>

          {tab === "numbers" ? (
            /* Table of Phone Numbers */
            <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Number</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Pool</th>
                      <th className="py-3 px-4">Reputation</th>
                      <th className="py-3 px-4">Used By</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {localNumbers.map((num) => (
                      <tr key={num.id} className="hover:bg-neutral-50/80">
                        <td className="py-3.5 px-4 font-mono text-neutral-400">{num.id}</td>
                        <td className="py-3.5 px-4 text-base">
                          {num.countryCode === "IN" ? "🇮🇳" : "🇺🇸"}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">{num.number}</td>
                        <td className="py-3.5 px-4 font-semibold text-neutral-700 capitalize">{num.provider}</td>
                        <td className="py-3.5 px-4 text-neutral-600">{num.poolName || "—"}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {num.spamReputationScore}/100
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">{num.assignedAssistantName || "—"}</td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Number Pools Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberPools.map((pool) => (
                <div key={pool.id} className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-neutral-900">{pool.name}</p>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Strategy: <strong className="text-neutral-800 capitalize">{pool.strategy.replace(/_/g, " ")}</strong></p>
                    <p>Active DIDs: <strong className="text-neutral-800">{pool.numbersCount}</strong></p>
                    <p>Quarantined: <strong className="text-neutral-800">{pool.quarantinedCount}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* WHATSAPP TAB */
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">WhatsApp Business is not set up yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              Connect a WhatsApp Business account to add and manage numbers from here.
            </p>
          </div>
          <Button
            onClick={() => setWhatsappModalOpen(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs px-5 py-2.5"
          >
            Setup WhatsApp business
          </Button>
        </div>
      )}

      {/* MODAL: ADD NUMBER & CONNECT CARRIER */}
      <Modal
        isOpen={addNumberModalOpen}
        onClose={() => setAddNumberModalOpen(false)}
        title="Add Telephony Number & Carrier Trunk"
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Provider List on Left (Dynamically populated from Admin) */}
          <div className="md:col-span-4 border-r border-neutral-100 pr-3 space-y-1.5 max-h-[380px] overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 pb-1">
              Supported Carriers
            </div>
            {loadingProviders ? (
              <div className="p-4 text-center text-xs text-neutral-400">Loading carriers...</div>
            ) : providers.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400">No active carriers configured by admin.</div>
            ) : (
              providers.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setSelectedProviderSlug(p.slug)}
                  className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-left transition cursor-pointer ${
                    selectedProviderSlug === p.slug
                      ? "bg-neutral-900 text-white font-bold shadow-xs"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-[11px] overflow-hidden ${
                        selectedProviderSlug === p.slug ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {p.logoUrl ? (
                        <img src={p.logoUrl} alt={p.name} className="h-full w-full object-contain p-0.5" />
                      ) : (
                        p.name.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span>{p.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Form on Right: User inputs their own API key & Auth Token */}
          <form onSubmit={handleConnectProvider} className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              {selectedProviderObj.logoUrl ? (
                <div className="h-9 w-9 rounded-xl bg-neutral-100 border border-neutral-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={selectedProviderObj.logoUrl} alt={selectedProviderObj.name} className="h-full w-full object-contain" />
                </div>
              ) : null}
              <div>
                <h4 className="text-sm font-bold text-neutral-900">
                  Configure {selectedProviderObj.name} Account
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Enter your {selectedProviderObj.name} API credentials to route calls through your carrier trunk.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Account / Trunk Name *</label>
              <input
                type="text"
                required
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. Production Voice Trunk"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Phone Number (DID) *</label>
              <input
                type="text"
                required
                value={phoneNumberInput}
                onChange={(e) => setPhoneNumberInput(e.target.value)}
                placeholder="e.g. +91 80 6558 0570"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">API Key / Account SID *</label>
              <div className="relative mt-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  required
                  value={providerApiKey}
                  onChange={(e) => setProviderApiKey(e.target.value)}
                  placeholder="Enter API Key or Account SID"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-9 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Auth Token / Secret *</label>
              <div className="relative mt-1">
                <input
                  type={showAuthToken ? "text" : "password"}
                  required
                  value={providerAuthToken}
                  onChange={(e) => setProviderAuthToken(e.target.value)}
                  placeholder="Enter Auth Token or Secret"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-9 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddNumberModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>{submitting ? "Connecting..." : "Save & Connect Trunk"}</span>
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL: LINK WHATSAPP BUSINESS (Matching Screenshot 35!) */}
      <Modal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        maxWidth="md"
      >
        <div className="py-4 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Link or create a WhatsApp Business account</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Sign in with Meta to connect an existing WhatsApp Business account or create a new one in a few steps.
            </p>
          </div>
          <Button
            onClick={() => {
              alert("Meta WhatsApp Business Cloud API OAuth initiated.");
              setWhatsappModalOpen(false);
            }}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-10"
          >
            Setup WhatsApp Business Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
