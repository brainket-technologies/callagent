"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode2,
  Terminal,
  Zap,
  Copy,
  Check,
  ShieldCheck,
  Radio,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("curl");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST https://api.voxera.ai/v1/calls \\
  -H "Authorization: Bearer vx_live_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assistant_id": "asst_emi_recovery_prod",
    "customer": {
      "phone_number": "+919876543210",
      "name": "Rahul Sharma"
    },
    "dynamic_variables": {
      "emi_amount": "₹4,250",
      "due_date": "15th October",
      "payment_link": "https://pay.bank.com/x91"
    }
  }'`,
    python: `import voxera

client = voxera.Client(api_key="vx_live_secret_key")

call = client.calls.create(
    assistant_id="asst_emi_recovery_prod",
    customer={
        "phone_number": "+919876543210",
        "name": "Rahul Sharma"
    },
    dynamic_variables={
        "emi_amount": "₹4,250",
        "due_date": "15th October"
    }
)

print(f"Call dispatched successfully! Call ID: {call.id}")`,
    node: `import { VoxeraClient } from "@voxera/voice-sdk";

const voxera = new VoxeraClient({
  apiKey: "vx_live_secret_key"
});

const call = await voxera.calls.create({
  assistantId: "asst_emi_recovery_prod",
  customer: {
    phoneNumber: "+919876543210",
    name: "Rahul Sharma"
  },
  dynamicVariables: {
    emiAmount: "₹4,250",
    dueDate: "15th October"
  }
});

console.log("Call placed with ID:", call.id);`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <FileCode2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Developer Documentation & SDK Reference</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
            {BRAND_CONFIG.name} REST API & SDKs
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Dispatch autonomous phone calls, stream real-time transcripts via WebSockets, and program custom webhook listeners in minutes.
          </p>
        </div>

        {/* Code Playground Box */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("curl")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "curl" ? "bg-[#11E97F] text-[#0A0E1A]" : "text-slate-400 hover:text-white"
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab("python")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "python" ? "bg-[#11E97F] text-[#0A0E1A]" : "text-slate-400 hover:text-white"
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === "node" ? "bg-[#11E97F] text-[#0A0E1A]" : "text-slate-400 hover:text-white"
                }`}
              >
                Node / TypeScript
              </button>
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#11E97F]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="overflow-x-auto text-xs text-[#11E97F] font-mono leading-relaxed">
            {codeSnippets[activeTab]}
          </pre>
        </div>

        {/* Endpoint Specs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
            <p className="text-xs font-bold font-mono text-emerald-700">POST /v1/calls</p>
            <h4 className="font-bold text-sm text-slate-900">Initiate Outbound Call</h4>
            <p className="text-xs text-slate-500">
              Triggers sub-second SIP dialer with customized dynamic variables and prompts.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
            <p className="text-xs font-bold font-mono text-emerald-700">WSS /v1/stream/call_id</p>
            <h4 className="font-bold text-sm text-slate-900">Live Audio & Transcripts</h4>
            <p className="text-xs text-slate-500">
              Full-duplex WebSocket stream of live caller speech and bot decision states.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
            <p className="text-xs font-bold font-mono text-emerald-700">POST /webhook/call.completed</p>
            <h4 className="font-bold text-sm text-slate-900">Post-Call Analytics Webhook</h4>
            <p className="text-xs text-slate-500">
              Receives audio recording URL, diarized JSON transcript, and structured evaluation.
            </p>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
