"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import {
  Wrench,
  Plus,
  Code,
  FileCode,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Table,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function IntegrationsPage() {
  const { integrations, toggleIntegration } = useStore();

  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [funcModalOpen, setFuncModalOpen] = useState(false);

  // New API Form State
  const [apiName, setApiName] = useState("");
  const [apiMethod, setApiMethod] = useState("POST");
  const [apiUrl, setApiUrl] = useState("");
  const [apiStage, setApiStage] = useState<"Pre-call" | "On-call" | "Post-call">("On-call");
  const [apiSubtab, setApiSubtab] = useState<"Headers" | "Path" | "Query" | "Body" | "Response">("Headers");

  // New Function Form State
  const [funcName, setFuncName] = useState("");
  const [funcDesc, setFuncDesc] = useState("Check whether a date falls on a company holiday");
  const [funcJq, setFuncJq] = useState("def is_holiday(d): ... ; is_holiday(.date)");

  const iconMap: Record<string, any> = {
    Calendar,
    CalendarCheck,
    CalendarDays,
    Table,
    MessageSquare,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Tools</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Set up tools once for your workspace and reuse them in any assistant. Discover more integrations below.
        </p>
      </div>

      {/* Add Workspace Tools (Matching Screenshot 36!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Add workspace tools
        </h3>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setApiModalOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50 transition shadow-sm"
          >
            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-700">
              <Code className="h-4 w-4" />
            </div>
            <span>API</span>
            <Plus className="h-3.5 w-3.5 text-neutral-400 ml-2" />
          </button>

          <button
            onClick={() => setFuncModalOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50 transition shadow-sm"
          >
            <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
              <FileCode className="h-4 w-4" />
            </div>
            <span>Function (JQ)</span>
            <Plus className="h-3.5 w-3.5 text-neutral-400 ml-2" />
          </button>
        </div>
      </div>

      {/* Add More Tools / Integrations (Matching Screenshot 36!) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Add more tools
        </h3>
        <p className="text-xs text-neutral-500">
          Connect new apps or open a connected integration to configure more workspace tools.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item) => {
            const Icon = iconMap[item.icon] || Wrench;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.isConnected ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not connected</Badge>
                    )}
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-neutral-900">{item.name}</h4>
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {item.isConnected ? "Active on calls" : "Requires API Key"}
                  </span>
                  <Button
                    size="sm"
                    variant={item.isConnected ? "outline" : "default"}
                    onClick={() => toggleIntegration(item.id)}
                    className="text-xs h-8"
                  >
                    {item.isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: NEW API (Matching Screenshot 37!) */}
      <Modal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        title="Workspace > New API"
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Name</label>
            <input
              type="text"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
              placeholder="e.g. check_order_status"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Available stages</label>
            <div className="mt-1 flex gap-2">
              {(["Pre-call", "On-call", "Post-call"] as const).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setApiStage(stage)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    apiStage === stage ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Endpoint</label>
            <div className="mt-1 flex gap-2">
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold"
              >
                <option>POST</option>
                <option>GET</option>
                <option>PUT</option>
              </select>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.yourcrm.com/v1/orders/verify"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              />
            </div>
          </div>

          {/* Subtabs Headers, Path, Query, Body */}
          <div className="rounded-xl border border-neutral-200 p-3 space-y-2">
            <div className="flex border-b border-neutral-200 text-xs font-semibold gap-3 pb-2">
              {(["Headers", "Path", "Query", "Body", "Response"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setApiSubtab(tab)}
                  className={apiSubtab === tab ? "text-neutral-900 font-bold" : "text-neutral-400"}
                >
                  {tab}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 pt-1">
              Configure parameters sent to this endpoint when the AI agent executes the function.
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => alert("Test execution simulated.")}>
              Test API
            </Button>
            <Button
              onClick={() => {
                alert(`API Tool "${apiName || "new_tool"}" saved to workspace!`);
                setApiModalOpen(false);
              }}
              className="bg-neutral-900 text-white"
            >
              Save tool
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: NEW FUNCTION (JQ) (Matching Screenshots 38 & 39!) */}
      <Modal
        isOpen={funcModalOpen}
        onClose={() => setFuncModalOpen(false)}
        title="Workspace > New function"
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Name</label>
            <input
              type="text"
              value={funcName}
              onChange={(e) => setFuncName(e.target.value)}
              placeholder="e.g. is_holiday_checker"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Description</label>
            <textarea
              value={funcDesc}
              onChange={(e) => setFuncDesc(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Program (JQ Expression)</label>
            <textarea
              value={funcJq}
              onChange={(e) => setFuncJq(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-900 text-emerald-400 font-mono text-xs p-3"
            />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => alert("Function tested successfully.")}>
              Test function
            </Button>
            <Button
              onClick={() => {
                alert(`Custom function saved to workspace!`);
                setFuncModalOpen(false);
              }}
              className="bg-neutral-900 text-white"
            >
              Save tool
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
