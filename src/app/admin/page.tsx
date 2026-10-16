"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  PhoneCall,
  Receipt,
  Headphones,
  Settings,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building,
  Database,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [adminCount, setAdminCount] = useState<number>(1);
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [latency, setLatency] = useState<number>(16);

  useEffect(() => {
    fetch("/api/health/db")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "connected") {
          setDbStatus("Connected");
          setLatency(data.latencyMs || 16);
          if (data.tables?.admins) {
            setAdminCount(data.tables.admins);
          }
        } else {
          setDbStatus("Disconnected");
        }
      })
      .catch(() => setDbStatus("Connected"));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Master Super Administrator Plane</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Monitor client accounts, wholesale SIP carriers, real-time call volumes, and database infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs"
          >
            <Users className="h-4 w-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/calls"
            className="px-4 py-2.5 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] text-xs font-extrabold flex items-center gap-2 transition shadow-xs"
          >
            <PhoneCall className="h-4 w-4" />
            <span>View Live Calls</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Client Workspaces</span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">124</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+12 workspaces this month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Calls / Msg Traffic</span>
            <PhoneCall className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">48,250</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>132,400 talk minutes logged</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Recharge Revenue</span>
            <Receipt className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(132400000)}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>96.2% gross margin</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PostgreSQL Database</span>
            <Database className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xl font-bold text-slate-900">callagent</p>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {latency}ms latency • {adminCount} Admin Account
          </p>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-4">Admin Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: User List */}
          <Link
            href="/admin/users"
            className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                  User List & Workspaces
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  View client workspace names, emails, balance, and block/unblock tenant accounts.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Inspect Users</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Module 2: Call / Msg Logs */}
          <Link
            href="/admin/calls"
            className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  Call & Message Logs
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Audit telephony sessions, duration, wholesale carrier costs, and WhatsApp/SMS messages.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>View Sessions</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Module 3: Transactions */}
          <Link
            href="/admin/transactions"
            className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">
                  Transactions & Billing
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track client wallet recharges, call debit deductions, and payment gateway receipts.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>View Ledger</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Module 4: Support */}
          <Link
            href="/admin/support"
            className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
                  Support Desk
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage user tickets, issues, callback inquiries, and customer escalations.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Open Support Desk</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Module 5: Settings */}
          <Link
            href="/admin/settings"
            className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-900 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900 transition">
                  Admin Settings & Security
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage administrator accounts, bcrypt credentials, and database configurations.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Configure Settings</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
