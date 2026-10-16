"use client";

import React, { useState } from "react";
import { Bell, AlertTriangle, ShieldCheck, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AlertsPage() {
  const [monitors, setMonitors] = useState([
    {
      title: "Telephony Disconnection Spike",
      condition: "Disconnection rate > 25% across any 10-minute window",
      severity: "critical",
      active: true,
      channels: "Email & Slack #alerts",
    },
    {
      title: "Prepaid Wallet Low Balance",
      condition: "Available balance falls below ₹500.00",
      severity: "warning",
      active: true,
      channels: "In-App Header & Email",
    },
    {
      title: "Callee Early Drop-Off (>25%)",
      condition: "Over 25% of callees hang up within first 15 seconds",
      severity: "medium",
      active: true,
      channels: "Email",
    },
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Alerts & Monitored Anomalies</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure automated incident monitors for carrier drops, early user hangups, and low wallet balances.
          </p>
        </div>

        <Button
          onClick={() => alert("Add monitor modal opened.")}
          className="bg-neutral-900 text-white text-xs h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {monitors.map((m, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    m.severity === "critical"
                      ? "destructive"
                      : m.severity === "warning"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {m.severity}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>

              <h4 className="mt-3 text-sm font-bold text-neutral-900">{m.title}</h4>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{m.condition}</p>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
              Dispatched via: <strong className="text-neutral-700">{m.channels}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
