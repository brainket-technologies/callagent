"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";
import {
  ChevronDown,
  User,
  LogOut,
  Wallet,
  Plus,
  Building,
} from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const {
    workspace,
    updateWorkspace,
    setRechargeModalOpen,
  } = useStore();

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadFreshSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.user.email) setUserEmail(data.user.email);
          if (data.user.name) setUserName(data.user.name);
          if (data.workspace?.name) {
            updateWorkspace({
              id: data.workspace.id,
              name: data.workspace.name,
              walletBalance: data.workspace.walletBalance,
              currency: data.workspace.currency,
            });
          }
        }
      } catch {
        try {
          const sess = localStorage.getItem("voxera_user_session");
          if (sess) {
            const parsed = JSON.parse(sess);
            if (parsed.email) setUserEmail(parsed.email);
            if (parsed.name) setUserName(parsed.name);
          }
        } catch {}
      }
    }
    loadFreshSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (e) {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("voxera_logged_in");
      localStorage.removeItem("voxera_user_session");
      document.cookie = "voxera_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.replace("/login");
    }
  };

  const balancePaise = Number(
    workspace.walletBalancePaise ?? (Number(workspace.walletBalance || 0) * 100)
  );
  const userInitial = (userName?.charAt(0) || userEmail?.charAt(0) || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 shadow-xs select-none">
      {/* Workspace Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
          className="flex items-center gap-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/90 py-1.5 px-3 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
        >
          <div className="h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-emerald-200" />
          <span className="max-w-[180px] truncate">{workspace.name || "Workspace"}</span>
          <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
            Production
          </span>
          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 ml-0.5 transition-transform duration-200 ${workspaceDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {workspaceDropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-in fade-in-50 z-50">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Active Workspace (DB)</p>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{workspace.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#11E97F]" />
                <span className="text-[11px] text-slate-500 font-medium">Production Environment</span>
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard/settings/company-details"
                onClick={() => setWorkspaceDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition"
              >
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>Company & KYC Details</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Center / Right Nav Controls */}
      <div className="flex items-center gap-3">
        {/* Sleek Modern Wallet Balance & Top-up Pill */}
        <div className="flex items-center rounded-full border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs transition pl-3 pr-1 py-1 gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80">
              <Wallet className="h-3 w-3" />
            </div>
            <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
              {formatCurrency(balancePaise, workspace.currency || "INR")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setRechargeModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold px-2.5 py-1 text-[11px] transition active:scale-95 shadow-2xs cursor-pointer"
            title="Add wallet credits"
          >
            <Plus className="h-3 w-3 stroke-[3]" />
            <span>Add</span>
          </button>
        </div>

        {/* User Profile Avatar Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="group flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white p-1 hover:border-slate-300 hover:bg-slate-50/80 transition shadow-2xs cursor-pointer"
            title="Account & Settings"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-2xs ring-1 ring-black/5">
              {userInitial}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 mr-1 transition" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-in fade-in-50 z-50">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
                  {userInitial}
                </div>
                <div className="truncate min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/dashboard/settings/billing-plan"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" />
                    <span>Wallet & Billing</span>
                  </span>
                  <span className="font-bold text-emerald-600 font-mono text-[11px]">
                    {formatCurrency(balancePaise, workspace.currency || "INR")}
                  </span>
                </Link>

                <Link
                  href="/dashboard/settings/members"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
