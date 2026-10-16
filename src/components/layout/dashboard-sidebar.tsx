"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  GitBranch,
  Clock,
  Megaphone,
  BarChart3,
  CheckSquare,
  Bell,
  Database,
  Hash,
  Wrench,
  Mic,
  Bug,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Radio,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navSections = [
    {
      items: [
        { label: "Assistants", href: "/dashboard/assistants", icon: Bot },
        { label: "Workflows", href: "/dashboard/workflows", icon: GitBranch },
      ],
    },
    {
      title: "MONITOR & LOGS",
      items: [
        { label: "Call Logs", href: "/dashboard/logs", icon: Clock },
        { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
        { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { label: "Evals", href: "/dashboard/evals", icon: CheckSquare },
        { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
      ],
    },
    {
      title: "KNOWLEDGE & TELEPHONY",
      items: [
        { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: Database },
        { label: "Phone Numbers", href: "/dashboard/numbers", icon: Hash },
        { label: "Tools & Integrations", href: "/dashboard/integrations", icon: Wrench },
      ],
    },
    {
      title: "DEVELOPER LABS",
      items: [
        { label: "Speech-to-Text (STT)", href: "/dashboard/stt", icon: Mic },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200/90 bg-white text-slate-700 transition-all duration-300 select-none z-20 shadow-xs",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Brand Logo Header with HackerRank-style Emerald Green Accent */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 bg-white">
        {!collapsed ? (
          <Link href="/dashboard/assistants" className="flex items-center gap-2.5 group">
            {/* HackerRank-style Square Block */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black text-sm shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-emerald-700 transition">
                  {BRAND_CONFIG.name}
                </span>
                <span className="h-2 w-2 rounded-xs bg-[#11E97F]" title="HackerRank Green Tag" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Voice Telephony Cloud
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black shadow-sm">
            <Radio className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {sec.title && !collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                {sec.title}
              </p>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150",
                    isActive
                      ? THEME_CONFIG.classes.activeNavPill
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {isActive && !collapsed && (
                    <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-200/80 p-3 space-y-1 bg-slate-50/60">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition"
        >
          <ShieldAlert className="h-4 w-4 text-emerald-600" />
          {!collapsed && <span>Super Admin Plane</span>}
        </Link>

        <button
          onClick={() => alert(`Report an issue: support team is available at ${BRAND_CONFIG.supportEmail}`)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
        >
          <Bug className="h-4 w-4 text-slate-400" />
          {!collapsed && <span>Report an issue</span>}
        </button>

        <Link
          href="/dashboard/settings/members"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-300/80"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          )}
        >
          <Settings className="h-4 w-4 text-slate-400" />
          {!collapsed && <span>Workspace Settings</span>}
        </Link>

        {!collapsed && (
          <div className="pt-2 px-3 pb-1 border-t border-slate-200/80 mt-2 flex items-center justify-between">
            <div className="truncate">
              <p className="text-[10px] text-slate-400">Connected account</p>
              <p className="text-[11px] font-semibold text-slate-700 truncate">firozm613@gmail.com</p>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-emerald-200" title="Telemetry Active" />
          </div>
        )}
      </div>
    </aside>
  );
}
