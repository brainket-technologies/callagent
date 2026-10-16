"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  HelpCircle,
  Phone,
  Sparkles,
  ShieldAlert,
  User,
  LogOut,
  ExternalLink,
  Wallet,
  Zap,
  Plus,
} from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const {
    workspace,
    setRechargeModalOpen,
    setTestCallDrawerOpen,
    setSelectedAssistantForTest,
    assistants,
  } = useStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Determine badge styling based on balance
  const balancePaise = workspace.walletBalancePaise;
  const isLowBalance = balancePaise < 50000; // < ₹500

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 shadow-xs select-none">
      {/* Workspace Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 py-1.5 px-3 text-xs font-bold text-slate-800 shadow-2xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span>{workspace.name}</span>
          <span className="text-[10px] uppercase font-extrabold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
            Production
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
        </div>
      </div>

      {/* Center / Right Nav Controls */}
      <div className="flex items-center gap-3">
        {/* Search Trigger */}
        <button
          onClick={() => alert(`Quick Search: Search assistants, call transcripts, and knowledge base in ${BRAND_CONFIG.name}.`)}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span>Search resources...</span>
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Help icon */}
        <button
          onClick={() => alert(`${BRAND_CONFIG.name} Documentation & Support: 24/7 dedicated enterprise support at ${BRAND_CONFIG.supportEmail}`)}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* PREPAID WALLET BADGE WITH GLOWING ACCENT & QUICK RECHARGE */}
        <button
          onClick={() => setRechargeModalOpen(true)}
          className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
            isLowBalance
              ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 hover:border-amber-400 hover:shadow-md"
              : "border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 hover:border-emerald-400 hover:shadow-md"
          }`}
          title="Click to recharge wallet credits"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 group-hover:scale-110 transition">
            <Wallet className="h-3 w-3" />
          </div>
          <span className="font-mono text-sm tracking-tight">{formatCurrency(balancePaise)}</span>
          <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
            <Plus className="h-2.5 w-2.5" />
            <span>Add</span>
          </div>
        </button>

        {/* TEST ASSISTANT BUTTON (HackerRank Green Pill) */}
        <button
          onClick={() => {
            if (assistants.length > 0) {
              setSelectedAssistantForTest(assistants[0]);
            }
            setTestCallDrawerOpen(true);
          }}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-extrabold text-[#0A0E1A] transition-all cursor-pointer shadow-sm active:scale-95",
            THEME_CONFIG.classes.btnPrimary
          )}
        >
          <Phone className="h-3.5 w-3.5 fill-current" />
          <span>Test Assistant</span>
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-[#0A0E1A] bg-[#11E97F] ring-2 ring-slate-200 shadow-sm hover:ring-[#11E97F] transition cursor-pointer"
          >
            FM
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in-50 z-50">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                <p className="text-xs font-bold text-slate-900">Firoz Mohammad</p>
                <p className="text-[11px] text-slate-500 truncate">firozm613@gmail.com</p>
                <span className="inline-block mt-1 text-[9px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                  Workspace Owner
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings/billing-plan"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" />
                    <span>Wallet & Billing</span>
                  </span>
                  <span className="font-bold text-emerald-600 font-mono">{formatCurrency(balancePaise)}</span>
                </Link>

                <Link
                  href="/dashboard/settings/members"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-xl font-medium transition"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-purple-500" />
                    <span>Super Admin Plane</span>
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Landing Page / Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
