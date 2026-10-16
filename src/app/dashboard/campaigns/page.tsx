"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import {
  Megaphone,
  Plus,
  Search,
  Sliders,
  Play,
  Pause,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  const { campaigns } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0] || null);

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.assistantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage high-concurrency automated outbound dialing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => alert("Concurrency limit is set to 25 channels across all active campaigns.")}
            className="text-xs h-10 border-neutral-200"
          >
            <Sliders className="h-3.5 w-3.5 mr-1.5" />
            Manage concurrency
          </Button>

          <Link
            href="/dashboard/campaigns/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>
        </div>
      </div>

      {/* Main Campaign Grid & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaigns Table */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress / Connected</th>
                  <th className="py-3 px-4">Connectivity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCampaigns.map((camp) => {
                  const percent = Math.round((camp.connectedCalls / camp.totalContacts) * 100);
                  return (
                    <tr
                      key={camp.id}
                      onClick={() => setSelectedCampaign(camp)}
                      className={`cursor-pointer transition-colors ${
                        selectedCampaign?.id === camp.id ? "bg-neutral-100/70" : "hover:bg-neutral-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{camp.id}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900">{camp.name}</p>
                        <p className="text-[11px] text-neutral-500">{camp.assistantName}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            camp.status === "running"
                              ? "success"
                              : camp.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {camp.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>{camp.connectedCalls} calls</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className={`h-full rounded-full ${
                                camp.status === "completed" ? "bg-neutral-900" : "bg-emerald-500"
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-800">
                        {camp.connectivityRate.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {camp.status === "running" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Campaign ${camp.name} paused.`);
                            }}
                            className="rounded p-1 hover:bg-neutral-200 text-neutral-600"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Campaign ${camp.name} started.`);
                            }}
                            className="rounded p-1 hover:bg-neutral-200 text-neutral-600"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Detail Side Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-5">
          {selectedCampaign ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-bold text-neutral-900">{selectedCampaign.name}</h3>
                <Badge variant={selectedCampaign.status === "running" ? "success" : "default"}>
                  {selectedCampaign.status}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Voice Assistant</span>
                  <span className="font-semibold text-neutral-900">{selectedCampaign.assistantName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Total Calling List</span>
                  <span className="font-semibold text-neutral-900">{selectedCampaign.totalContacts} contacts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Connected Pickups</span>
                  <span className="font-semibold text-emerald-600">{selectedCampaign.connectedCalls}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Channel Concurrency</span>
                  <span className="font-semibold text-neutral-900">{selectedCampaign.concurrencyLimit} simultaneous lines</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Max Retry Attempts</span>
                  <span className="font-semibold text-neutral-900">{selectedCampaign.retryAttempts} retries</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => alert(`Campaign ${selectedCampaign.name} report downloaded.`)}
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  Download Report
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-neutral-400">
              No campaign selected. Pick a campaign from the table to see details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
