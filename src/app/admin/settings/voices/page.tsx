"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  Loader2,
  UploadCloud,
  Sliders,
  AudioWaveform,
  Globe,
  Radio,
  Languages,
  Check,
  Key,
  Users,
  SlidersHorizontal,
  RefreshCw,
  PhoneCall,
  Bot,
} from "lucide-react";
import {
  useVoiceEngine,
  getVoiceCleanName,
  sanitizeSpeechText,
} from "@/lib/voice-engine";

interface SystemLanguage {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
  sampleText?: string;
  isPrimary?: boolean;
}

interface SystemTone {
  id: string;
  key: string;
  name: string;
  description: string;
  promptInstruction: string;
  icon: string;
  isDefault?: boolean;
}

interface ResolvedLanguage {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
  sampleText?: string;
}

interface ResolvedTone {
  id: string;
  key: string;
  name: string;
  icon?: string;
}

interface VoiceItem {
  id: string;
  slug: string;
  name: string;
  provider: string;
  voiceId: string;
  model: string;
  tag: string;
  gender: string;
  languages?: string[];
  resolvedLanguages?: ResolvedLanguage[];
  tone?: string;
  resolvedTone?: ResolvedTone;
  previewAudioUrl: string;
  description: string;
  isEnabled: boolean;
  sortOrder: number;
}

const PROVIDER_TABS = ["All", "Custom Clones", "Cartesia", "ElevenLabs", "Google", "Sarvam", "OpenAI"] as const;

