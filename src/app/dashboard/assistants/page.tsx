"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { formatDuration } from "@/lib/utils";
import {
  Bot,
  Plus,
  Search,
  Phone,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { INDUSTRY_TEMPLATES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function AssistantsPage() {
  const router = useRouter();
  const { assistants, setSelectedAssistantForTest, setTestCallDrawerOpen, createAssistant } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrchestration, setSelectedOrchestration] = useState<"single" | "multi">("single");

  const filteredAssistants = assistants.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFromTemplate = (templateId: string) => {
    const tmpl = INDUSTRY_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    const newAgent = createAssistant({
      name: tmpl.title,
      description: tmpl.description,
      language: tmpl.language.includes("Hindi") ? "hi-IN" : "en-IN",
      prompt: tmpl.promptObjective,
    });

    setCreateModalOpen(false);
    router.push(`/dashboard/assistants/${newAgent.id}?orchestration=single`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Assistants</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Build, test, and deploy autonomous conversational voice agents.
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="text-xs h-10 px-4 rounded-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Create assistant
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assistants by name, prompt or purpose..."
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-sm text-neutral-900 focus:border-[#11E97F] focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Assistants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssistants.map((assistant) => (
          <div
            key={assistant.id}
            className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#11E97F] text-[#0A0E1A] font-extrabold shadow-sm ring-1 ring-black/5">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/assistants/${assistant.id}?orchestration=single`}
                      className="text-base font-bold text-neutral-900 hover:underline flex items-center gap-1.5"
                    >
                      <span>{assistant.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {assistant.version}
                      </span>
                    </Link>
                    <p className="text-xs text-neutral-500 capitalize">{assistant.direction} Agent</p>
                  </div>
                </div>

                <Badge variant={assistant.status === "active" ? "success" : "secondary"}>
                  {assistant.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-3.5 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                {assistant.description}
              </p>

              {/* Badges / Specs */}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-neutral-600">
                <span className="rounded-md bg-neutral-50 border border-neutral-200 px-2 py-1 font-medium">
                  {assistant.voiceName}
                </span>
                <span className="rounded-md bg-neutral-50 border border-neutral-200 px-2 py-1 font-medium">
                  {assistant.language}
                </span>
                {assistant.assignedPhone && (
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 font-mono">
                    {assistant.assignedPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Metrics & Actions */}
            <div className="mt-6 border-t border-neutral-100 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div>
                  <span className="font-bold text-neutral-900">{assistant.totalCallsCount}</span> calls
                </div>
                <div>
                  <span className="font-bold text-neutral-900">{formatDuration(assistant.averageHandleTimeSec)}</span> AHT
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAssistantForTest(assistant);
                    setTestCallDrawerOpen(true);
                  }}
                  className="rounded-lg text-xs font-semibold h-8 border-neutral-200 hover:bg-neutral-100"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Test
                </Button>

                <Link
                  href={`/dashboard/assistants/${assistant.id}?orchestration=single`}
                  className="inline-flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white h-8 px-3 text-xs font-semibold"
                >
                  Edit Studio
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ASSISTANT MODAL (Matching Ringg.AI 12 Templates & Single/Multi Prompt choice) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New AI Voice Assistant"
        description="Choose how you want to build your assistant or start with an industry-tested template."
        maxWidth="2xl"
      >
        <div className="space-y-6 pt-2">
          {/* Orchestration Choice Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedOrchestration("single")}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedOrchestration === "single"
                  ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white mb-2">
                <Bot className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-neutral-900">Single Prompt Assistant</p>
              <p className="text-xs text-neutral-500 mt-1">
                Fastest way to build. One rich, dynamic system prompt manages the entire conversation flow with auto-subroutines.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrchestration("multi")}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                selectedOrchestration === "multi"
                  ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white mb-2">
                <Layers className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-neutral-900">Multi-Prompt / Node State Machine</p>
              <p className="text-xs text-neutral-500 mt-1">
                Advanced graph state machine. Different prompts trigger at discrete conversational nodes.
              </p>
            </button>
          </div>

          {/* Quick Create Custom Wizard Button */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-900 text-white p-4">
            <div>
              <p className="text-sm font-bold">Start from scratch with AI Wizard</p>
              <p className="text-xs text-neutral-300 mt-0.5">Let our AI generate your prompt, guidelines, and FAQs in 30 seconds.</p>
            </div>
            <Link
              href="/dashboard/assistants/new"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 transition shadow-sm"
            >
              Open AI Wizard ➔
            </Link>
          </div>

          {/* Industry Pre-built Templates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Or Start with Pre-Trained Industry Blueprint
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {INDUSTRY_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleCreateFromTemplate(tmpl.id)}
                  className="group flex flex-col justify-between rounded-xl border border-neutral-200 p-3.5 hover:border-neutral-900 hover:bg-neutral-50/50 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {tmpl.category}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-neutral-900">{tmpl.title}</p>
                    <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-neutral-400 font-medium">
                    Language: {tmpl.language}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
