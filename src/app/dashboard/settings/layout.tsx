"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building,
  Sliders,
  FileText,
  Key,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsSidebar() {
  const pathname = usePathname();

  const settingsNav = [
    {
      group: "WORKSPACE",
      items: [
        { label: "Workspace members", href: "/dashboard/settings/members", icon: Users },
        { label: "Company details", href: "/dashboard/settings/company-details", icon: Building },
        { label: "Call limits", href: "/dashboard/settings/call-frequency", icon: Sliders },
        { label: "Workspace logs", href: "/dashboard/settings/workspace-logs", icon: FileText },
      ],
    },
    {
      group: "ACCESS",
      items: [
        { label: "API key", href: "/dashboard/settings/api-key", icon: Key },
      ],
    },
    {
      group: "BILLING",
      items: [
        { label: "Billing plan", href: "/dashboard/settings/billing-plan", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200/80 bg-white p-4 space-y-6 select-none">
      {settingsNav.map((sec, idx) => (
        <div key={idx} className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">
            {sec.group}
          </p>
          {sec.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full">
      <Suspense fallback={<div className="w-56 shrink-0 border-r border-neutral-200/80 bg-white" />}>
        <SettingsSidebar />
      </Suspense>

      {/* Main Settings Sub-Page Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
