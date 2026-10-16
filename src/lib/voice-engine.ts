"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ==============================================================================
// 1. DYNAMIC DB ENGINE TYPES & INTERFACES
// ==============================================================================
export interface DbLanguage {
  code: string;
  name: string;
  nativeName?: string | null;
  flagEmoji?: string | null;
}

export interface DbTone {
  key: string;
  name: string;
  icon?: string | null;
  rate: number;
  pitch: number;
}

export interface DbVoiceEngineConfig {
  indicVoiceNames: Record<string, { hi: string; mr: string; gu: string; bn: string; ta?: string; te?: string; kn?: string }>;
  noveltyVoices: string[];
  femaleVoices: string[];
  maleVoices: string[];
  toneAudioProfiles: Record<string, { rate: number; pitch: number }>;
}

export interface PlayVoiceOptions {
  /** Voice ID (e.g. from ai_voices.voiceId, ai_voices.slug, or ai_voices.id) */
  voiceId?: string;
  /** Voice unique slug (e.g. "openai-nova") */
  voiceSlug?: string;
  /** Voice name (e.g. "Nova (OpenAI)") */
  voiceName?: string;
  /** The text script to speak. Can contain ${name} or custom text */
  text?: string;
  /** Target Language Code: "hi-IN", "en-US", "mr-IN", etc. If omitted, uses assigned DB language */
  language?: string;
  /** Display label for language */
  langName?: string;
  /** Tone Key: "professional", "playful", "calm", etc. If omitted, uses assigned DB tone */
  tone?: string;
  /** Display label for tone */
  toneName?: string;
  /** Voice gender (dynamic string: "female", "male", etc.). If omitted, uses assigned DB gender */
  gender?: string;
  /** Fallback pre-recorded preview audio URL */
  previewAudioUrl?: string;
  /** Optional callback fired when playback starts */
  onStart?: (details: PlayingVoiceDetails) => void;
  /** Optional callback fired when playback ends naturally */
  onEnd?: () => void;
  /** Optional callback fired on error */
  onError?: (err: any) => void;
}

export interface PlayingVoiceDetails {
  slug?: string;
  voiceId?: string;
  name: string;
  langCode: string;
  langName: string;
  toneKey: string;
  toneName: string;
  gender: string;
  engineName: string;
  spokenText: string;
}

// Clean voice display name (e.g. "Nova (OpenAI)" -> "Nova", "Google en-IN Neural2 B" -> "Google Neural")
export function getVoiceCleanName(fullName: string): string {
  if (!fullName) return "Assistant";
  let clean = fullName.replace(/\(.*?\)/g, "").trim();
  if (clean.toLowerCase().startsWith("google")) {
    clean = clean.replace(/^(google\s+[a-z]{2}-[a-z]{2}\s+)/i, "Google ");
    clean = clean.replace(/neural2\s+[a-z]/i, "Neural");
    clean = clean.replace(/wavenet\s+[a-z]/i, "WaveNet");
    clean = clean.replace(/journey\s+[a-z]/i, "Journey");
  }
  return clean || fullName.trim();
}

