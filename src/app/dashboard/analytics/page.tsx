"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency, formatDuration } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  PhoneCall,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const { assistants, calls } = useStore();

  const totalCalls = 15060;
  const connectedCalls = 10950;
  const connectivityRate = 72.71;
  const avgHandleTimeSec = 94;
  const totalMinutes = 23594;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time telephony throughput, connectivity rates, and cost telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 bg-white px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            <span>Date range: 15 Sep - 15 Oct</span>
          </div>

          <Button
            variant="outline"
            onClick={() => alert("Analytics report exported.")}
            className="text-xs h-9 border-neutral-200"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Volume Metrics Grid (Matching Screenshot 28!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Volume</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div>
            <p className="text-xs text-neutral-500">Total calls</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{totalCalls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Calls registered</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{totalCalls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Calls connected</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{connectedCalls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Connectivity rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{connectivityRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-neutral-100 pt-6">
          <div>
            <p className="text-xs text-neutral-500">Avg handle time</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{avgHandleTimeSec}s</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total handle time</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{totalMinutes.toLocaleString()}m</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Numbers used</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">3</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Voicemails detected</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">412</p>
          </div>
        </div>
      </div>

      {/* Connectivity & Cohort Analysis Charts (Matching Screenshot 29!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Connectivity Rate Trend</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> +4.2% vs last week
            </span>
          </div>

          <div className="h-44 flex items-end gap-2 pt-4">
            {[62, 65, 71, 68, 74, 76, 73, 79, 75, 81, 78, 83, 80, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  style={{ height: `${val}%` }}
                  className="w-full rounded-t-md bg-neutral-900 group-hover:bg-emerald-500 transition-all"
                />
                <span className="text-[9px] text-neutral-400">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Cohort & Retry Analysis</h3>
            <span className="text-xs text-neutral-400">Pickup probability by attempt</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">Attempt 1 (Immediate)</span>
                <span className="font-bold text-neutral-900">54.2% Connected</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[54.2%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">Attempt 2 (+30 mins)</span>
                <span className="font-bold text-neutral-900">22.4% Connected</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-neutral-900 w-[22.4%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">Attempt 3 (+2 hours)</span>
                <span className="font-bold text-neutral-900">11.8% Connected</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-neutral-500 w-[11.8%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Limits Exhaustion Tracker (Matching Screenshot 29!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-neutral-900">Call limits & Concurrency Protection</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div>
            <p className="text-xs text-neutral-500">Waiting for limit reset</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">0</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Dialled after waiting</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">0</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Cancelled, deadline passed</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">0</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Cancelled, campaign ended</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">0</p>
          </div>
        </div>
      </div>

      {/* Assistant Performance Breakdown Table (Matching Screenshot 30!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">Assistant Performance Table</h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Assistant</th>
              <th className="py-3 px-4">Calls</th>
              <th className="py-3 px-4">Connected</th>
              <th className="py-3 px-4">Minutes</th>
              <th className="py-3 px-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {assistants.map((asst) => (
              <tr key={asst.id} className="hover:bg-neutral-50/80">
                <td className="py-3 px-4 font-bold text-neutral-900">{asst.name}</td>
                <td className="py-3 px-4">{asst.totalCallsCount}</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">
                  {Math.round(asst.totalCallsCount * 0.74)}
                </td>
                <td className="py-3 px-4 font-mono">
                  {Math.round((asst.totalCallsCount * asst.averageHandleTimeSec) / 60)}m
                </td>
                <td className="py-3 px-4 text-right font-bold text-neutral-900">
                  {formatCurrency(Math.round((asst.totalCallsCount * asst.averageHandleTimeSec) / 60) * 1000)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
