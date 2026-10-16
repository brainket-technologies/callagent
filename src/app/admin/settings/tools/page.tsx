"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  CheckCircle2,
  X,
  Save,
  Sliders,
  Loader2,
} from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  isEnabled: boolean;
  configKey: string;
}

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: "cal_com",
    name: "Cal.com",
    desc: "Open-source scheduling infrastructure",
    icon: "https://cal.com/favicon.ico",
    isEnabled: true,
    configKey: "cal_live_90812389102",
  },
  {
    id: "calendly",
    name: "Calendly",
    desc: "Booking & scheduling automation",
    icon: "https://assets.calendly.com/assets/authentication/media/favicon.ico",
    isEnabled: true,
    configKey: "cal_token_8192381",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    desc: "Calendar events and scheduling",
    icon: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png",
    isEnabled: true,
    configKey: "gcal_oauth_98123.apps.googleusercontent.com",
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    desc: "Spreadsheet data logging",
    icon: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico",
    isEnabled: true,
    configKey: "sheet_id_819203810293",
  },
  {
    id: "slack",
    name: "Slack",
    desc: "Send messages and alerts to your Slack channels",
    icon: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",
    isEnabled: false,
    configKey: "",
  },
  {
    id: "whatsapp_business",
    name: "WhatsApp Business",
    desc: "Reach customers on WhatsApp. Send approved templates or free..",
    icon: "https://static.whatsapp.net/rsrc.php/v3/yP/r/rNqzzdltrash.png",
    isEnabled: true,
    configKey: "waba_id_81923891023",
  },
];

export default function AdminToolsSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<ToolItem[]>(DEFAULT_TOOLS);

  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [modalKey, setModalKey] = useState("");
  const [modalEnabled, setModalEnabled] = useState(true);
  const [isSavingModal, setIsSavingModal] = useState(false);

  // Load tools from PostgreSQL on mount
  useEffect(() => {
    async function loadTools() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/tools-config");
        const data = await res.json();
        if (data.success && Array.isArray(data.tools)) {
          setTools(data.tools);
        }
      } catch (err) {
        console.error("Failed to load tools from database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTools();
  }, []);

  // Instant toggle switch ON/OFF with live PostgreSQL persistence
  const handleToggleTool = async (toolId: string) => {
    const target = tools.find((t) => t.id === toolId);
    if (!target) return;

    const nextState = !target.isEnabled;

    // Optimistic UI update
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, isEnabled: nextState } : t))
    );

    try {
      const res = await fetch("/api/admin/tools-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: toolId, isEnabled: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `${target.name} ${nextState ? "Enabled (ON)" : "Disabled (OFF)"} in database!`
        );
      } else {
        // Rollback
        setTools((prev) =>
          prev.map((t) => (t.id === toolId ? { ...t, isEnabled: !nextState } : t))
        );
        showToast("Failed to update tool state in database");
      }
    } catch (err) {
      // Rollback
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, isEnabled: !nextState } : t))
      );
      showToast("Network error updating tool");
    }
  };

  // Open configuration modal
  const handleOpenConfig = (tool: ToolItem) => {
    setSelectedTool(tool);
    setModalKey(tool.configKey || "");
    setModalEnabled(Boolean(tool.isEnabled));
  };

  // Save tool credentials in modal to PostgreSQL
  const handleSaveTool = async () => {
    if (!selectedTool) return;
    try {
      setIsSavingModal(true);
      const res = await fetch("/api/admin/tools-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTool.id,
          configKey: modalKey,
          isEnabled: modalEnabled,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tools)) {
        setTools(data.tools);
        showToast(`${selectedTool.name} configuration saved to database!`);
        setSelectedTool(null);
      } else {
        showToast(data.error || "Failed to save configuration");
      }
    } catch (err) {
      showToast("Network error while saving tool");
    } finally {
      setIsSavingModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Wrench className="h-5 w-5 text-emerald-600" />
          <span>Tools & Integrations</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect scheduling tools, CRM spreadsheets, team alert webhooks, and WhatsApp messaging for autonomous AI agent actions.
        </p>
      </div>

      {/* Grid of Tools with ON/OFF switch buttons */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          <p className="text-xs font-semibold text-slate-500">Loading tools from PostgreSQL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleOpenConfig(tool)}
              className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[175px]"
            >
              <div>
                {/* Top: Tool Icon, Status Badge & ON/OFF Toggle Switch */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="h-6 w-6 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        tool.isEnabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {tool.isEnabled ? "Connected" : "Disabled"}
                    </span>

                    {/* ON / OFF Toggle Switch Button */}
                    <button
                      type="button"
                      aria-label={`Toggle ${tool.name}`}
                      title={tool.isEnabled ? "Click to turn OFF" : "Click to turn ON"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTool(tool.id);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tool.isEnabled ? "bg-[#11E97F]" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          tool.isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Click to configure</span>
                <Sliders className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Modal */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                  <img src={selectedTool.icon} alt={selectedTool.name} className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Configure {selectedTool.name}</h3>
                  <p className="text-xs text-slate-500">{selectedTool.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Power Switch in Modal */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="text-xs font-bold text-slate-800">Integration Status</p>
                  <p className="text-[11px] text-slate-500">Enable or disable tool execution</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEnabled(!modalEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    modalEnabled ? "bg-[#11E97F]" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      modalEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Credentials input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  API Key / OAuth Token / Webhook URL
                </label>
                <input
                  type="text"
                  value={modalKey}
                  onChange={(e) => setModalKey(e.target.value)}
                  placeholder={`Enter ${selectedTool.name} credentials`}
                  className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Integration Documentation</p>
                <p>
                  Requires valid permissions on {selectedTool.name} to execute automated scheduling, spreadsheet inserts, and webhooks.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                className="px-4 h-10 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTool}
                disabled={isSavingModal}
                className="px-5 h-10 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSavingModal ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
