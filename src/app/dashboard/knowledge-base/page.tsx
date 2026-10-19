"use client";

import React from "react";
import Link from "next/link";
import { Database, Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KnowledgeBasePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Knowledge Base</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Store and manage the data your AI bots use to answer calls.
          </p>
        </div>

        <Link
          href="/dashboard/knowledge-base/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] px-4 py-2 text-xs font-extrabold text-[#0A0E1A] shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Create
        </Link>
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-16 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
          <FileText className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900">Create your first Knowledge base</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
            No knowledge bases created yet, create one to get started
          </p>
        </div>
        <Link
          href="/dashboard/knowledge-base/create"
          className="inline-flex items-center gap-2 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] px-5 py-2.5 text-xs font-extrabold text-[#0A0E1A] shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Create
        </Link>
      </div>
    </div>
  );
}
