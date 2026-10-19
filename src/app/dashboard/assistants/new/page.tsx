"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { VOICE_PROVIDERS, DEFAULT_STUDIO_PROMPT } from "@/lib/constants";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  Volume2,
  Sliders,
  Database,
  PhoneCall,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Languages,
  Play,
  Pause,
  Check,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVoiceEngine } from "@/lib/voice-engine";

interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
  isPrimary?: boolean;
}

interface ToneOption {
  key: string;
  name: string;
  industry?: string;
  description: string;
  promptInstruction: string;
  icon: string;
  isDefault?: boolean;
}

interface VoiceOption {
  id: string;
  slug: string;
  name: string;
  provider: string;
  voiceId: string;
  tag: string;
  gender: string;
  accentLanguage?: string;
  tone?: string;
  resolvedTone?: { id: string; key: string; name: string; icon: string };
  previewAudioUrl: string;
}

export default function NewAssistantWizardPage() {
  const router = useRouter();
  const { createAssistant } = useStore();

  const [name, setName] = useState("Customer Engagement Rep");
  const [voiceProvider, setVoiceProvider] = useState<"cartesia" | "elevenlabs" | "azure" | "google" | "sarvam">("cartesia");
  const [language, setLanguage] = useState("en-IN");
  const [secondaryLanguage, setSecondaryLanguage] = useState("hi-IN");

  // Dynamic Languages & Tones from Admin Database
  const [languagesList, setLanguagesList] = useState<LanguageOption[]>([]);
  const [tonesList, setTonesList] = useState<ToneOption[]>([]);
  const [selectedTone, setSelectedTone] = useState("financial-advisory");
  const [selectedToneIndustry, setSelectedToneIndustry] = useState<string>("All");

  // Dynamic Voices from Voice Library
  const [voicesList, setVoicesList] = useState<VoiceOption[]>([]);

  // Multiple Voice Selection State
  const [selectedVoices, setSelectedVoices] = useState<string[]>([]);
  const [primaryVoice, setPrimaryVoice] = useState<string>("");
  const [voiceProviderFilter, setVoiceProviderFilter] = useState("All");
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<string>("all");

  const { playVoice, stopVoice, playingVoiceName, playingSlug } = useVoiceEngine();

  const [company, setCompany] = useState("Alpha Telematics");
  const [callPurpose, setCallPurpose] = useState("Service appointment scheduling & feedback confirmation");
  const [additionalContext, setAdditionalContext] = useState(
    "Verify customer satisfaction, confirm their vehicle registration number, and schedule their 10,000 km routine maintenance."
  );

  const [variables, setVariables] = useState<string[]>(["callee_name", "mobile_number", "appointment_date"]);
  const [newVarInput, setNewVarInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load Admin Configured Languages, Tones, and Voices on Mount
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
          const defaultTone = toneRes.tones.find((t: any) => t.isDefault) || toneRes.tones[0];
          if (defaultTone) {
            setSelectedTone((prev) => (toneRes.tones.some((t: any) => t.key === prev) ? prev : defaultTone.key));
          }
        }
        if (voiceRes?.success && Array.isArray(voiceRes.voices)) {
          setVoicesList(voiceRes.voices);
          if (voiceRes.voices[0]?.name) {
            setSelectedVoices([voiceRes.voices[0].name]);
            setPrimaryVoice(voiceRes.voices[0].name);
          }
        }
      } catch (err) {
        console.error("Error loading builder config data:", err);
      }
    }
    loadConfigData();
  }, []);

  // Multi-voice selection toggle
  const toggleVoiceSelection = (vName: string) => {
    if (selectedVoices.includes(vName)) {
      if (selectedVoices.length === 1) {
        // Must keep at least one voice
        return;
      }
      const updated = selectedVoices.filter((v) => v !== vName);
      setSelectedVoices(updated);
      if (primaryVoice === vName) {
        setPrimaryVoice(updated[0]);
      }
    } else {
      setSelectedVoices([...selectedVoices, vName]);
    }
  };

  // Play voice sample matching tone, language, and gender via Universal Voice Engine
  const handlePlayVoice = (v: VoiceOption) => {
    if (playingVoiceName === v.name || playingSlug === v.slug) {
      stopVoice();
      return;
    }

    const toneKey = v.resolvedTone?.key || selectedTone || "professional";
    const langCode = language || "en-US";

    playVoice({
      voiceId: v.voiceId || v.slug || v.id,
      language: langCode,
      tone: toneKey,
      gender: v.gender,
      voiceName: v.name,
      voiceSlug: v.slug,
      previewAudioUrl: v.previewAudioUrl,
    });
  };

  const handleAddVariable = () => {
    if (!newVarInput.trim()) return;
    const clean = newVarInput.toLowerCase().replace(/\s+/g, "_");
    if (!variables.includes(clean)) {
      setVariables([...variables, clean]);
    }
    setNewVarInput("");
  };

  const handleRemoveVariable = (varName: string) => {
    setVariables(variables.filter((v) => v !== varName));
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);

    const activeToneObj = tonesList.find((t) => t.key === selectedTone);
    const toneInstruction = activeToneObj
      ? `\n### SPEAKING TONE & PERSONA GUIDELINES:\n${activeToneObj.promptInstruction}\n`
      : "";

    setTimeout(() => {
      const synthesizedPrompt = (DEFAULT_STUDIO_PROMPT + toneInstruction)
        .replace(/\{\{agent_name\}\}/g, name)
        .replace(/\{\{company\}\}/g, company)
        .replace(/\{\{call_purpose\}\}/g, callPurpose);

      const targetVoiceObj = voicesList.find((v) => v.name === primaryVoice) || voicesList[0];

      const created = createAssistant({
        name,
        description: `Voice agent for ${company} - ${callPurpose}`,
        voiceProvider: (targetVoiceObj?.provider?.toLowerCase() as any) || voiceProvider,
        voiceName: primaryVoice,
        voiceId: targetVoiceObj?.voiceId || primaryVoice,
        selectedVoices: selectedVoices,
        language,
        secondaryLanguage: secondaryLanguage || undefined,
        firstMessage: `Hi, this is ${name} calling from ${company}. Am I speaking with {{Callee Name}}?`,
        prompt: synthesizedPrompt,
        interruptible: true,
      });

      setIsGenerating(false);
      router.push(`/dashboard/assistants/${created.id}?orchestration=single`);
    }, 1500);
  };

  // Filtered voices
  const filteredVoices = voicesList.filter((v) => {
    const matchesProvider =
      voiceProviderFilter === "All" ||
      v.provider.toLowerCase() === voiceProviderFilter.toLowerCase();
    const matchesGender =
      voiceGenderFilter === "all" || v.gender.toLowerCase() === voiceGenderFilter;
    return matchesProvider && matchesGender;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/assistants"
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">New Voice Assistant Setup</h1>
          <p className="text-xs text-neutral-500">
            Define conversational languages, multi-voice acoustic personas, tone, and call objectives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Configuration Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Agent Basics & Languages */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Bot className="h-4 w-4 text-neutral-700" />
              1. Assistant Identity & Languages
            </h3>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Assistant Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya from Collections"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-blue-600" />
                  Primary Language *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                >
                  {languagesList.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flagEmoji || "🌐"} {lang.name} ({lang.nativeName || lang.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">Managed directly in Admin Languages menu.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-purple-600" />
                  Secondary Multilingual Language
                </label>
                <select
                  value={secondaryLanguage}
                  onChange={(e) => setSecondaryLanguage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="">None (Single Language Only)</option>
                  {languagesList.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flagEmoji || "🌐"} {lang.name} (Auto-Switch)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400 mt-1">Automatic real-time mid-call language switching.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Conversational Tone & Persona */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  2. Conversational Tone & Persona
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Controls speaking style, pacing & phrasing per industry blueprint</p>
              </div>

              {/* Industry Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Logistics", "Healthcare", "Financial", "Education", "HR & Recruitment", "eCommerce"].map((ind) => {
                  const isActive = selectedToneIndustry === ind;
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setSelectedToneIndustry(ind)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tonesList
                .filter(
                  (tone) =>
                    selectedToneIndustry === "All" ||
                    (tone.industry || "").toLowerCase() === selectedToneIndustry.toLowerCase()
                )
                .map((tone) => {
                  const isSelected = selectedTone === tone.key;
                  return (
                    <button
                      key={tone.key}
                      type="button"
                      onClick={() => setSelectedTone(tone.key)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-600"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-2xl select-none">{tone.icon || "💼"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-neutral-900 truncate">{tone.name}</p>
                          {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                        </div>
                        {tone.industry && (
                          <span className="inline-block mt-0.5 text-[9px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/50">
                            {tone.industry}
                          </span>
                        )}
                        <p className="text-[11px] text-neutral-500 mt-1 leading-snug line-clamp-2">
                          {tone.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Section 3: Multi-Voice Selection (From Admin Voice Library) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-orange-600" />
                  3. Select AI Voices (Multi-Voice Support)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select one or multiple voices. Selected:{" "}
                  <strong className="text-orange-600">{selectedVoices.length} Voices</strong> (Primary: {primaryVoice})
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <div className="flex rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
                  {["All", "Cartesia", "ElevenLabs", "Google", "Sarvam"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setVoiceProviderFilter(p)}
                      className={`px-2.5 py-1 rounded-md transition ${
                        voiceProviderFilter === p
                          ? "bg-white shadow-xs text-neutral-900 font-bold"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setVoiceGenderFilter("all")}
                    className={`px-2 py-1 rounded-md transition ${
                      voiceGenderFilter === "all" ? "bg-white text-neutral-900 shadow-xs font-bold" : "text-neutral-500"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceGenderFilter("female")}
                    className={`px-2 py-1 rounded-md transition ${
                      voiceGenderFilter === "female" ? "bg-white text-pink-600 shadow-xs font-bold" : "text-neutral-500"
                    }`}
                  >
                    ♀
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceGenderFilter("male")}
                    className={`px-2 py-1 rounded-md transition ${
                      voiceGenderFilter === "male" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-neutral-500"
                    }`}
                  >
                    ♂
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Cards with Checkboxes & Play */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {voicesList.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-neutral-400">
                  Loading AI voices from database...
                </div>
              ) : (
                filteredVoices.map((v) => {
                  const isChecked = selectedVoices.includes(v.name);
                  const isPrimary = primaryVoice === v.name;
                  const isPlaying = playingVoiceName === v.name || playingSlug === v.slug;
                  const isFemale = (v.gender || "").toLowerCase() === "female";

                  return (
                  <div
                    key={v.name}
                    onClick={() => toggleVoiceSelection(v.name)}
                    className={`relative flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? "border-orange-500 bg-orange-50/15 ring-1 ring-orange-500"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-0.5">
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center transition border ${
                            isChecked
                              ? "bg-orange-600 border-orange-600 text-white"
                              : "border-neutral-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-neutral-900">{v.name}</p>
                          {isPrimary && (
                            <span className="rounded bg-orange-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                              isFemale
                                ? "bg-pink-50 text-pink-700 border-pink-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {isFemale ? "♀ Female" : "♂ Male"}
                          </span>

                          <span className="text-[9px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                            {v.tag || "Neutral"}
                          </span>

                          <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-semibold">
                            {v.provider}
                          </span>
                        </div>

                        {isChecked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryVoice(v.name);
                            }}
                            className={`mt-2 text-[10px] font-semibold underline transition ${
                              isPrimary ? "text-orange-700 cursor-default" : "text-neutral-500 hover:text-orange-600"
                            }`}
                          >
                            {isPrimary ? "Default Voice" : "Set as Primary Voice"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Audio Preview Play Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoice(v);
                      }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition shadow-xs ${
                        isPlaying
                          ? "bg-orange-600 text-white animate-pulse"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-900 hover:text-white"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
            </div>
          </div>

          {/* Section 4: Call Context */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4 w-4 text-neutral-700" />
              4. Company & Call Purpose
            </h3>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Company / Brand Name *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Axis Finance, Zomato, Shiprocket"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Call Purpose & Objective *</label>
              <input
                type="text"
                value={callPurpose}
                onChange={(e) => setCallPurpose(e.target.value)}
                placeholder="e.g. Overdue EMI reminder, NDR address check, Lead qualification"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Additional Instructions & Business Rules</label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={3}
                placeholder="List any mandatory offers, return conditions, or verification questions..."
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Custom Variables */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-neutral-700" />
              5. Dynamic Variables Injection
            </h3>
            <p className="text-xs text-neutral-500">
              Variables will be substituted in real-time during campaign calls or API dispatches.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newVarInput}
                onChange={(e) => setNewVarInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
                placeholder="e.g. loan_amount, policy_id, due_date"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
              <Button type="button" onClick={handleAddVariable} variant="secondary" className="rounded-xl">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {variables.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-mono font-medium text-neutral-800"
                >
                  <span>{"{{" + v + "}}"}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(v)}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Summary & AI Generator Action */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-900 text-white p-6 shadow-lg space-y-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Prompt Synthesis</span>
            </div>

            <h3 className="text-lg font-bold">Generate Enterprise Agent</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Our prompt generator synthesizes the exact 11-stage human conversation model with selected tone directives, multi-voice acoustics, and decision trees.
            </p>

            <div className="space-y-2.5 border-t border-neutral-800 pt-4 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Primary Voice:</span>
                <span className="font-semibold text-white">{primaryVoice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Assigned Voices:</span>
                <span className="font-semibold text-orange-400">{selectedVoices.length} selected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Tone Persona:</span>
                <span className="font-semibold text-purple-400">
                  {tonesList.find((t) => t.key === selectedTone)?.name || selectedTone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Primary Language:</span>
                <span className="font-semibold text-blue-400">{language}</span>
              </div>
            </div>

            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || !name || !company}
              className="w-full h-11 bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold rounded-xl shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Synthesizing Agent...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Synthesize with AI
                </>
              )}
            </Button>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-xs text-neutral-500 space-y-2">
            <p className="font-semibold text-neutral-800">Need direct fine-grained control?</p>
            <p>You can edit every individual prompt turn, voice slider, and sub-action in the Studio Canvas after creation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
