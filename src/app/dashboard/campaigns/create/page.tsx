"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store-context";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Phone,
  Bot,
  GitBranch,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateCampaignWizardPage() {
  const router = useRouter();
  const { assistants, numberPools, createCampaign } = useStore();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [campaignName, setCampaignName] = useState("Main campaign");
  const [campaignType, setCampaignType] = useState<"assistant" | "workflow">("assistant");
  const [selectedAssistantId, setSelectedAssistantId] = useState(assistants[0]?.id || "");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; rows: number } | null>(null);

  // Step 2 fields
  const [selectedPool, setSelectedPool] = useState(numberPools[0]?.name || "Primary Bangalore Pool");
  const [concurrency, setConcurrency] = useState(15);
  const [retryAttempts, setRetryAttempts] = useState(2);
  const [complianceHours, setComplianceHours] = useState("09:00 - 21:00 (IST)");

  const handleSimulateUpload = () => {
    setUploadedFile({
      name: "q4_contacts_lead_list.csv",
      size: "2.4 MB",
      rows: 1500,
    });
  };

  const handleLaunch = () => {
    const asst = assistants.find((a) => a.id === selectedAssistantId) || assistants[0];
    createCampaign({
      name: campaignName,
      type: "outbound_call",
      assistantId: asst.id,
      assistantName: asst.name,
      totalContacts: uploadedFile?.rows || 1000,
      concurrencyLimit: concurrency,
      retryAttempts,
    });

    alert(`Campaign "${campaignName}" launched successfully with ${concurrency} concurrent dialing channels!`);
    router.push("/dashboard/campaigns");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Header & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/campaigns"
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Create Outbound Campaign</h1>
          <p className="text-xs text-neutral-500">
            Upload CSV contacts and configure high-concurrency auto-dialing policies.
          </p>
        </div>
      </div>

      {/* 2-Step Progress Indicator (Matching Ringg.AI!) */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 1 ? "bg-neutral-900 text-white" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            1
          </span>
          <span className={step === 1 ? "text-neutral-900 font-bold" : "text-neutral-500"}>
            Upload details
          </span>
        </div>
        <div className="h-px w-12 bg-neutral-200" />
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 2 ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            2
          </span>
          <span className={step === 2 ? "text-neutral-900 font-bold" : "text-neutral-500"}>
            Configure campaign
          </span>
        </div>
      </div>

      {/* STEP 1: UPLOAD DETAILS */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Campaign details
            </h3>
            <p className="text-xs text-neutral-500">Name this campaign and choose an assistant or workflow.</p>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Campaign name *</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Campaign type *</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCampaignType("assistant")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    campaignType === "assistant"
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <Bot className="h-5 w-5 text-neutral-900 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Assistant</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Call a list with one assistant</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignType("workflow")}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    campaignType === "workflow"
                      ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <GitBranch className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Workflow</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Run a multi-step workflow</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Select assistant *</label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none"
              >
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.version}) - {a.voiceName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Calling List Dropzone */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Upload calling list *
            </h3>
            <p className="text-xs text-neutral-500">Upload your calling list for this campaign.</p>

            {!uploadedFile ? (
              <div
                onClick={handleSimulateUpload}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-neutral-900">
                  Drag &apos;n&apos; Drop or <span className="underline">Select File</span>
                </p>
                <p className="text-xs text-neutral-500 mt-1">Supported format: CSV • Maximum file size: 20MB</p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{uploadedFile.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {uploadedFile.size} • <strong>{uploadedFile.rows} valid phone rows</strong> detected
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-neutral-500 hover:text-red-600"
                >
                  Change file
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!uploadedFile) {
                  handleSimulateUpload();
                }
                setStep(2);
              }}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-6"
            >
              Continue to Step 2 ➔
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURE CAMPAIGN */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Telephony & Concurrency Rules
            </h3>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Caller ID / Rotating Number Pool *</label>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none"
              >
                {numberPools.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.numbersCount} rotating DIDs - Spam protected)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-neutral-700">Max Simultaneous Concurrency Channels</label>
                <span className="font-bold text-neutral-900">{concurrency} channels</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="mt-2 w-full accent-neutral-900 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Dials up to {concurrency} customers concurrently without tripping carrier spam thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-700">Compliance Dialing Window</label>
                <input
                  type="text"
                  value={complianceHours}
                  disabled
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-700"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Restricted to TRAI / DoT compliant hours.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Smart Retry Logic on Busy/No Answer</label>
                <select
                  value={retryAttempts}
                  onChange={(e) => setRetryAttempts(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900"
                >
                  <option value={1}>1 retry (after 30 mins)</option>
                  <option value={2}>2 retries (after 1 hour)</option>
                  <option value={3}>3 retries (after 2 hours)</option>
                  <option value={0}>Do not retry</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget Pre-flight Estimate */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-950 p-6 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Pre-Flight Campaign Estimation
            </h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-neutral-400">Total Contacts</p>
                <p className="text-base font-bold mt-0.5">{uploadedFile?.rows || 1000}</p>
              </div>
              <div>
                <p className="text-neutral-400">Est. Talk Duration</p>
                <p className="text-base font-bold mt-0.5">~1,500 mins</p>
              </div>
              <div>
                <p className="text-neutral-400">Rate Card</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">₹10.00 / min</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400 pt-1">
              Deducted per-second from workspace prepaid balance in real-time as calls complete.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Step 1
            </Button>
            <Button onClick={handleLaunch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
              Launch Campaign ➔
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
