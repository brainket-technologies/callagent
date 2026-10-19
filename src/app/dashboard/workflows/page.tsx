"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Plus, Search, ChevronRight, Layers, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkflowsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Workflows</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Chain assistants together, branch on how a call went, and wait before following up.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/workflows/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] px-4 py-2 text-xs font-extrabold text-[#0A0E1A] shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Create workflow
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-12 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
          <GitBranch className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900">Create your first Workflow</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
            Drag and drop triggers, AI agents, conditional decision branches (e.g. If Interested ➔ WhatsApp, If Voicemail ➔ Retry in 30 mins), and action hooks.
          </p>
        </div>
        <Link
          href="/dashboard/workflows/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] px-5 py-2.5 text-xs font-extrabold text-[#0A0E1A] shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Launch Visual Canvas
        </Link>
      </div>
    </div>
  );
}
