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
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";

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
    <aside className="w-56 shrink-0 border-r border-neutral-200/80 bg-white p-4 space-y-6 select-none">
      {settingsNav.map((sec, idx) => (
        <div key={idx} className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold text-neutral-400 tracking-wider">
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
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-neutral-100 text-neutral-950 font-bold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-neutral-900" : "text-neutral-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      <div className="border-t border-neutral-100 pt-4 space-y-1">
        <button
          onClick={() => alert(`Contact support via email at ${BRAND_CONFIG.supportEmail}`)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 transition"
        >
          <MessageSquare className="h-4 w-4 text-neutral-400" />
          <span>Contact us</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Link>
      </div>
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
  );}
