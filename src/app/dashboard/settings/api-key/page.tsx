"use client";

import React, { useState } from "react";
import { Key, Plus, Copy, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<string | null>("sk_live_e047345b-fde9-4d46-bc8d-e305035f51d7");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setApiKey(newKey);
    alert("New API key generated! Please save it securely.");
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">API Key</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Use this key to authenticate API requests for your workspace. For security, the key will only be shown once after it is generated.
          </p>
        </div>

        <Button onClick={handleGenerate} className="bg-neutral-900 text-white text-xs h-9">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Generate API Key
        </Button>
      </div>

      {apiKey && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-neutral-700">Active Secret API Key</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 font-mono text-xs text-neutral-900"
            />
            <Button variant="outline" onClick={handleCopy} className="text-xs">
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-neutral-400">
            Never share this secret key in client-side code or public GitHub repositories.
          </p>
        </div>
      )}

      {/* Quick Start Guide Card (Matching Screenshot 49!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-neutral-900">Need an overview?</h4>
        <p className="text-xs text-neutral-500">Visit our official documentation to get started.</p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neutral-200 p-2 text-neutral-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">API: Quick start guide</p>
              <p className="text-[11px] text-neutral-500">Make a test {BRAND_CONFIG.name} call to understand the production flow.</p>
            </div>
          </div>
          <a
            href="#docs"
            onClick={(e) => {
              e.preventDefault();
              alert("Navigating to API Quick start documentation.");
            }}
            className="text-xs font-semibold text-neutral-900 flex items-center gap-1 hover:underline"
          >
            <span>Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
