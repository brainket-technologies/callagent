"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Zap,
  GitBranch,
  Clock,
  Play,
  Save,
  Pencil,
  Plus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NewWorkflowVisualEditorPage() {
  const [title, setTitle] = useState("Untitled workflow");
  const [nodes, setNodes] = useState<
    { id: string; type: "agent" | "action" | "conditional" | "await"; title: string; desc: string; x: number; y: number }[]
  >([
    { id: "1", type: "agent", title: "Outbound Agent (dd)", desc: "Verify Callee & Identify interest", x: 420, y: 160 },
    { id: "2", type: "conditional", title: "If Interest == 'High'", desc: "Branch on positive caller intent", x: 420, y: 280 },
    { id: "3", type: "action", title: "Send WhatsApp Template", desc: "Dispatch official booking link", x: 260, y: 400 },
    { id: "4", type: "await", title: "Wait 2 Hours & Retry", desc: "If voicemail or busy detected", x: 580, y: 400 },
  ]);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleAddBlock = (type: "agent" | "action" | "conditional" | "await") => {
    const titles = {
      agent: "Voice Agent Step",
      action: "Execute API Webhook",
      conditional: "Decision Condition",
      await: "Wait / Delay Timer",
    };
    const newId = (nodes.length + 1).toString();
    setNodes([
      ...nodes,
      {
        id: newId,
        type,
        title: titles[type],
        desc: "Configure node logic",
        x: 350 + Math.random() * 80,
        y: 200 + nodes.length * 60,
      },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col bg-[#F8F9FA] select-none">
      {/* Top Workflow Header */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/workflows"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-bold text-neutral-900 bg-transparent border-0 focus:outline-none focus:ring-0"
            />
            <Pencil className="h-3 w-3 text-neutral-400" />
            <Badge variant="secondary" className="text-[10px]">Draft</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Variables inspector opened.")}
            className="text-xs h-8"
          >
            {"</>"} Variables
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSavedNotice(true);
              setTimeout(() => setSavedNotice(false), 2000);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs h-8 px-4"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save workflow
          </Button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Blocks Drawer (Matches Screenshot 24!) */}
        <div className="w-64 border-r border-neutral-200/80 bg-white p-4 space-y-4 shadow-sm z-10">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Blocks</p>

          <div className="space-y-2">
            <button
              onClick={() => handleAddBlock("agent")}
              className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-neutral-900 hover:bg-neutral-50 transition"
            >
              <div className="rounded-lg bg-neutral-100 p-2 text-neutral-700">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Agent</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Call or message with an assistant</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("action")}
              className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-neutral-900 hover:bg-neutral-50 transition"
            >
              <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Action</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Call any API or CRM</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("conditional")}
              className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-neutral-900 hover:bg-neutral-50 transition"
            >
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Conditional</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Branch on Match / No match</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock("await")}
              className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-neutral-900 hover:bg-neutral-50 transition"
            >
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Await</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Pause until a time or event</p>
              </div>
            </button>
          </div>
        </div>

        {/* Canvas Workspace with Grid Pattern */}
        <div
          className="flex-1 overflow-auto relative p-12"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Start Pill in Canvas */}
          <div className="absolute top-10 left-[470px] -translate-x-1/2 rounded-full bg-neutral-900 text-white px-4 py-1 text-xs font-bold tracking-wider shadow">
            START
          </div>

          {/* Node Cards on Canvas */}
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              className="absolute w-60 rounded-xl border border-neutral-300 bg-white p-3.5 shadow-md hover:border-neutral-900 cursor-move transition-all"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  {node.type === "agent" && <Bot className="h-3.5 w-3.5 text-neutral-700" />}
                  {node.type === "action" && <Zap className="h-3.5 w-3.5 text-purple-600" />}
                  {node.type === "conditional" && <GitBranch className="h-3.5 w-3.5 text-amber-600" />}
                  {node.type === "await" && <Clock className="h-3.5 w-3.5 text-blue-600" />}
                  {node.title}
                </span>
                <span className="text-[10px] text-neutral-400">#{node.id}</span>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">{node.desc}</p>
            </div>
          ))}

          {/* Bottom Floating Canvas Toolbar (Matches Screenshot 24!) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
            <button className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100">
              <Hand className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-neutral-900 bg-neutral-100">
              <MousePointer className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200 mx-1" />
            <button className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100">
              <Maximize2 className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100">
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Toast */}
      {savedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-4 shadow-xl text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Workflow DAG saved successfully</span>
        </div>
      )}
    </div>
  );
}