export default function AdminVoiceLibraryPage() {
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [availableLanguages, setAvailableLanguages] = useState<SystemLanguage[]>([]);
  const [availableTones, setAvailableTones] = useState<SystemTone[]>([]);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("all");
  const [selectedToneFilter, setSelectedToneFilter] = useState<string>("all");

  const {
    playVoice,
    stopVoice,
    isPlaying: isEnginePlaying,
    playingSlug,
    playingDetails,
  } = useVoiceEngine();

  // Voice API Keys Modal State
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [savingApiKeys, setSavingApiKeys] = useState(false);
  const [apiKeysConfig, setApiKeysConfig] = useState({
    elevenlabsApiKey: "",
    sarvamApiKey: "",
    cartesiaApiKey: "",
    openaiApiKey: "",
    hasElevenlabsKey: false,
    hasSarvamKey: false,
    hasCartesiaKey: false,
    hasOpenaiKey: false,
    defaultProvider: "elevenlabs",
  });

  // Clone Reference Audio Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const cloneFileInputRef = useRef<HTMLInputElement>(null);
  const [cloneFormData, setCloneFormData] = useState({
    name: "",
    gender: "female",
    provider: "ElevenLabs",
    tone: "",
    description: "",
    file: null as File | null,
    fileName: "",
  });

  // Two-Speaker Dialogue Simulator State
  const [showDialogueModal, setShowDialogueModal] = useState(false);
  const [isSimulatingDialogue, setIsSimulatingDialogue] = useState(false);
  const [dialogueActiveTurn, setDialogueActiveTurn] = useState<number | null>(null);
  const [dialogueAudio, setDialogueAudio] = useState<HTMLAudioElement | null>(null);
  const [dialogueParams, setDialogueParams] = useState({
    speakerAId: "firoz-sonic-35",
    speakerBId: "riya-sonic-35",
    style: 0.35,
    stability: 0.5,
    turns: [
      { speaker: "A" as const, text: "अरे नमस्ते! कैसे हैं आप? मैं Voxera से बोल रहा हूँ।" },
      { speaker: "B" as const, text: "हाँजी नमस्ते! बताइए क्या बात है?" },
      { speaker: "A" as const, text: "बस आपके नए ऑर्डर के कन्फर्मेशन को लेकर एक छोटी सी बात करनी थी।" },
      { speaker: "B" as const, text: "अच्छा बढ़िया, बिल्कुल बताइए!" },
    ],
  });

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    name: "",
    provider: "",
    voiceId: "",
    model: "",
    tag: "",
    gender: "",
    languages: [] as string[],
    tone: "",
    previewAudioUrl: "",
    description: "",
    isEnabled: true,
    sortOrder: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch languages and tones from DB
  const loadDependencies = async () => {
    try {
      const [langRes, toneRes] = await Promise.all([
        fetch("/api/admin/languages").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/tones").then((r) => r.json()).catch(() => null),
      ]);
      if (langRes?.success && Array.isArray(langRes.languages)) {
        setAvailableLanguages(langRes.languages);
      }
      if (toneRes?.success && Array.isArray(toneRes.tones)) {
        setAvailableTones(toneRes.tones);
      }
      loadApiKeysConfig();
    } catch (err) {
      console.error("Error loading voice dependencies:", err);
    }
  };

  // Fetch Voice Provider API Credentials
  const loadApiKeysConfig = async () => {
    try {
      const res = await fetch("/api/admin/voice-settings");
      const data = await res.json();
      if (data.success && data.config) {
        setApiKeysConfig(data.config);
      }
    } catch (err) {
      console.warn("Could not load voice settings:", err);
    }
  };

  // Save Voice Provider API Credentials
  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingApiKeys(true);
    try {
      const res = await fetch("/api/admin/voice-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKeysConfig),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Voice Provider API keys saved successfully!");
        setShowApiKeysModal(false);
        loadApiKeysConfig();
      } else {
        throw new Error(data.error || "Failed to save API keys");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save API credentials");
    } finally {
      setSavingApiKeys(false);
    }
  };

  // Clone Custom Voice from Reference Audio
  const handleCloneVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneFormData.file) {
      showToast("Please select a reference audio file first (.mp3, .wav).");
      return;
    }
    if (!cloneFormData.name.trim()) {
      showToast("Please provide a name for the cloned voice.");
      return;
    }
    setIsCloning(true);
    try {
      const form = new FormData();
      form.append("name", cloneFormData.name);
      form.append("gender", cloneFormData.gender);
      form.append("provider", cloneFormData.provider);
      form.append("tone", cloneFormData.tone || availableTones[0]?.id || "");
      form.append("description", cloneFormData.description);
      form.append("file", cloneFormData.file);

      const res = await fetch("/api/admin/voices/clone", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success && data.voice) {
        showToast(data.message || "Custom voice cloned successfully!");
        setShowCloneModal(false);
        setCloneFormData({
          name: "",
          gender: "female",
          provider: "ElevenLabs",
          tone: "",
          description: "",
          file: null,
          fileName: "",
        });
        loadVoices();
      } else {
        throw new Error(data.error || "Failed to clone voice");
      }
    } catch (err: any) {
      showToast(err?.message || "Voice cloning failed");
    } finally {
      setIsCloning(false);
    }
  };

  // Simulate Two-Speaker Live Dialogue
  const handleSimulateDialogue = async () => {
    if (dialogueAudio) {
      dialogueAudio.pause();
      setDialogueAudio(null);
      setDialogueActiveTurn(null);
    }
    setIsSimulatingDialogue(true);
    try {
      const res = await fetch("/api/voice-engine/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speakerAId: dialogueParams.speakerAId,
          speakerBId: dialogueParams.speakerBId,
          dialogue: dialogueParams.turns,
          style: dialogueParams.style,
          stability: dialogueParams.stability,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.turns)) {
        const turnsToPlay = data.turns;
        const playTurn = (idx: number) => {
          if (idx >= turnsToPlay.length) {
            setDialogueActiveTurn(null);
            setIsSimulatingDialogue(false);
            return;
          }
          setDialogueActiveTurn(idx);
          const turn = turnsToPlay[idx];
          const audio = new Audio(turn.audioUrl);
          setDialogueAudio(audio);
          audio.onended = () => {
            setTimeout(() => {
              playTurn(idx + 1);
            }, 350);
          };
          audio.onerror = () => {
            playTurn(idx + 1);
          };
          audio.play().catch(() => playTurn(idx + 1));
        };
        playTurn(0);
      } else {
        throw new Error(data.error || "Failed to simulate dialogue");
      }
    } catch (err: any) {
      showToast(err?.message || "Dialogue simulation failed");
      setIsSimulatingDialogue(false);
    }
  };

  // Fetch voices from API
  const loadVoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/voices");
      const data = await res.json();
      if (data.success && Array.isArray(data.voices)) {
        setVoices(data.voices);
      } else {
        throw new Error(data.error || "Failed to load voices");
      }
    } catch (err: any) {
      console.error("Error loading voices:", err);
      showToast(err?.message || "Failed to load voice models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoices();
    loadDependencies();
  }, []);

  const [activeVoiceLanguages, setActiveVoiceLanguages] = useState<Record<string, string>>({});

  // Dynamic Live Voice Preview & Script Prompt Tester state (Top edit box)
  const DEFAULT_ENGLISH_PROMPT = "Hey there! How are you doing today? This is ${name}... Let me know how I can help you out!";
  const DEFAULT_HINDI_PROMPT = "अरे नमस्ते! कैसे हैं आप? मैं ${name} बोल रहा हूँ... बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?";
  const [previewScriptText, setPreviewScriptText] = useState<string>("");

  const getVoiceToneKey = (voice: VoiceItem, overrideToneIdOrKey?: string): string => {
    const toneTarget = overrideToneIdOrKey || voice.tone;
    if (!overrideToneIdOrKey && voice.resolvedTone?.key && voice.resolvedTone.key !== "tone") {
      return voice.resolvedTone.key;
    }
    if (toneTarget) {
      const match = availableTones.find(
        (t) => t.id === toneTarget || t.key === toneTarget || t.name.toLowerCase() === toneTarget.toLowerCase()
      );
      if (match?.key) return match.key;
    }
    return "professional";
  };

  // Handle Audio Playback: speaks custom script text in assigned tone, language, and gender using the Universal Voice Engine
  const handlePlayVoice = async (
    voice: VoiceItem,
    overrideToneIdOrKey?: string,
    overrideLangCode?: string
  ) => {
    if (playingSlug === voice.slug) {
      stopVoice();
      return;
    }

    // Resolve Target Language
    let targetLangCode = overrideLangCode || activeVoiceLanguages[voice.slug];
    if (!targetLangCode) {
      if (selectedLanguageFilter !== "all") {
        const matched = availableLanguages.find(
          (l) => l.name === selectedLanguageFilter || l.code === selectedLanguageFilter || l.id === selectedLanguageFilter
        );
        if (matched) targetLangCode = matched.code;
      }
    }
    if (!targetLangCode) {
      targetLangCode = voice.resolvedLanguages?.[0]?.code || "en-US";
    }

    setActiveVoiceLanguages((prev) => ({
      ...prev,
      [voice.slug]: targetLangCode,
    }));

    const matchedLang = availableLanguages.find(
      (l) => l.code === targetLangCode || l.code.split("-")[0] === targetLangCode.split("-")[0]
    );
    const langDisplay = matchedLang ? `${matchedLang.flagEmoji || "🌐"} ${matchedLang.name}` : undefined;

    // Auto-Add Language Requirement: If language being played is not yet in voice.languages, auto-add it to DB and state
    if (matchedLang) {
      const isAlreadyAssigned =
        (Array.isArray(voice.languages) && voice.languages.includes(matchedLang.id)) ||
        (Array.isArray(voice.resolvedLanguages) &&
          voice.resolvedLanguages.some(
            (l) => l.id === matchedLang.id || l.code.toLowerCase() === matchedLang.code.toLowerCase()
          ));

      if (!isAlreadyAssigned) {
        const updatedLangIds = [
          ...(Array.isArray(voice.languages) ? voice.languages : []),
          matchedLang.id,
        ];
        const updatedResolved = [
          ...(Array.isArray(voice.resolvedLanguages) ? voice.resolvedLanguages : []),
          {
            id: matchedLang.id,
            code: matchedLang.code,
            name: matchedLang.name,
            nativeName: matchedLang.nativeName,
            flagEmoji: matchedLang.flagEmoji,
            sampleText: matchedLang.sampleText,
          },
        ];

        // Optimistically update state so the new badge immediately appears on the card
        setVoices((prev) =>
          prev.map((v) =>
            v.slug === voice.slug
              ? { ...v, languages: updatedLangIds, resolvedLanguages: updatedResolved }
              : v
          )
        );

        voice.languages = updatedLangIds;
        voice.resolvedLanguages = updatedResolved;

        // Persist to PostgreSQL database
        fetch("/api/admin/voices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            slug: voice.slug,
            languages: updatedLangIds,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              showToast(`Auto-assigned ${matchedLang.flagEmoji || "🌐"} ${matchedLang.name} to ${voice.name}`);
            }
          })
          .catch((err) => console.error("Auto-assign language persist failed:", err));
      }
    }

    // Resolve Tone Key: Voice's attached tone in database takes absolute precedence
    let toneKey = overrideToneIdOrKey || getVoiceToneKey(voice);
    if (!toneKey && selectedToneFilter !== "all") {
      const matched = availableTones.find(
        (t) => t.name === selectedToneFilter || t.key === selectedToneFilter || t.id === selectedToneFilter
      );
      if (matched?.key) {
        toneKey = matched.key;
      }
    }
    if (!toneKey) {
      toneKey = "professional";
    }
    const matchedTone = availableTones.find((t) => t.key === toneKey || t.id === toneKey);
    const toneDisplay = matchedTone ? `${matchedTone.icon || "💼"} ${matchedTone.name}` : undefined;

    const isCustomText =
      Boolean(previewScriptText) &&
      previewScriptText.trim().length > 0 &&
      previewScriptText !== DEFAULT_ENGLISH_PROMPT &&
      previewScriptText !== DEFAULT_HINDI_PROMPT;

    const rawText = isCustomText ? previewScriptText : undefined;

    await playVoice({
      voiceId: voice.voiceId || voice.slug || voice.id,
      text: rawText,
      language: targetLangCode,
      langName: langDisplay,
      tone: toneKey,
      toneName: toneDisplay,
      gender: voice.gender,
      voiceName: voice.name,
      voiceSlug: voice.slug,
      previewAudioUrl: voice.previewAudioUrl,
      onError: (err) => {
        if (err?.name === "AbortError") return;
        showToast(`Audio preview error for ${voice.name}`);
      },
    });
  };

  // Quick Auto-Add & Play a selected language on a voice
  const handleAutoAddAndPlayLanguage = (voice: VoiceItem, langIdOrCode: string) => {
    const matched = availableLanguages.find(
      (l) => l.id === langIdOrCode || l.code === langIdOrCode
    );
    if (!matched) return;

    setActiveVoiceLanguages((prev) => ({
      ...prev,
      [voice.slug]: matched.code,
    }));

    handlePlayVoice(voice, undefined, matched.code);
  };

  // Toggle Voice Active/Inactive
  const handleToggleVoice = async (voice: VoiceItem) => {
    try {
      const res = await fetch("/api/admin/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          slug: voice.slug,
          isEnabled: !voice.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVoices((prev) =>
          prev.map((v) => (v.slug === voice.slug ? { ...v, isEnabled: data.isEnabled } : v))
        );
        showToast(data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update voice status");
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      slug: "",
      name: "",
      provider: activeTab !== "All" ? activeTab : "",
      voiceId: "",
      model: "",
      tag: "",
      gender: "",
      languages: [],
      tone: "",
      previewAudioUrl: "",
      description: "",
      isEnabled: true,
      sortOrder: voices.length + 1,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (voice: VoiceItem) => {
    setIsEditing(true);
    setFormData({
      id: voice.id,
      slug: voice.slug,
      name: voice.name,
      provider: voice.provider || "",
      voiceId: voice.voiceId || "",
      model: voice.model || "",
      tag: voice.tag || "",
      gender: voice.gender || "",
      languages: Array.isArray(voice.languages) ? voice.languages : [],
      tone: voice.tone || "",
      previewAudioUrl: voice.previewAudioUrl || "",
      description: voice.description || "",
      isEnabled: voice.isEnabled,
      sortOrder: voice.sortOrder || 0,
    });
    setShowModal(true);
  };

  // Save Voice (Add or Update)
  const handleSaveVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Voice name is required");
      return;
    }
    if (!formData.languages || formData.languages.length === 0) {
      showToast("Please select at least one language for this voice");
      return;
    }

    try {
      setIsSaving(true);
      const action = isEditing ? "update" : "add";

      const res = await fetch("/api/admin/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...formData,
          languages: formData.languages,
          tone: formData.tone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEditing ? "Voice updated!" : "Voice added!"));
        setShowModal(false);
        loadVoices();
      } else {
        throw new Error(data.error || "Failed to save voice");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save voice");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Voice
  const handleDeleteVoice = async (voice: VoiceItem) => {
    if (!confirm(`Are you sure you want to delete voice "${voice.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          slug: voice.slug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVoices((prev) => prev.filter((v) => v.slug !== voice.slug));
        showToast(data.message || "Voice deleted successfully");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete voice");
    }
  };

  // Upload Voice Sample Audio
  const handleAudioUpload = async (file: File) => {
    if (!file) return;
    setUploadingAudio(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/upload-voice", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, previewAudioUrl: data.url }));
        showToast("Audio sample uploaded successfully!");
      } else {
        throw new Error(data.error || "Failed to upload audio sample");
      }
    } catch (err: any) {
      showToast(err?.message || "Audio upload failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  // Filter Voices
  const filteredVoices = voices.filter((v) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Custom Clones"
        ? v.tag === "Custom Clone" || v.provider === "Custom"
        : v.provider.toLowerCase() === activeTab.toLowerCase());
    const matchesGender = selectedGenderFilter === "all" || v.gender.toLowerCase() === selectedGenderFilter;
    const matchesLanguage =
      selectedLanguageFilter === "all" ||
      (Array.isArray(v.languages) && v.languages.includes(selectedLanguageFilter)) ||
      (Array.isArray(v.resolvedLanguages) &&
        v.resolvedLanguages.some(
          (l) => l.id === selectedLanguageFilter || l.code === selectedLanguageFilter
        ));
    const matchesTone =
      selectedToneFilter === "all" ||
      v.tone === selectedToneFilter ||
      v.resolvedTone?.id === selectedToneFilter ||
      v.resolvedTone?.key === selectedToneFilter;
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.resolvedLanguages &&
        v.resolvedLanguages.some((l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      (v.resolvedTone &&
        v.resolvedTone.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesGender && matchesLanguage && matchesTone && matchesSearch;
  });

  // Calculate Provider & Gender Stats
  const totalCount = voices.length;
  const activeCount = voices.filter((v) => v.isEnabled).length;
  const femaleCount = voices.filter((v) => v.gender === "female").length;
  const maleCount = voices.filter((v) => v.gender === "male").length;
  const customCloneCount = voices.filter((v) => v.tag === "Custom Clone" || v.provider === "Custom").length;
  const cartesiaCount = voices.filter((v) => v.provider === "Cartesia").length;
  const elevenLabsCount = voices.filter((v) => v.provider === "ElevenLabs").length;
  const googleCount = voices.filter((v) => v.provider === "Google").length;
  const sarvamCount = voices.filter((v) => v.provider === "Sarvam").length;
  const openaiCount = voices.filter((v) => v.provider === "OpenAI").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-inner">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Voice Library & Models</h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Real-Time Human Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ultra-realistic human voices for live calls. Clone reference audio, orchestrate dialogue, and connect ElevenLabs & Sarvam AI.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Voice API Keys Button */}
          <button
            onClick={() => setShowApiKeysModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <Key className="h-3.5 w-3.5 text-amber-500" />
            <span>Voice API Keys</span>
            {(apiKeysConfig.hasElevenlabsKey || apiKeysConfig.hasSarvamKey || apiKeysConfig.hasCartesiaKey || apiKeysConfig.hasOpenaiKey) && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Dialogue Simulator Button */}
          <button
            onClick={() => setShowDialogueModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            <span>Two-Speaker Dialogue</span>
          </button>

          {/* Replicate Audio / Clone Voice Button */}
          <button
            onClick={() => setShowCloneModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 transition cursor-pointer"
          >
            <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
            <span>Replicate Audio (Clone)</span>
          </button>

          {/* Add New Voice Button */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Voice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Voices</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium">
            <span className="text-pink-600">♀ {femaleCount} Female</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600">♂ {maleCount} Male</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Custom Clones</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{customCloneCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Reference Audio</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ElevenLabs</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{elevenLabsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {apiKeysConfig.hasElevenlabsKey ? "🟢 Live Connected" : "Turbo v2.5 / Multi"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sarvam AI</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{sarvamCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {apiKeysConfig.hasSarvamKey ? "🟢 Live Connected" : "Native Indian Bulbul"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cartesia</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cartesiaCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sonic-3.5 Fast TTS</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OpenAI</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{openaiCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">TTS-1 / TTS-1-HD</p>
        </div>
      </div>

      {/* Live Voice Preview & Script Prompt Tester (User Edit Box) */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50/40 p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Live Script & Voice Prompt Tester</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Active Real-Time
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Type text in English or Hindi below. Each voice below speaks this exact script with its assigned tone and language.
              </p>
            </div>
          </div>

          {/* Quick Script Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => setPreviewScriptText("")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition shadow-2xs cursor-pointer ${
                !previewScriptText
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
              }`}
            >
              🌐 Auto (Native Language)
            </button>
            <button
              type="button"
              onClick={() => setPreviewScriptText(DEFAULT_HINDI_PROMPT)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs cursor-pointer"
            >
              🇮🇳 Casual Hindi (दोस्त जैसी बात)
            </button>
            <button
              type="button"
              onClick={() =>
                setPreviewScriptText(
                  "नमस्ते जी! मैं ${name} बात कर रही हूँ... आपके ऑर्डर को लेकर एक छोटा सा अपडेट था, क्या अभी दो मिनट बात हो सकती है?"
                )
              }
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs cursor-pointer"
            >
              👩 Support (कस्टमर केयर)
            </button>
            <button
              type="button"
              onClick={() => setPreviewScriptText(DEFAULT_ENGLISH_PROMPT)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs cursor-pointer"
            >
              🌐 Casual English
            </button>
            <button
              type="button"
              onClick={() =>
                setPreviewScriptText(
                  "नमस्ते! मैं ${name} बोल रहा हूँ डिलीवरी टीम से... आपका पार्सल आज डिलीवर होने वाला है, बस एक बार लोकेशन कन्फर्म करनी थी।"
                )
              }
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs cursor-pointer"
            >
              📦 Dispatch & Delivery
            </button>
          </div>
        </div>

        {/* Textarea Input Box */}
        <div className="relative">
          <textarea
            rows={2}
            value={previewScriptText}
            onChange={(e) => setPreviewScriptText(e.target.value)}
            placeholder="Auto: Speaks attached industry tone (e.g. Logistics Dispatch, Wealth Advisory, Clinic Desk). Or type custom text with ${name}..."
            className="w-full rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs resize-y transition font-medium"
          />
          {previewScriptText && (
            <button
              type="button"
              onClick={() => setPreviewScriptText("")}
              title="Clear text"
              className="absolute top-2.5 right-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Helper info & live status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-semibold text-emerald-700">Tip:</span>
            <span>
              Write <code className="rounded bg-emerald-100/70 px-1 py-0.5 font-mono text-emerald-900 font-bold">${"{name}"}</code> anywhere in the text — each voice dynamically speaks in its assigned language (Hindi, Marathi, Gujarati, English), tone, and gender!
            </span>
          </div>

          {playingDetails ? (
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-emerald-900 text-xs font-semibold shadow-2xs animate-in fade-in">
              <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse flex-shrink-0" />
              <span>
                Speaking: <strong className="font-bold text-emerald-950">{playingDetails.name}</strong> • Language:{" "}
                <span className="rounded bg-white px-1.5 py-0.5 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  {playingDetails.langName}
                </span>{" "}
                • Tone:{" "}
                <span className="rounded bg-white px-1.5 py-0.5 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                  {playingDetails.toneName}
                </span>{" "}
                • Gender:{" "}
                <span className="font-bold">{playingDetails.gender === "female" ? "♀ Female" : "♂ Male"}</span>
                {playingDetails.engineName && (
                  <>
                    {" "}• Voice:{" "}
                    <span className="rounded bg-white px-1.5 py-0.5 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                      {playingDetails.engineName}
                    </span>
                  </>
                )}
              </span>
            </div>
          ) : playingSlug ? (
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-emerald-900 font-semibold animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Translating & preparing voice synthesis...</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Tabs (Matches User Screenshot) */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
            {PROVIDER_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Gender Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedGenderFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Genders
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("female")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                selectedGenderFilter === "female"
                  ? "bg-pink-50 text-pink-700 border border-pink-200 shadow-xs font-bold"
                  : "text-slate-600 hover:text-pink-600"
              }`}
            >
              <span>♀</span> Female ({femaleCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("male")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                selectedGenderFilter === "male"
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              <span>♂</span> Male ({maleCount})
            </button>
          </div>

          {/* Language Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedLanguageFilter}
              onChange={(e) => setSelectedLanguageFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">🌐 All Languages</option>
              {availableLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flagEmoji || "🌐"} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedToneFilter}
              onChange={(e) => setSelectedToneFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-700 font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">🎭 All Tones</option>
              {availableTones.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.icon || "💼"} {tone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side: Search & Waveform Icon */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search voice, gender, accent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <AudioWaveform className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Voice Cards Grid (Exact Visual Style of User Screenshot) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading AI voice catalog...</p>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 text-center px-4">
          <Mic className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No voice models found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? `No voices matching "${searchQuery}" in ${activeTab}`
              : `No voices added under ${activeTab} yet.`}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Voice Model</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((voice) => {
            const isPlaying = playingSlug === voice.slug;
            return (
              <div
                key={voice.slug}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 ${
                  isPlaying
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : voice.isEnabled
                    ? "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                    : "border-slate-200/50 bg-slate-50/60 opacity-75"
                }`}
              >
                {/* Subtle Dot Grid Pattern on the left (as in screenshot) */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:12px_12px]"
                  style={{
                    maskImage: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 65%)",
                    WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 65%)",
                  }}
                />

                {/* Card Top: Name, Tag, & Quick Actions */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="pr-2 flex-1">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {voice.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Pill Tag (rendered only if tag exists in database) */}
                        {voice.tag ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/50">
                            {voice.tag}
                          </span>
                        ) : null}

                        {/* Gender Badge */}
                        {voice.gender ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              voice.gender.toLowerCase() === "female"
                                ? "bg-pink-50 text-pink-700 border-pink-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {voice.gender.toLowerCase() === "female" ? "♀ Female" : "♂ Male"}
                          </span>
                        ) : null}

                        {/* Provider Badge */}
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/60">
                          {voice.provider}
                        </span>
                      </div>

                      {/* Multi-Language Badges & Voice Tone */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {voice.resolvedLanguages && voice.resolvedLanguages.length > 0 ? (
                          voice.resolvedLanguages.map((lang) => {
                            const defaultPrimaryLang = voice.resolvedLanguages?.[0]?.code || "hi-IN";
                            const currentActiveLang =
                              activeVoiceLanguages[voice.slug] ||
                              (selectedLanguageFilter !== "all"
                                ? availableLanguages.find(
                                    (l) =>
                                      l.name === selectedLanguageFilter ||
                                      l.code === selectedLanguageFilter ||
                                      l.id === selectedLanguageFilter
                                  )?.code || defaultPrimaryLang
                                : defaultPrimaryLang);
                            const isLangActive = currentActiveLang === lang.code;

                            return (
                              <button
                                key={lang.id || lang.code}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVoiceLanguages((prev) => ({
                                    ...prev,
                                    [voice.slug]: lang.code,
                                  }));
                                  handlePlayVoice(voice, undefined, lang.code);
                                }}
                                title={`Click to play in ${lang.name}`}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border transition cursor-pointer ${
                                  isLangActive
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400 font-bold shadow-2xs"
                                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                                }`}
                              >
                                <span>{lang.flagEmoji || "🌐"}</span>
                                <span>{lang.name}</span>
                                {isLangActive && isPlaying && (
                                  <Volume2 className="h-2.5 w-2.5 text-emerald-600 animate-pulse ml-0.5" />
                                )}
                              </button>
                            );
                          })
                        ) : Array.isArray(voice.languages) && voice.languages.length > 0 ? (
                          voice.languages.map((idOrCode) => {
                            const match = availableLanguages.find(
                              (l) => l.id === idOrCode || l.code === idOrCode
                            );
                            const langCode = match?.code || idOrCode;
                            const isLangActive = activeVoiceLanguages[voice.slug] === langCode;

                            return (
                              <button
                                key={idOrCode}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVoiceLanguages((prev) => ({
                                    ...prev,
                                    [voice.slug]: langCode,
                                  }));
                                  handlePlayVoice(voice, undefined, langCode);
                                }}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border transition cursor-pointer ${
                                  isLangActive
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400 font-bold shadow-2xs"
                                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                                }`}
                              >
                                <span>{match?.flagEmoji || "🌐"}</span>
                                <span>{match?.name || "Language"}</span>
                              </button>
                            );
                          })
                        ) : null}

                        {/* Tone Badge */}
                        {(() => {
                          const toneObj =
                            voice.resolvedTone ||
                            availableTones.find(
                              (t) => t.id === voice.tone || t.key === voice.tone
                            );
                          if (!toneObj && !voice.tone) return null;
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayVoice(voice, toneObj?.key);
                              }}
                              title={`Assigned Tone: ${toneObj?.name || "Professional"} (Click to hear)`}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition cursor-pointer"
                            >
                              <span>{toneObj?.icon || "💼"}</span>
                              <span>{toneObj?.name || "Professional"}</span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Admin Action Buttons (Edit / Delete / Active Toggle) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(voice)}
                        title="Edit voice"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVoice(voice)}
                        title="Delete voice"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description / Model info */}
                  {voice.description && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {voice.description}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Status Toggle & Circular Play Button (Matches Screenshot) */}
                <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVoice(voice)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        voice.isEnabled ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          voice.isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {voice.isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {/* Circular Audio Play Button (Exact match with user screenshot) */}
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(voice)}
                    title={isPlaying ? "Pause voice preview" : "Play voice preview"}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition shadow-sm ${
                      isPlaying
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-slate-100/90 text-slate-800 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Voice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditing ? "Edit AI Voice Model" : "Add New AI Voice Model"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure voice tone, TTS identifier, provider, and audio sample.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoice} className="mt-4 space-y-4">
              {/* Voice Name & Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Voice Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya (Sonic-3.5)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Provider *</label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cartesia">Cartesia</option>
                    <option value="ElevenLabs">ElevenLabs</option>
                    <option value="Google">Google Cloud TTS</option>
                    <option value="Sarvam">Sarvam AI</option>
                    <option value="OpenAI">OpenAI TTS</option>
                    <option value="Custom">Custom Provider</option>
                  </select>
                </div>
              </div>

              {/* Voice ID & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Voice / Model ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sonic-riya-in-35"
                    value={formData.voiceId}
                    onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Used by the TTS engine to generate audio.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sonic-3.5"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Tag & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tag / Badge</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Most Used">Most Used</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Trending">Trending</option>
                    <option value="Featured">Featured</option>
                    <option value="Recommended">Recommended</option>
                    <option value="New">New</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              {/* Supported Languages (Multiple Selection) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Supported Languages * (Multiple Selection)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = availableLanguages.map((l) => l.id);
                        setFormData({ ...formData, languages: allIds });
                      }}
                      className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, languages: [] })}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {availableLanguages.map((lang) => {
                    const isSelected = formData.languages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? formData.languages.filter((id) => id !== lang.id)
                            : [...formData.languages, lang.id];
                          setFormData({ ...formData, languages: updated });
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition text-left cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{lang.flagEmoji || "🌐"}</span>
                          <span className="truncate">{lang.name}</span>
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">
                  {formData.languages.length === 0
                    ? "⚠️ Please select at least one language for this voice."
                    : `✓ ${formData.languages.length} language(s) enabled for this voice.`}
                </p>
              </div>

              {/* Voice Tone & Persona */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Voice Tone & Conversational Persona</span>
                  </label>
                  {formData.tone && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetSlug = formData.slug || "test-voice";
                        const selectedTone = availableTones.find((t) => t.id === formData.tone);
                        const firstLangId = formData.languages[0];
                        const selectedLang = availableLanguages.find((l) => l.id === firstLangId);
                        handlePlayVoice(
                          {
                            id: formData.id || "preview-id",
                            slug: targetSlug,
                            name: formData.name || "Assistant",
                            provider: formData.provider,
                            voiceId: formData.voiceId,
                            model: formData.model,
                            tag: formData.tag,
                            gender: formData.gender,
                            languages: formData.languages,
                            tone: formData.tone,
                            previewAudioUrl: formData.previewAudioUrl,
                            description: formData.description,
                            isEnabled: true,
                            sortOrder: 0,
                          },
                          selectedTone?.key,
                          selectedLang?.code
                        );
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{playingSlug === (formData.slug || "test-voice") ? "Stop Audio" : `Test Voice (${formData.name || "Sample"})`}</span>
                    </button>
                  )}
                </div>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  {availableTones.map((tone) => (
                    <option key={tone.id} value={tone.id}>
                      {tone.icon || "💼"} {tone.name} - {tone.description}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Audio playback will instantly match this acoustic tone and persona.</p>
              </div>

              {/* Audio Sample Upload & URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Preview Audio Sample</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload sample below"
                    value={formData.previewAudioUrl}
                    onChange={(e) => setFormData({ ...formData, previewAudioUrl: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAudioUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={uploadingAudio}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
                  >
                    {uploadingAudio ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" />
                    )}
                    <span>{uploadingAudio ? "Uploading..." : "Upload File"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Optional. If empty, the browser speech synthesis will automatically provide an instant live preview.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Description / Tone Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Warm, expressive, high-clarity voice ideal for conversational sales calls."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Enabled Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isEnabledVoice"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isEnabledVoice" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable this voice model for user assistants
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving..." : isEditing ? "Update Voice" : "Add Voice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Engine API Credentials Modal */}
      {showApiKeysModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Voice Engine API Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connect ElevenLabs, Sarvam AI, Cartesia & OpenAI for 100% human-like voice synthesis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeysModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKeys} className="mt-4 space-y-4">
              {/* ElevenLabs API Key */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span>ElevenLabs API Key</span>
                    {apiKeysConfig.hasElevenlabsKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Not Configured
                      </span>
                    )}
                  </label>
                  <a
                    href="https://elevenlabs.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-emerald-600 hover:underline"
                  >
                    Get API Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={apiKeysConfig.hasElevenlabsKey ? "••••••••••••••••••••••••" : "sk_..."}
                  value={apiKeysConfig.elevenlabsApiKey}
                  onChange={(e) =>
                    setApiKeysConfig({ ...apiKeysConfig, elevenlabsApiKey: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">
                  Enables ElevenLabs Turbo v2.5, Multilingual v2, and Custom Instant Voice Cloning.
                </p>
              </div>

              {/* Sarvam AI API Key */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span>Sarvam AI API Key (Bulbul)</span>
                    {apiKeysConfig.hasSarvamKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Not Configured
                      </span>
                    )}
                  </label>
                  <a
                    href="https://sarvam.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-emerald-600 hover:underline"
                  >
                    Get API Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={apiKeysConfig.hasSarvamKey ? "••••••••••••••••••••••••" : "sarvam_api_key_..."}
                  value={apiKeysConfig.sarvamApiKey}
                  onChange={(e) =>
                    setApiKeysConfig({ ...apiKeysConfig, sarvamApiKey: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">
                  State-of-the-art native Indian Hindi & Hinglish phone conversational voices (bulbul:v1).
                </p>
              </div>

              {/* Cartesia API Key */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span>Cartesia API Key (Sonic-3.5)</span>
                    {apiKeysConfig.hasCartesiaKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Not Configured
                      </span>
                    )}
                  </label>
                  <a
                    href="https://cartesia.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-emerald-600 hover:underline"
                  >
                    Get API Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={apiKeysConfig.hasCartesiaKey ? "••••••••••••••••••••••••" : "cartesia_api_key_..."}
                  value={apiKeysConfig.cartesiaApiKey}
                  onChange={(e) =>
                    setApiKeysConfig({ ...apiKeysConfig, cartesiaApiKey: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">
                  Ultra low-latency streaming TTS (90ms) for high-frequency call center dialogues.
                </p>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span>OpenAI API Key (TTS-1 HD)</span>
                    {apiKeysConfig.hasOpenaiKey ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Not Configured
                      </span>
                    )}
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-emerald-600 hover:underline"
                  >
                    Get API Key ↗
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={apiKeysConfig.hasOpenaiKey ? "••••••••••••••••••••••••" : "sk-..."}
                  value={apiKeysConfig.openaiApiKey}
                  onChange={(e) =>
                    setApiKeysConfig({ ...apiKeysConfig, openaiApiKey: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500">
                  Enables OpenAI HD voices (alloy, echo, fable, onyx, nova, shimmer).
                </p>
              </div>

              {/* Default Engine Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Preferred Default Voice Engine</label>
                <select
                  value={apiKeysConfig.defaultProvider}
                  onChange={(e) =>
                    setApiKeysConfig({ ...apiKeysConfig, defaultProvider: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="elevenlabs">ElevenLabs (Turbo v2.5 / Multilingual v2) - Recommended</option>
                  <option value="sarvam">Sarvam AI (Bulbul - Native Indian Hindi & Hinglish)</option>
                  <option value="cartesia">Cartesia Sonic-3.5 (Ultra Low Latency 90ms)</option>
                  <option value="openai">OpenAI (TTS-1 HD High Definition)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  When API keys are configured, all agent calls will stream from these ultra-realistic human models.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowApiKeysModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingApiKeys}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {savingApiKeys && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{savingApiKeys ? "Saving..." : "Save Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replicate Audio / Voice Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Replicate Reference Audio (Voice Clone)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a real person's audio sample to replicate their exact acoustic tone and style.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloneModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCloneVoice} className="mt-4 space-y-4">
              {/* File Upload Drag/Drop Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Reference Audio File *</label>
                <input
                  type="file"
                  ref={cloneFileInputRef}
                  accept="audio/*,.mp3,.wav,.m4a"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCloneFormData({
                        ...cloneFormData,
                        file: file,
                        fileName: file.name,
                      });
                    }
                  }}
                />
                <div
                  onClick={() => cloneFileInputRef.current?.click()}
                  className={`mt-1.5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                    cloneFormData.file
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-100/50"
                  }`}
                >
                  {cloneFormData.file ? (
                    <div className="space-y-1">
                      <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-emerald-900">{cloneFormData.fileName}</p>
                      <p className="text-[11px] text-emerald-700">
                        {(cloneFormData.file.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Click to select or drag audio recording
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports MP3, WAV, M4A (10s – 2min of clear speech recommended)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Name & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Voice Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Firoz (Personal Clone)"
                    value={cloneFormData.name}
                    onChange={(e) => setCloneFormData({ ...cloneFormData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Perceived Gender *</label>
                  <select
                    value={cloneFormData.gender}
                    onChange={(e) => setCloneFormData({ ...cloneFormData, gender: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>

              {/* Provider & Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Cloning Provider</label>
                  <select
                    value={cloneFormData.provider}
                    onChange={(e) => setCloneFormData({ ...cloneFormData, provider: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="ElevenLabs">ElevenLabs Instant Clone</option>
                    <option value="Cartesia">Cartesia Sonic Voice Clone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Conversational Persona / Tone</label>
                  <select
                    value={cloneFormData.tone}
                    onChange={(e) => setCloneFormData({ ...cloneFormData, tone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    {availableTones.map((tone) => (
                      <option key={tone.id} value={tone.id}>
                        {tone.icon || "💼"} {tone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Description / Cadence Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Natural Hindi/English speaking voice with calm conversational pace."
                  value={cloneFormData.description}
                  onChange={(e) => setCloneFormData({ ...cloneFormData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-[11px] text-amber-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Instant Audio Replication Engine</span>
                </p>
                <p className="mt-0.5 text-amber-800">
                  The audio recording is analyzed for acoustic cadence, timbre, and vocal depth. Once cloned, the voice model becomes immediately available across all caller agents.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCloning}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {isCloning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isCloning ? "Cloning Voice..." : "Clone & Deploy Voice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Speaker Dialogue Simulator Modal */}
      {showDialogueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Two-Speaker Conversational Dialogue Simulator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Orchestrate two-speaker natural turn-taking with control over emotion, style, and stability.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (dialogueAudio) {
                    dialogueAudio.pause();
                    setDialogueAudio(null);
                  }
                  setDialogueActiveTurn(null);
                  setShowDialogueModal(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Speaker Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">A</span>
                    <span>Speaker A (AI Agent)</span>
                  </label>
                  <select
                    value={dialogueParams.speakerAId}
                    onChange={(e) =>
                      setDialogueParams({ ...dialogueParams, speakerAId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {voices.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name} ({v.provider} • {v.gender})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">B</span>
                    <span>Speaker B (Lead / Caller)</span>
                  </label>
                  <select
                    value={dialogueParams.speakerBId}
                    onChange={(e) =>
                      setDialogueParams({ ...dialogueParams, speakerBId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {voices.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name} ({v.provider} • {v.gender})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sliders for Style & Stability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl border border-slate-200/80 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Style Exaggeration</span>
                    </span>
                    <span className="font-mono text-indigo-600">{Math.round(dialogueParams.style * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={dialogueParams.style}
                    onChange={(e) =>
                      setDialogueParams({ ...dialogueParams, style: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Controls emotional liveliness and vocal inflection.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Stability & Clarity</span>
                    </span>
                    <span className="font-mono text-emerald-600">{Math.round(dialogueParams.stability * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={dialogueParams.stability}
                    onChange={(e) =>
                      setDialogueParams({ ...dialogueParams, stability: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Higher stability sounds consistent; lower sounds more spontaneous.</p>
                </div>
              </div>

              {/* Dialogue Turns Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <AudioWaveform className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Real-time Conversational Flow (Editable Turns)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">4 Conversational Turns</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {dialogueParams.turns.map((turn, idx) => {
                    const isSpeakerA = turn.speaker === "A";
                    const isCurrentlySpeaking = dialogueActiveTurn === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition ${
                          isCurrentlySpeaking
                            ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-400/40"
                            : isSpeakerA
                            ? "border-slate-200 bg-white"
                            : "border-blue-100 bg-blue-50/30"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold flex-shrink-0 mt-1 ${
                            isSpeakerA
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {turn.speaker}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {isSpeakerA ? "Agent" : "Lead / Caller"}
                            </span>
                            {isCurrentlySpeaking && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 animate-pulse">
                                <Volume2 className="h-3 w-3" /> Speaking now...
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={turn.text}
                            onChange={(e) => {
                              const newTurns = [...dialogueParams.turns];
                              newTurns[idx] = { ...newTurns[idx], text: e.target.value };
                              setDialogueParams({ ...dialogueParams, turns: newTurns });
                            }}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center gap-2">
                  {dialogueActiveTurn !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        if (dialogueAudio) {
                          dialogueAudio.pause();
                          setDialogueAudio(null);
                        }
                        setDialogueActiveTurn(null);
                        setIsSimulatingDialogue(false);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      <span>Stop Playback</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (dialogueAudio) {
                        dialogueAudio.pause();
                        setDialogueAudio(null);
                      }
                      setDialogueActiveTurn(null);
                      setShowDialogueModal(false);
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateDialogue}
                    disabled={isSimulatingDialogue}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSimulatingDialogue ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span>{isSimulatingDialogue ? "Synthesizing Dialogue..." : "Play Live Two-Speaker Dialogue"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
