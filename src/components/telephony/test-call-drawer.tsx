"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency, formatDuration } from "@/lib/utils";
import {
  X,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  Sparkles,
  Zap,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function TestCallDrawer() {
  const {
    workspace,
    testCallDrawerOpen,
    setTestCallDrawerOpen,
    selectedAssistantForTest,
    activeCall,
    startWebCall,
    endWebCall,
    setRechargeModalOpen,
  } = useStore();

  const [calleeName, setCalleeName] = useState("Rahul Sharma");
  const [micMuted, setMicMuted] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<string>("");
  const [transcriptHistory, setTranscriptHistory] = useState<
    { speaker: "agent" | "user"; text: string; time: number }[]
  >([]);
  const [audioWaves, setAudioWaves] = useState<number[]>([30, 45, 60, 25, 75, 40, 65, 80, 50, 35, 70, 90]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Animated sound waves while call is active
  useEffect(() => {
    if (!activeCall?.inProgress) return;
    const interval = setInterval(() => {
      setAudioWaves((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 20)
      );
    }, 150);
    return () => clearInterval(interval);
  }, [activeCall?.inProgress]);

  // Dialogue progression simulation when active
  useEffect(() => {
    if (!activeCall?.inProgress || !selectedAssistantForTest) return;

    // Reset transcript at start
    const asstName = selectedAssistantForTest.name;
    const initialGreeting = selectedAssistantForTest.firstMessage.replace(
      /\{\{Callee Name\}\}/g,
      calleeName
    );

    setTranscriptHistory([
      { speaker: "agent", text: initialGreeting, time: 0 },
    ]);
    setCurrentSpeech(initialGreeting);

    // Speak initial greeting via Web Speech Synthesis if available in browser
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(initialGreeting);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    const t1 = setTimeout(() => {
      if (!activeCall?.inProgress) return;
      setTranscriptHistory((prev) => [
        ...prev,
        { speaker: "user", text: "Haan bol raha hoon. Kis bare mein call hai?", time: 4 },
      ]);
    }, 4500);

    const t2 = setTimeout(() => {
      if (!activeCall?.inProgress) return;
      const resp = `Calling regarding your verification request. Is now a good time, just two minutes?`;
      setTranscriptHistory((prev) => [
        ...prev,
        { speaker: "agent", text: resp, time: 8 },
      ]);
      setCurrentSpeech(resp);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(resp);
        window.speechSynthesis.speak(u);
      }
    }, 8500);

    const t3 = setTimeout(() => {
      if (!activeCall?.inProgress) return;
      setTranscriptHistory((prev) => [
        ...prev,
        { speaker: "user", text: "Haan theek hai, bataiye.", time: 13 },
      ]);
    }, 13000);

    const t4 = setTimeout(() => {
      if (!activeCall?.inProgress) return;
      const resp = `Great! I can get this sorted quickly so you don't have to follow up again. Should I proceed now?`;
      setTranscriptHistory((prev) => [
        ...prev,
        { speaker: "agent", text: resp, time: 16 },
      ]);
      setCurrentSpeech(resp);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(resp);
        window.speechSynthesis.speak(u);
      }
    }, 16500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeCall?.inProgress, selectedAssistantForTest]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptHistory]);

  if (!testCallDrawerOpen) return null;

  const assistant = selectedAssistantForTest;
  const isCallActive = activeCall?.inProgress || false;
  const minRequiredPaise = 1000; // ₹10.00
  const hasSufficientBalance = workspace.walletBalancePaise >= minRequiredPaise;

  const handleStartCall = () => {
    if (!assistant) return;
    const res = startWebCall(assistant, "+91 98765 43210");
    if (!res.success && res.error) {
      alert(res.error);
    }
  };

  const handleEndCall = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    endWebCall();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-neutral-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 bg-neutral-50/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-violet-500/25">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Test Assistant: {assistant?.name || "Voice Bot"}
            </h3>
            <p className="text-xs text-neutral-500">Live WebCall Telephony Simulator</p>
          </div>
        </div>
        <button
          onClick={() => {
            handleEndCall();
            setTestCallDrawerOpen(false);
          }}
          className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Wallet Balance Status Banner */}
      <div className="flex items-center justify-between bg-slate-50 px-5 py-2.5 text-xs text-slate-700 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Balance: <strong className="text-emerald-700 font-bold">{formatCurrency(workspace.walletBalancePaise)}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Rate: {BRAND_CONFIG.currencySymbol}{(BRAND_CONFIG.ratePerMinutePaise / 100).toFixed(2)}/min</span>
          <button
            onClick={() => setRechargeModalOpen(true)}
            className="rounded-lg bg-[#11E97F] hover:bg-[#0ED071] px-2.5 py-1 text-[11px] font-extrabold text-[#0A0E1A] transition shadow-xs cursor-pointer"
          >
            + Recharge
          </button>
        </div>
      </div>

      {!hasSufficientBalance && !isCallActive && (
        <div className="m-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Low Wallet Balance Warning</p>
            <p className="mt-0.5 text-amber-700">
              You need at least ₹10.00 in your wallet to place or test calls. Please recharge your prepaid credits.
            </p>
          </div>
        </div>
      )}

      {/* Call Stage Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {!isCallActive ? (
          /* Pre-call setup */
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 space-y-3">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Simulated Callee Info
              </label>
              <div>
                <label className="text-xs text-neutral-500">Callee Name</label>
                <input
                  type="text"
                  value={calleeName}
                  onChange={(e) => setCalleeName(e.target.value)}
                  placeholder="Enter callee name"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
                />
              </div>
              <div className="text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">Selected Voice: </span>
                {assistant?.voiceName || "Cartesia Sonic (Indian)"}
              </div>
              <div className="text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">Language: </span>
                {assistant?.language || "English (IN)"}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4 bg-white text-xs text-neutral-600 space-y-2">
              <div className="flex items-center gap-2 font-medium text-neutral-900">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Simulated In-Browser WebRTC Call</span>
              </div>
              <p>
                Testing simulates the full duplex speech pipeline: Browser Mic ➔ STT ➔ LLM Reasoning ➔ TTS Speech Synthesis.
              </p>
              <p className="text-neutral-400">
                Credits are metered per-second based on conversation length (₹10.00/min).
              </p>
            </div>
          </div>
        ) : (
          /* Active Call Screen */
          <div className="space-y-4 animate-in fade-in">
            {/* Live Call Stats Header */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11E97F]/20 text-[#11E97F] animate-pulse">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Connected</p>
                  <p className="text-lg font-mono font-bold text-white">
                    {formatDuration(activeCall?.durationSec || 0)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Live Cost</p>
                <p className="text-lg font-mono font-bold text-[#11E97F]">
                  {formatCurrency(activeCall?.costPaise || 0)}
                </p>
              </div>
            </div>

            {/* Audio Waveform Visualizer */}
            <div className="flex h-20 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
              {audioWaves.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1.5 rounded-full bg-[#11E97F] transition-all duration-150"
                />
              ))}
            </div>

            {/* Live Diarized Transcript Stream */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-3 max-h-[320px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <span>Real-Time Transcript</span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#11E97F] animate-ping" />
                  Live
                </span>
              </div>

              {transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col text-xs ${
                    item.speaker === "agent" ? "items-start" : "items-end"
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 mb-0.5">
                    {item.speaker === "agent" ? assistant?.name : "User"} • {formatDuration(item.time)}
                  </span>
                  <div
                    className={`rounded-xl px-3 py-2 max-w-[85%] leading-relaxed ${
                      item.speaker === "agent"
                        ? "bg-white border border-slate-200 text-slate-900 shadow-xs"
                        : "bg-slate-900 text-white shadow-xs"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Call Action Controls */}
      <div className="border-t border-neutral-200 bg-white p-4">
        {!isCallActive ? (
          <Button
            onClick={handleStartCall}
            disabled={!hasSufficientBalance}
            className="w-full h-11 bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold flex items-center justify-center gap-2 rounded-xl shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Phone className="h-4 w-4 fill-current" />
            Start Test Call
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMicMuted(!micMuted)}
              className="h-11 w-12 rounded-xl border-neutral-300"
            >
              {micMuted ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              type="button"
              onClick={handleEndCall}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-red-600/20"
            >
              <PhoneOff className="h-4 w-4" />
              End Call ({formatDuration(activeCall?.durationSec || 0)})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