// Language-aware speech text sanitizer (strips symbols, emojis, and eliminates 'dot' glitch in Indic languages)
export function sanitizeSpeechText(text: string, voiceName: string, langCode?: string): string {
  if (!text) return "";

  const cleanName = getVoiceCleanName(voiceName);
  const targetPrefix = (langCode || "").toLowerCase().split("-")[0];
  const isIndic = ["hi", "mr", "gu", "bn", "ta", "te", "kn", "ml", "pa"].includes(targetPrefix);
  const hasIndicScript = /[\u0900-\u0D7F]/.test(text);

  let cleaned = text;

  // 1. Interpolate ${name}, $(name), {name}, $name
  cleaned = cleaned
    .replace(/\$\{\s*name\s*\}/gi, cleanName)
    .replace(/\$\(\s*name\s*\)/gi, cleanName)
    .replace(/\{\s*name\s*\}/gi, cleanName)
    .replace(/\$name\b/gi, cleanName)
    .replace(/\$\{\s*voice\s*\}/gi, cleanName)
    .replace(/\$\(\s*voice\s*\)/gi, cleanName)
    .replace(/\{\s*voice\s*\}/gi, cleanName)
    .replace(/\$voice\b/gi, cleanName);

  // 2. Strip all emojis and pictographs
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ""
  );

  // 3. Strip HTML tags
  cleaned = cleaned
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, " and ")
    .replace(/&quot;/g, " ")
    .replace(/&#39;/g, " ")
    .replace(/&lt;/g, " ")
    .replace(/&gt;/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ");

  // 4. Strip zero-width and control characters
  cleaned = cleaned
    .replace(/[\u200B\uFEFF\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");

  // 5. Replace brackets with spaces
  cleaned = cleaned.replace(/[()[\]{}<>]/g, " ");

  // 6. Remove problematic symbols
  cleaned = cleaned.replace(/[@#$%^&*_+=\\~`|/\\"'“”‘’«»„•·°±§©®™✓✔✕✖★☆♥❤♦♠♣►◄▲▼]/g, " ");

  // 7. Convert repeated dashes to pause
  cleaned = cleaned
    .replace(/[-—–]{2,}/g, ", ")
    .replace(/(?<=\s)-(?=\s)/g, ", ");

  // 8. Prevent 'dot' audio glitch in Indic TTS engines
  if (isIndic || hasIndicScript) {
    cleaned = cleaned
      .replace(/[।॥!?;.]/g, ", ")
      .replace(/[:]/g, ", ")
      .replace(/,{2,}/g, ",")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s+/g, " ")
      .replace(/^[,.\s]+/, "")
      .replace(/[,.\s]+$/, "");
  } else {
    cleaned = cleaned
      .replace(/[।॥!?;]/g, ".")
      .replace(/[:]/g, ", ")
      .replace(/\.{2,}/g, ".")
      .replace(/,{2,}/g, ",")
      .replace(/,\s*\./g, ".")
      .replace(/\s+\./g, ".")
      .replace(/\s+/g, " ")
      .replace(/^[.,\s]+/, "")
      .replace(/[,.\s]+$/, "");
  }

  return cleaned.trim();
}

// ==============================================================================
// 2. DYNAMIC VOICE MATCHING (USING DATABASE FILTERS)
// ==============================================================================
export function matchSystemVoice(
  gender: string,
  langCode: string,
  noveltyVoices: string[] = [],
  femaleKeywords: string[] = [],
  maleKeywords: string[] = []
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const sysVoices = window.speechSynthesis.getVoices();
  if (!sysVoices || sysVoices.length === 0) return null;

  // Filter out novelty/robotic voices dynamically from DB list
  const naturalVoices = sysVoices.filter((v) => {
    const vName = v.name.toLowerCase();
    return !noveltyVoices.some((kw) => vName.includes(kw.toLowerCase()));
  });
  const voicesPool = naturalVoices.length > 0 ? naturalVoices : sysVoices;

  const isFemale = (gender || "female").toLowerCase() === "female";
  const prefix = (langCode || "en").toLowerCase().split("-")[0];
  const normalizedTarget = (langCode || "en").toLowerCase().replace("_", "-");

  // Indic language priority (Google हिन्दी, Lekha, etc.)
  if (["hi", "mr", "gu", "pa"].includes(prefix)) {
    const indicVoice = voicesPool.find(
      (v) =>
        v.name.toLowerCase().includes("google हिन्दी") ||
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("lekha")
    );
    if (indicVoice) return indicVoice;
  }

  if (prefix === "ta") {
    const ta = voicesPool.find((v) => v.lang.toLowerCase().startsWith("ta") || v.name.toLowerCase().includes("vani"));
    if (ta) return ta;
  }
  if (prefix === "te") {
    const te = voicesPool.find((v) => v.lang.toLowerCase().startsWith("te") || v.name.toLowerCase().includes("geeta"));
    if (te) return te;
  }
  if (prefix === "bn") {
    const bn = voicesPool.find((v) => v.lang.toLowerCase().startsWith("bn") || v.name.toLowerCase().includes("piya"));
    if (bn) return bn;
  }
  if (prefix === "kn") {
    const kn = voicesPool.find((v) => v.lang.toLowerCase().startsWith("kn") || v.name.toLowerCase().includes("soumya"));
    if (kn) return kn;
  }

  // Premier voice selection by DB Gender and keywords
  if (isFemale) {
    const femalePool = voicesPool.filter((v) => {
      const vName = v.name.toLowerCase();
      if (femaleKeywords.length > 0 && femaleKeywords.some((kw) => vName.includes(kw))) return true;
      if (maleKeywords.length > 0 && maleKeywords.some((kw) => vName.includes(kw))) return false;
      return true;
    });

    const langMatch = femalePool.find((v) => v.lang.toLowerCase().replace("_", "-") === normalizedTarget);
    if (langMatch) return langMatch;

    const prefixMatch = femalePool.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (prefixMatch) return prefixMatch;

    if (femalePool.length > 0) return femalePool[0];
  } else {
    const malePool = voicesPool.filter((v) => {
      const vName = v.name.toLowerCase();
      if (maleKeywords.length > 0 && maleKeywords.some((kw) => vName.includes(kw))) return true;
      if (femaleKeywords.length > 0 && femaleKeywords.some((kw) => vName.includes(kw))) return false;
      return true;
    });

    const langMatch = malePool.find((v) => v.lang.toLowerCase().replace("_", "-") === normalizedTarget);
    if (langMatch) return langMatch;

    const prefixMatch = malePool.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (prefixMatch) return prefixMatch;

    if (malePool.length > 0) return malePool[0];
  }

  // Fallback to exact or prefix language match
  const anyLangMatch = voicesPool.find((v) => v.lang.toLowerCase().startsWith(prefix));
  return anyLangMatch || voicesPool[0] || null;
}

// ==============================================================================
// 3. SINGLETON DATABASE-DRIVEN VOICE ENGINE
// ==============================================================================
class UniversalVoiceEngine {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private currentDetails: PlayingVoiceDetails | null = null;
  private listeners: Set<(details: PlayingVoiceDetails | null) => void> = new Set();

  // In-memory cache of DB config (updated from /api/voice-engine/resolve)
  private dbConfigCache: DbVoiceEngineConfig | null = null;

  public stop(): void {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch (e) {}
      this.activeAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    this.activeUtterance = null;
    if (typeof window !== "undefined") {
      (window as any).__activeSpeechUtterance = null;
    }

    this.currentDetails = null;
    this.notifyListeners();
  }

  public isPlaying(): boolean {
    return this.currentDetails !== null;
  }

  public getCurrentDetails(): PlayingVoiceDetails | null {
    return this.currentDetails;
  }

  public subscribe(cb: (details: PlayingVoiceDetails | null) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentDetails);
      } catch (e) {
        console.error("Error in voice engine subscriber:", e);
      }
    });
  }

  /**
   * Main Play Method:
   * Accepts voiceId or options. Resolves voice, language, tone, speed, pitch from DB!
   */
  public async play(options: PlayVoiceOptions): Promise<void> {
    this.stop();

    const lookupTarget = options.voiceId || options.voiceSlug || options.voiceName || "";

    // 1. Resolve Voice, Connected Language, Connected Tone, and Pitch/Rate from DB
    let resolvedData: any = null;
    try {
      const res = await fetch("/api/voice-engine/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: lookupTarget,
          voiceSlug: options.voiceSlug,
          voiceName: options.voiceName,
          language: options.language,
          tone: options.tone,
          gender: options.gender,
          text: options.text,
        }),
      });

      if (res.ok) {
        resolvedData = await res.json();
        if (resolvedData.config) {
          this.dbConfigCache = resolvedData.config;
        }
      }
    } catch (err) {
      console.warn("Could not reach /api/voice-engine/resolve, using local fallback:", err);
    }

    // 2. Extract DB-Resolved Voice, Tone, and Language parameters
    const dbVoice = resolvedData?.voice;
    const dbLang = resolvedData?.resolvedLanguage;
    const dbTone = resolvedData?.resolvedTone;

    const cleanName = dbVoice?.name || getVoiceCleanName(options.voiceName || lookupTarget || "Assistant");
    const voiceSlug = dbVoice?.slug || options.voiceSlug || cleanName.toLowerCase().replace(/\s+/g, "-");
    const voiceGender = dbVoice?.gender || options.gender || "female";
    const langCode = dbLang?.code || options.language || "en-US";
    const langDisplay = options.langName || (dbLang ? `${dbLang.flagEmoji || "🌐"} ${dbLang.name}` : langCode);

    const toneKey = dbTone?.key || options.tone || "professional";
    const toneDisplay = options.toneName || (dbTone ? `${dbTone.icon || "💼"} ${dbTone.name}` : toneKey);
    const audioRate = Number(dbTone?.rate || 1.0);
    const audioPitch = Number(dbTone?.pitch || 1.0);

    // 3. Spoken Text with Dynamic Transliteration
    let spokenText = resolvedData?.spokenText || options.text || "";
    if (!spokenText) {
      spokenText = `Hello, I am ${cleanName}. How may I help you today?`;
    }

    spokenText = sanitizeSpeechText(spokenText, cleanName, langCode);

    // 4. Determine Engine display name based on Voice Gender and Provider
    const isMale = (voiceGender || "").toLowerCase() === "male";
    const engineName = isMale
      ? `Neural Male${dbVoice?.provider ? ` (${dbVoice.provider})` : ""}`
      : `Neural Female${dbVoice?.provider ? ` (${dbVoice.provider})` : ""}`;

    const details: PlayingVoiceDetails = {
      slug: voiceSlug,
      voiceId: options.voiceId || dbVoice?.id,
      name: cleanName,
      langCode,
      langName: langDisplay,
      toneKey,
      toneName: toneDisplay,
      gender: voiceGender,
      engineName,
      spokenText,
    };

    // 5. Universal Server Audio Synthesis via HTML5 Audio (Supports all 24+ Indian & Global Languages)
    const speakParams = new URLSearchParams({
      slug: voiceSlug,
      lang: langCode,
      tone: toneKey,
      gender: voiceGender,
      name: cleanName,
      text: spokenText,
    });
    const serverAudioUrl = `/api/voice-engine/speak?${speakParams.toString()}&_t=${Date.now()}`;

    try {
      const audio = new Audio(serverAudioUrl);
      this.activeAudio = audio;

      audio.onplay = () => {
        this.currentDetails = details;
        this.notifyListeners();
        options.onStart?.(details);
      };

      audio.onended = () => {
        this.stop();
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn("Server speak audio error, trying base WAV fallback:", e);
        const fallbackUrl = dbVoice?.previewAudioUrl || options.previewAudioUrl || `/uploads/voices/${voiceSlug}.wav`;
        if (audio.src && !audio.src.endsWith(`${voiceSlug}.wav`)) {
          audio.src = fallbackUrl;
          audio.play().catch((fallbackErr) => {
            this.stop();
            options.onError?.(fallbackErr);
          });
        } else {
          this.stop();
          options.onError?.(e);
        }
      };

      await audio.play();
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Play was safely interrupted by another voice playback or stop
        return;
      }
      console.warn("Audio play error, attempting fallback:", err);
      const fallbackUrl = dbVoice?.previewAudioUrl || options.previewAudioUrl || `/uploads/voices/${voiceSlug}.wav`;
      const fallbackAudio = new Audio(fallbackUrl);
      this.activeAudio = fallbackAudio;
      fallbackAudio.onended = () => {
        this.stop();
        options.onEnd?.();
      };
      fallbackAudio.play().catch((fbErr) => {
        this.stop();
        options.onError?.(fbErr);
      });
    }
  }
}

export const voiceEngine = new UniversalVoiceEngine();

// ==============================================================================
// 4. REACT HOOK: useVoiceEngine()
// ==============================================================================
export function useVoiceEngine() {
  const [playingDetails, setPlayingDetails] = useState<PlayingVoiceDetails | null>(
    voiceEngine.getCurrentDetails()
  );

  useEffect(() => {
    const unsubscribe = voiceEngine.subscribe((details) => {
      setPlayingDetails(details);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const playVoice = useCallback(async (options: PlayVoiceOptions) => {
    await voiceEngine.play(options);
  }, []);

  const stopVoice = useCallback(() => {
    voiceEngine.stop();
  }, []);

  return {
    playVoice,
    stopVoice,
    isPlaying: playingDetails !== null,
    playingDetails,
    playingSlug: playingDetails?.slug || null,
    playingVoiceId: playingDetails?.voiceId || null,
    playingVoiceName: playingDetails?.name || null,
  };
}
