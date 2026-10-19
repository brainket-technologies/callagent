"use client";

import React, { useState, useEffect, useRef, use, Suspense } from "react";
import { useStore } from "@/lib/store-context";
import {
  Bot,
  Volume2,
  Database,
  Phone,
  PhoneCall,
  Sliders,
  MessageSquare,
  Layout,
  Radio,
  FileCode2,
  Wrench,
  Webhook,
  ArrowLeft,
  Save,
  CheckCircle2,
  Copy,
  Pencil,
  Play,
  Pause,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Shield,
  HelpCircle,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { useVoiceEngine } from "@/lib/voice-engine";

interface AssistantStudioProps {
  params: Promise<{ id: string }>;
}

function AssistantStudioContent({ params }: AssistantStudioProps) {
  const resolvedParams = use(params);
  const { assistants, updateAssistant, setSelectedAssistantForTest, setTestCallDrawerOpen } = useStore();

  const assistant = assistants.find((a) => a.id === resolvedParams.id) || assistants[0];

  const [activeTab, setActiveTab] = useState<
    | "prompt"
    | "voice"
    | "variables"
    | "knowledge_base"
    | "call"
    | "chat"
    | "embed"
    | "keyword_boosting"
    | "advanced_analysis"
    | "tools"
    | "event_subscription"
  >("prompt");

  // Editable fields
  const [promptContent, setPromptContent] = useState(assistant?.prompt || "");
  const [firstMessage, setFirstMessage] = useState(assistant?.firstMessage || "");
  const [interruptible, setInterruptible] = useState(assistant?.interruptible ?? true);
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const [primaryLanguage, setPrimaryLanguage] = useState(assistant?.language || "en-IN");
  const [secondaryLanguage, setSecondaryLanguage] = useState(assistant?.secondaryLanguage || "hi-IN");
  const [selectedVoice, setSelectedVoice] = useState(assistant?.voiceName || "");
  const [voiceSpeed, setVoiceSpeed] = useState("1.0x");
  const [noiseFiltering, setNoiseFiltering] = useState(false);
  const [voicemailDetection, setVoicemailDetection] = useState(true);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState<"sensitive" | "default" | "strict">("default");
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  // Variables state
  const [variablesList, setVariablesList] = useState(["callee_name", "mobile_number"]);
  const [newVarInput, setNewVarInput] = useState("");

  // Keyword boosting
  const [keywords, setKeywords] = useState("EMI, Bajaj, Verification, OTP");

  // Advanced analysis modal
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisVarName, setAnalysisVarName] = useState("");
  const [analysisVarType, setAnalysisVarType] = useState("Boolean");
  const [analysisVarDesc, setAnalysisVarDesc] = useState("");
  const [analysisVarDefault, setAnalysisVarDefault] = useState("");
  const [analysisUseAsGoal, setAnalysisUseAsGoal] = useState(false);
  const [analysisVariables, setAnalysisVariables] = useState([
    { name: "confirmed_identity", type: "Boolean", description: "Whether the customer confirmed their identity", goal: true },
    { name: "callback_preferred_time", type: "String", description: "Preferred callback window if busy", goal: false },
  ]);

  // Embed widgets tab sub-state
  const [embedSubtab, setEmbedSubtab] = useState<"components" | "appearance" | "install">("components");
  const [newComponentModalOpen, setNewComponentModalOpen] = useState(false);

  // Webhook event subscription state
  const [webhookUrl, setWebhookUrl] = useState("https://your-domain.com/webhook");

  const [voiceProviderTab, setVoiceProviderTab] = useState<string>("All");
  const [voiceGenderTab, setVoiceGenderTab] = useState<string>("All");
  const { playVoice, stopVoice, playingVoiceName, playingSlug } = useVoiceEngine();

  const [languagesList, setLanguagesList] = useState<
    Array<{ id?: string; code: string; name: string; nativeName?: string; flagEmoji?: string; sampleText?: string }>
  >([]);
  const [tonesList, setTonesList] = useState<Array<{ id?: string; key: string; name: string; icon?: string }>>([]);

  const [voicesCatalog, setVoicesCatalog] = useState<
    Array<{
      id?: string;
      slug?: string;
      name: string;
      tag: string;
      provider: string;
      previewAudioUrl?: string;
      gender?: string;
      voiceId?: string;
      resolvedLanguages?: Array<{ code: string; name: string; flagEmoji?: string }>;
      resolvedTone?: { key?: string; name: string; icon?: string };
    }>
  >([]);

  useEffect(() => {
    async function loadConfigData() {
      try {
        const [langRes, toneRes, voiceRes] = await Promise.all([
          fetch("/api/languages").then((r) => r.json()).catch(() => null),
          fetch("/api/tones").then((r) => r.json()).catch(() => null),
          fetch("/api/voices").then((r) => r.json()).catch(() => null),
        ]);
        if (langRes?.success && Array.isArray(langRes.languages)) {
          setLanguagesList(langRes.languages);
        }
        if (toneRes?.success && Array.isArray(toneRes.tones)) {
          setTonesList(toneRes.tones);
        }
        if (voiceRes?.success && Array.isArray(voiceRes.voices)) {
          setVoicesCatalog(voiceRes.voices);
          setSelectedVoice((prev) => prev || assistant?.voiceName || voiceRes.voices[0]?.name || "");
        }
      } catch (err) {
        console.error("Failed to load dynamic studio config:", err);
      }
    }
    loadConfigData();
  }, [assistant?.voiceName]);

  const handleSaveAll = () => {
    updateAssistant(assistant.id, {
      prompt: promptContent,
      firstMessage,
      interruptible,
      language: primaryLanguage,
      secondaryLanguage,
    });
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 2500);
  };

  const handleAddAnalysisVariable = () => {
    if (!analysisVarName || !analysisVarDesc) {
      alert("Please fill in variable name and description");
      return;
    }
    setAnalysisVariables([
      ...analysisVariables,
      {
        name: analysisVarName,
        type: analysisVarType,
        description: analysisVarDesc,
        goal: analysisUseAsGoal,
      },
    ]);
    setAnalysisVarName("");
    setAnalysisVarDesc("");
    setAnalysisModalOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white">
      {/* Studio Sub-Navigation Sidebar */}
      <div className="w-56 shrink-0 border-r border-neutral-200 bg-white p-3 overflow-y-auto space-y-5 select-none">
        {/* Top Direction Toggle */}
        <div className="px-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span>Outbound</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-normal">Edited just now</span>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "prompt"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Bot className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "prompt" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Prompt</span>
            {activeTab === "prompt" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "voice"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Volume2 className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "voice" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Voice</span>
            {activeTab === "voice" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("variables")}
            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "variables"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className={`font-mono text-xs ${activeTab === "variables" ? "text-emerald-700 font-bold" : "text-slate-400"}`}>{"</>"}</span>
              <span>Custom Variables</span>
            </span>
            <span className="text-[10px] text-slate-400">{variablesList.length}</span>
            {activeTab === "variables" && <div className="ml-1 h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("knowledge_base")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "knowledge_base"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Database className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "knowledge_base" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Knowledge Base</span>
            {activeTab === "knowledge_base" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>
        </div>

        {/* CALL SETTINGS Group */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Call Settings
          </p>
          <button
            onClick={() => setActiveTab("call")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "call"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <PhoneCall className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "call" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Call</span>
            {activeTab === "call" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "chat"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <MessageSquare className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "chat" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Chat</span>
            {activeTab === "chat" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>
        </div>

        {/* ADVANCED SETTINGS Group */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Advanced Settings
          </p>

          <button
            onClick={() => setActiveTab("embed")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "embed"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Layout className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "embed" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Embed & Widgets</span>
            {activeTab === "embed" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("keyword_boosting")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "keyword_boosting"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Radio className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "keyword_boosting" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Keyword Boosting</span>
            {activeTab === "keyword_boosting" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("advanced_analysis")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "advanced_analysis"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <FileCode2 className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "advanced_analysis" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Advanced Analysis</span>
            {activeTab === "advanced_analysis" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "tools"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Wrench className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "tools" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Tools</span>
            {activeTab === "tools" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>

          <button
            onClick={() => setActiveTab("event_subscription")}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeTab === "event_subscription"
                ? "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
            }`}
          >
            <Webhook className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "event_subscription" ? "text-emerald-700" : "text-slate-400"}`} />
            <span>Event Subscription</span>
            {activeTab === "event_subscription" && <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />}
          </button>
        </div>
      </div>

      {/* Main Studio Editor Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
        {/* Studio Canvas Top Toolbar */}
        <div className="flex h-12 items-center justify-between border-b border-neutral-200/80 bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-neutral-900">{assistant.name}</span>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
              {assistant.version}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAssistantForTest(assistant);
                setTestCallDrawerOpen(true);
              }}
              className="text-xs h-8 border-neutral-300"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Test assistant
            </Button>

            <Button
              size="sm"
              onClick={handleSaveAll}
              className="h-8 font-extrabold text-xs px-4"
            >
              <Save className="h-3.5 w-3.5 mr-1.5 stroke-[3]" />
              Save changes
            </Button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl">
          {/* TAB 1: PROMPT */}
          {activeTab === "prompt" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">System Prompt Engine</h2>
                  <p className="text-xs text-neutral-500">
                    Engineered with {BRAND_CONFIG.name} Enterprise Voice Architecture: decision trees, deterministic subroutines, FAQs, and scenarios.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 font-medium">Interruptible</span>
                  <input
                    type="checkbox"
                    checked={interruptible}
                    onChange={(e) => setInterruptible(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-0"
                  />
                </div>
              </div>

              {/* Rich Prompt Textarea */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-100 pb-2">
                  <span>Type <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-neutral-700 font-mono">@</kbd> or <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-neutral-700 font-mono">{"{{"}</kbd> to add variables</span>
                  <span>{promptContent.length} characters</span>
                </div>

                <textarea
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  rows={26}
                  className="w-full font-mono text-xs leading-relaxed text-neutral-800 bg-transparent border-0 focus:ring-0 focus:outline-none resize-y"
                  placeholder="Paste or write your full conversational prompt here..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: VOICE */}
          {activeTab === "voice" && (
            <div className="space-y-8 animate-in fade-in">
              {/* Language Selection */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Language</h3>
                <p className="text-xs text-neutral-500">Select the language for your assistant.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Primary Language</label>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
                    >
                      {languagesList.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flagEmoji || "🌐"} {lang.name} ({lang.nativeName || lang.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Secondary Language</label>
                    <select
                      value={secondaryLanguage}
                      onChange={(e) => setSecondaryLanguage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
                    >
                      <option value="">None (Single Language Only)</option>
                      {languagesList.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flagEmoji || "🌐"} {lang.name} ({lang.nativeName || lang.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Voice Models */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Voice</h3>
                    <p className="text-xs text-neutral-500">Choose the tone and acoustic persona of the assistant voice.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Provider Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
                      {["All", "Cartesia", "ElevenLabs", "Google", "Sarvam"].map((p) => {
                        const isActive = voiceProviderTab === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setVoiceProviderTab(p)}
                            className={`rounded-md px-3 py-1 transition ${
                              isActive
                                ? "bg-white shadow-xs text-neutral-900 font-bold"
                                : "text-neutral-500 hover:text-neutral-900"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    {/* Gender Filter Pills */}
                    <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setVoiceGenderTab("All")}
                        className={`rounded-md px-2.5 py-1 transition ${
                          voiceGenderTab === "All"
                            ? "bg-white shadow-xs text-neutral-900 font-bold"
                            : "text-neutral-500 hover:text-neutral-900"
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGenderTab("female")}
                        className={`rounded-md px-2.5 py-1 transition flex items-center gap-1 ${
                          voiceGenderTab === "female"
                            ? "bg-white text-pink-600 shadow-xs font-bold"
                            : "text-neutral-500 hover:text-pink-600"
                        }`}
                      >
                        <span>♀</span> Female
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGenderTab("male")}
                        className={`rounded-md px-2.5 py-1 transition flex items-center gap-1 ${
                          voiceGenderTab === "male"
                            ? "bg-white text-blue-600 shadow-xs font-bold"
                            : "text-neutral-500 hover:text-blue-600"
                        }`}
                      >
                        <span>♂</span> Male
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voice Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {voicesCatalog.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-xs text-neutral-400">
                      Loading AI voices from database...
                    </div>
                  ) : (
                    voicesCatalog
                      .filter((v) => {
                      const matchesProvider =
                        voiceProviderTab === "All" ||
                        v.provider.toLowerCase() === voiceProviderTab.toLowerCase();
                      const matchesGender =
                        voiceGenderTab === "All" ||
                        (v.gender || "female").toLowerCase() === voiceGenderTab.toLowerCase();
                      return matchesProvider && matchesGender;
                    })
                    .map((v) => {
                      const isSelected = selectedVoice === v.name;
                      const isPlaying = playingVoiceName === v.name || playingSlug === v.slug;
                      const isFemale = (v.gender || "female").toLowerCase() === "female";

                      return (
                        <div
                          key={v.name}
                          onClick={() => setSelectedVoice(v.name)}
                          className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? "border-[#FF5722] bg-orange-50/10 ring-1 ring-[#FF5722]"
                              : "border-neutral-200 bg-white hover:border-neutral-300"
                          }`}
                        >
                          {/* Subtle Dot Pattern */}
                          <div
                            className="absolute inset-0 rounded-xl pointer-events-none opacity-30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:10px_10px]"
                            style={{
                              maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)",
                              WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)",
                            }}
                          />

                          <div className="relative z-10 flex items-start justify-between">
                            <div>
                              <p className="text-sm font-bold text-neutral-900">{v.name}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full font-medium">
                                  {v.tag || "Neutral"}
                                </span>
                                
                                {/* Gender Badge */}
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                                    isFemale
                                      ? "bg-pink-50 text-pink-700 border-pink-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }`}
                                >
                                  {isFemale ? "♀ Female" : "♂ Male"}
                                </span>

                                {v.provider && (
                                  <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-semibold">
                                    {v.provider}
                                  </span>
                                )}
                              </div>

                              {/* Languages & Tone */}
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                {v.resolvedLanguages && v.resolvedLanguages.length > 0 && (
                                  v.resolvedLanguages.map((l: any) => (
                                    <span
                                      key={l.code || l.id}
                                      className="text-[9px] text-sky-700 bg-sky-50 border border-sky-200/60 px-1.5 py-0.5 rounded font-medium"
                                    >
                                      {l.flagEmoji || "🌐"} {l.name}
                                    </span>
                                  ))
                                )}

                                {v.resolvedTone && (
                                  <span className="text-[9px] text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded font-medium">
                                    {v.resolvedTone.icon || "💼"} {v.resolvedTone.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPlaying) {
                                  stopVoice();
                                  return;
                                }

                                const toneKey = v.resolvedTone?.key || (assistant as any)?.tone || "professional";
                                const langCode = primaryLanguage || v.resolvedLanguages?.[0]?.code || "en-US";
                                const cleanName = v.name.replace(/\(.*?\)/g, "").trim();

                                playVoice({
                                  voiceId: v.slug || v.name,
                                  text: firstMessage || undefined,
                                  language: langCode,
                                  tone: toneKey,
                                  gender: v.gender,
                                  voiceName: v.name,
                                  voiceSlug: v.slug,
                                  previewAudioUrl: v.previewAudioUrl,
                                });
                              }}
                              className={`rounded-full p-2.5 transition shadow-xs ${
                                isPlaying
                                  ? "bg-orange-600 text-white animate-pulse"
                                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-900 hover:text-white"
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="h-3 w-3 fill-current" />
                              ) : (
                                <Play className="h-3 w-3 fill-current" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Voice Speed */}
                <div className="pt-4 border-t border-neutral-100">
                  <label className="text-xs font-semibold text-neutral-700">Voice speed</label>
                  <p className="text-xs text-neutral-400">Adjust the speaking speed of your assistant.</p>
                  <div className="mt-2 flex items-center gap-2">
                    {["0.7x", "0.8x", "0.9x", "1.0x", "1.1x", "1.2x"].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setVoiceSpeed(speed)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          voiceSpeed === speed
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveAll} className="mt-4 bg-neutral-900 hover:bg-neutral-800 text-white">
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM VARIABLES */}
          {activeTab === "variables" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900">Custom Variables</h3>
              <p className="text-xs text-neutral-500">Inject dynamic caller and database fields into prompt instructions.</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVarInput}
                  onChange={(e) => setNewVarInput(e.target.value)}
                  placeholder="Enter variable name"
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
                />
                <Button
                  onClick={() => {
                    if (!newVarInput.trim()) return;
                    setVariablesList([...variablesList, newVarInput.trim()]);
                    setNewVarInput("");
                  }}
                  className="bg-neutral-900 text-white"
                >
                  Add
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                {variablesList.map((varName) => (
                  <div
                    key={varName}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200"
                  >
                    <span className="font-mono text-xs font-semibold text-neutral-800">
                      {"{{" + varName + "}}"}
                    </span>
                    <button
                      onClick={() => setVariablesList(variablesList.filter((v) => v !== varName))}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KNOWLEDGE BASE */}
          {activeTab === "knowledge_base" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900">Knowledge Base</h3>
              <p className="text-xs text-neutral-500">Please select the knowledge base(s).</p>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
                No knowledge bases found
              </div>

              <Link
                href="/dashboard/knowledge-base/create"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4" />
                Add Knowledge Base
              </Link>
            </div>
          )}

          {/* TAB 5: CALL SETTINGS */}
          {activeTab === "call" && (
            <div className="space-y-6 animate-in fade-in">
              {/* Call limits */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Call limits</h3>
                <p className="text-xs text-neutral-500">How often this agent may call the same person.</p>
                <div>
                  <label className="text-xs font-semibold text-neutral-700">Maximum calls to one person</label>
                  <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900">
                    <option>No limit</option>
                    <option>1 call per 24 hours</option>
                    <option>3 calls per week</option>
                  </select>
                </div>
              </div>

              {/* Call duration */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Call duration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Maximum Call Duration</label>
                    <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900">
                      <option>4 minutes</option>
                      <option>8 minutes</option>
                      <option>15 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Inactivity Warning</label>
                    <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900">
                      <option>10 seconds</option>
                      <option>20 seconds</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Noise Filtering</p>
                    <p className="text-xs text-neutral-400">Reduces background noise for clearer calls.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={noiseFiltering}
                    onChange={(e) => setNoiseFiltering(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                </div>
              </div>

              {/* Calling Window */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Calling window</h3>
                <p className="text-xs text-neutral-500">Set up the hours this agent can call.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-500">Call start time</label>
                    <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                      <option>09:00</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Call end time</label>
                    <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                      <option>21:00</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Voicemail */}
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Voicemail</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Voicemail detection</p>
                    <p className="text-xs text-neutral-400">Detects when a call reaches voicemail.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voicemailDetection}
                    onChange={(e) => setVoicemailDetection(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CHAT */}
          {activeTab === "chat" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900">Chat Duration</h3>
              <p className="text-xs text-neutral-500">Set up chat session duration and timeout settings.</p>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Maximum call length (seconds)</label>
                <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                  <option>480 seconds</option>
                  <option>600 seconds</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Idle Timeout Warning (seconds)</label>
                <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                  <option>60 seconds</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Idle Timeout End (seconds)</label>
                <select className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm">
                  <option>90 seconds</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 7: EMBED & WIDGETS */}
          {activeTab === "embed" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold max-w-sm">
                <button
                  onClick={() => setEmbedSubtab("components")}
                  className={`flex-1 rounded-lg py-1.5 text-center ${
                    embedSubtab === "components" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setEmbedSubtab("appearance")}
                  className={`flex-1 rounded-lg py-1.5 text-center ${
                    embedSubtab === "appearance" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  Appearance
                </button>
                <button
                  onClick={() => setEmbedSubtab("install")}
                  className={`flex-1 rounded-lg py-1.5 text-center ${
                    embedSubtab === "install" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
                  }`}
                >
                  Install & domains
                </button>
              </div>

              {embedSubtab === "components" && (
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm text-center space-y-4">
                  <h4 className="text-base font-bold text-neutral-900">Describe it, and it's built</h4>
                  <p className="text-xs text-neutral-500">Create your first component by picking a template and shaping it.</p>
                  <Button onClick={() => setNewComponentModalOpen(true)} className="bg-neutral-900 text-white">
                    + New component
                  </Button>
                </div>
              )}

              {embedSubtab === "install" && (
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-neutral-900">Embed snippet</h4>
                  <pre className="rounded-xl bg-[#0A1128] border border-[#1E305E] p-4 text-xs font-mono text-cyan-300 overflow-x-auto shadow-inner">
{`<script src="${BRAND_CONFIG.sdkCdnUrl}" async></script>
<script>
  window.addEventListener("DOMContentLoaded", () => {
    VoxeraVoice.init({
      agentId: "${assistant.id}",
      authorization: "Bearer pk_live_${assistant.id.slice(0, 16)}"
    });
  });
</script>`}
                  </pre>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`<script>loadAgent({ agentId: "${assistant.id}" });</script>`);
                      alert("Copied embed script snippet to clipboard!");
                    }}
                    variant="outline"
                    className="text-xs"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy snippet
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: KEYWORD BOOSTING */}
          {activeTab === "keyword_boosting" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900">Keyword Boosting</h3>
              <p className="text-xs text-neutral-500">
                Enhance assistant's vocabulary by adding targeted words to improve communication.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="+ Add keywords, comma-separated..."
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                />
                <Button className="bg-neutral-900 text-white">Add</Button>
              </div>
            </div>
          )}

          {/* TAB 9: ADVANCED ANALYSIS */}
          {activeTab === "advanced_analysis" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Advanced analysis</h3>
                  <p className="text-xs text-neutral-500">Define the variables your analysis extracts from every call.</p>
                </div>
                <Button onClick={() => setAnalysisModalOpen(true)} className="bg-neutral-900 text-white text-xs h-8">
                  + Add a new variable
                </Button>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm divide-y divide-neutral-100">
                {analysisVariables.map((v, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">{v.name}</p>
                      <p className="text-neutral-500 mt-0.5">{v.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-500">{v.type}</span>
                      {v.goal && <Badge variant="success">Goal</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: TOOLS */}
          {activeTab === "tools" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm text-center space-y-4 animate-in fade-in">
              <h4 className="text-base font-bold text-neutral-900">Pre-call, On-call, and Post-call Tools</h4>
              <p className="text-xs text-neutral-500">
                Connect external APIs, CRM sync webhooks, Google Calendar booking, or custom JQ logic during phone conversations.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/dashboard/integrations"
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  Manage Workspace Tools ↗
                </Link>
              </div>
            </div>
          )}

          {/* TAB 11: EVENT SUBSCRIPTION */}
          {activeTab === "event_subscription" && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-neutral-900">Webhook Subscriptions</h3>
              <p className="text-xs text-neutral-500">Manage your webhook subscriptions for call events.</p>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Callback URL *</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Select Events</label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-neutral-700">
                  {["Call Started", "Call Ringing", "Call Ongoing", "Call Completed", "Recording Ready", "Platform Analysis Done"].map((ev) => (
                    <label key={ev} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      <input type="checkbox" defaultChecked className="rounded text-neutral-900" />
                      <span>{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={() => alert("Subscription created!")} className="bg-neutral-900 text-white">
                Create Subscription
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Save Success Green Toast (matches Ringg.AI!) */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-4 shadow-xl text-xs font-bold text-emerald-800 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Success: Settings updated successfully</span>
        </div>
      )}

      {/* Modal: Add Advanced Analysis Variable */}
      <Modal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        title="Add Variables"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Variable name *</label>
            <input
              type="text"
              value={analysisVarName}
              onChange={(e) => setAnalysisVarName(e.target.value)}
              placeholder="e.g. customer_sentiment"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Type</label>
            <select
              value={analysisVarType}
              onChange={(e) => setAnalysisVarType(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            >
              <option>Boolean</option>
              <option>String</option>
              <option>Number</option>
              <option>Array</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Description *</label>
            <textarea
              value={analysisVarDesc}
              onChange={(e) => setAnalysisVarDesc(e.target.value)}
              rows={2}
              placeholder="What the analysis should extract from the call."
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-neutral-800">Use as goal</p>
              <p className="text-[11px] text-neutral-500">Used by analytics to calculate agent success rate.</p>
            </div>
            <input
              type="checkbox"
              checked={analysisUseAsGoal}
              onChange={(e) => setAnalysisUseAsGoal(e.target.checked)}
              className="h-4 w-4 rounded text-neutral-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAnalysisModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAnalysisVariable} className="bg-neutral-900 text-white">Add</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: New Embed Component */}
      <Modal
        isOpen={newComponentModalOpen}
        onClose={() => setNewComponentModalOpen(false)}
        title="New component"
        description="Start from a template. Everything is editable after."
        maxWidth="xl"
      >
        <div className="grid grid-cols-2 gap-3 pt-2">
          {["Start blank", "Plan comparison", "Lead form", "Info card", "Calendar slots", "Quick actions"].map((comp) => (
            <div
              key={comp}
              onClick={() => {
                alert(`Added component template: ${comp}`);
                setNewComponentModalOpen(false);
              }}
              className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 cursor-pointer text-left transition"
            >
              <p className="text-sm font-bold text-neutral-900">{comp}</p>
              <p className="text-xs text-neutral-500 mt-1">Ready-to-use in-call UI widget card.</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default function AssistantStudioPage(props: AssistantStudioProps) {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-500 font-medium">Loading Assistant Studio...</div>}>
      <AssistantStudioContent {...props} />
    </Suspense>
  );
}
