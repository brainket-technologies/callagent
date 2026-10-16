"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallLimitsPage() {
  const [enabled, setEnabled] = useState(false);
  const [maxCalls, setMaxCalls] = useState(5);
  const [rollingWindow, setRollingWindow] = useState("24 hours");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Call limits</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Applies to every outbound call from this workspace.</p>
        </div>
        <Button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
          className="bg-neutral-900 text-white text-xs"
        >
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <p className="text-xs font-semibold text-neutral-800">Limit how often one person is called</p>
              <p className="text-[11px] text-neutral-400">Turning this on covers every agent here.</p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Maximum calls to one person</label>
              <input
                type="number"
                value={maxCalls}
                onChange={(e) => setMaxCalls(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">calls per person</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Rolling window</label>
              <select
                value={rollingWindow}
                onChange={(e) => setRollingWindow(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                <option>24 hours</option>
                <option>48 hours</option>
                <option>7 days</option>
              </select>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">The period the limit is measured over</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">Where this applies: </span>
            Campaigns • Workflows • Direct calls • Callbacks • Retries
          </div>
        </div>

        {/* Projected Impact Card (Matching Screenshot 47!) */}
        <div className="md:col-span-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-6 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Projected impact</h4>
          <p className="text-xs text-neutral-500">When the limit is turned on:</p>
          <p className="text-xs text-neutral-400 leading-relaxed pt-2">
            Not enough recent calls to project this reliably. We could match a caller on only 0% of recent dials.
          </p>
        </div>
      </div>
    </div>
  );
}
