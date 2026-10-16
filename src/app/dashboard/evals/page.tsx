"use client";

import React, { useState } from "react";
import { CheckSquare, Sliders, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function EvalsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Evals</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor and improve the quality of your agents&apos; interactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700">
            <option>Select agent</option>
            <option>dd (v1)</option>
            <option>EMI Collections</option>
          </select>

          <Button
            variant="outline"
            onClick={() => alert("Eval scoring rubrics configured: Tone, Script Adherence, Identity Verification.")}
            className="text-xs h-9"
          >
            <Sliders className="h-3.5 w-3.5 mr-1.5" />
            Configure
          </Button>
        </div>
      </div>

      {/* Empty State (Matching Screenshot 31!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-16 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
          <CheckSquare className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900">No agents have evals enabled</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            Evals are configured by {BRAND_CONFIG.name} for selected agents. To enable them for your agents, contact{" "}
            <span className="font-mono text-neutral-900 font-semibold">{BRAND_CONFIG.adminEmail}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
