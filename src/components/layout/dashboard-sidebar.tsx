"use client";

import React, { useState, useEffect } from "react";
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
  Radio,
  Sparkles,
  Layers,
  Receipt,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch {
        try {
          const sess = localStorage.getItem("voxera_user_session");
          if (sess) {
            const parsed = JSON.parse(sess);
            if (parsed.email) setUserEmail(parsed.email);
          }
        } catch {}
      }
    }
    loadUser();
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

  const userInitial = (userEmail?.charAt(0) || "U").toUpperCase();

  const navSections: Array<{
    title?: string;
    items: Array<{
      label: string;
      href?: string;
      icon: any;
      onClick?: () => void;
    }>;
  }> = [
    {
      items: [
        { label: "Assistants", href: "/dashboard/assistants", icon: Bot },
        { label: "Workflows", href: "/dashboard/workflows", icon: GitBranch },
      ],
    },
    {
      title: "BILLING & SERVICES",
      items: [
        { label: "Services & Pricing", href: "/dashboard/services", icon: Layers },
        { label: "Transaction History", href: "/dashboard/transactions", icon: Receipt },
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
    {
      title: "PREFERENCES & SUPPORT",
      items: [
        { label: "Workspace Settings", href: "/dashboard/settings/members", icon: Settings },
        {
          label: "Report an issue",
          icon: Bug,
          onClick: () => alert(`Report an issue: support team is available at ${BRAND_CONFIG.supportEmail}`),
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200/90 bg-white text-slate-700 transition-all duration-300 select-none z-20 shadow-xs h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top Brand Logo Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200/80 bg-white">
        {!collapsed ? (
          <Link href="/dashboard/assistants" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black text-sm shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition">
              <Radio className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-emerald-700 transition">
                  {BRAND_CONFIG.name}
                </span>
                <span className="h-2 w-2 rounded-xs bg-[#11E97F]" title="Status Active" />
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

      {/* Nav List (All Menu Items Scroll Together Seamlessly) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 pb-6">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {sec.title && !collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                {sec.title}
              </p>
            )}
            {sec.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isSettingsItem = item.href?.startsWith("/dashboard/settings");
              const isActive = item.href
                ? isSettingsItem
                  ? pathname.startsWith("/dashboard/settings")
                  : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                : false;

              if (item.onClick) {
                return (
                  <button
                    key={itemIdx}
                    type="button"
                    onClick={item.onClick}
                    className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-all duration-150 cursor-pointer"
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href || itemIdx}
                  href={item.href!}
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

      {/* Bottom Section matching Admin Panel */}
      <div className="border-t border-slate-200/80 p-3 space-y-1 bg-slate-50/60 shrink-0">
        {!collapsed ? (
          <div className="pt-1 px-2 pb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shadow-xs ring-1 ring-slate-300">
                {userInitial}
              </div>
              <div className="truncate min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Connected account</p>
                <p className="text-[11px] font-semibold text-slate-700 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-emerald-200" title="Telemetry Active" />
              <button
                type="button"
                onClick={handleSignOut}
                title="Logout from Account"
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            title="Logout from Account"
            className="mx-auto flex p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
