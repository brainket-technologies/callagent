"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Activity,
  Zap,
  Globe,
  CheckCircle2,
  Play,
  Pause,
  ArrowRight,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function SpeechToTextPage() {
  const [copied, setCopied] = useState(false);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(`curl -X POST https://api.voxera.ai/v1/audio/transcriptions \\
  -H "Authorization: Bearer YOUR_VOXERA_KEY" \\
  -F file="@call_audio.wav" \\
  -F model="parrot-sonic-indic-v2" \\
  -F language="hi-IN"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benchmarks = [
    { model: "Voxera Sonic STT", latency: "140ms", wer: "4.8%", hinglishAcc: "96.4%", cost: "₹0.20/min", isOurs: true },
    { model: "OpenAI Whisper v3", latency: "780ms", wer: "8.2%", hinglishAcc: "81.2%", cost: "₹0.50/min", isOurs: false },
    { model: "Deepgram Nova-2", latency: "260ms", wer: "7.1%", hinglishAcc: "84.5%", cost: "₹0.38/min", isOurs: false },
    { model: "Google Cloud Speech", latency: "420ms", wer: "8.9%", hinglishAcc: "79.0%", cost: "₹1.20/min", isOurs: false },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 text-center px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#11E97F]/15 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <Mic className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sub-150ms Streaming Latency • 14+ Indian Dialects</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Speech-To-Text Built for <br />
            <span className="text-[#0ED071]">Vernacular Indian Telephony</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Standard Western speech models fail on Indian accent code-switching (Hinglish, Tanglish). {BRAND_CONFIG.name}&apos;s Sonic STT normalizes colloquial phrases and noisy 8kHz phone line audio in real time.
          </p>
        </div>
      </section>

      {/* Benchmark Table Section */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Independent Indian Telephony Benchmarks
              </h3>
              <p className="text-xs text-slate-500">
                Evaluated against 10,000 real conversational phone calls recorded over 8kHz G.711 AMR telecom trunks.
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800 font-mono">
              Q3 2026 Audit
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-mono font-bold">
                <tr>
                  <th className="py-3.5 px-6">Model Architecture</th>
                  <th className="py-3.5 px-4">P90 Latency</th>
                  <th className="py-3.5 px-4">Word Error Rate</th>
                  <th className="py-3.5 px-4">Hinglish Accuracy</th>
                  <th className="py-3.5 px-4">Cost / Minute</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {benchmarks.map((b) => (
                  <tr
                    key={b.model}
                    className={b.isOurs ? "bg-emerald-50/50 font-bold" : "hover:bg-slate-50"}
                  >
                    <td className="py-4 px-6 flex items-center gap-2">
                      {b.isOurs && <span className="h-2 w-2 rounded-full bg-[#11E97F]" />}
                      <span className={b.isOurs ? "text-emerald-950 font-black text-sm" : "text-slate-800"}>
                        {b.model}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono">{b.latency}</td>
                    <td className="py-4 px-4 font-mono">{b.wer}</td>
                    <td className="py-4 px-4 font-mono">{b.hinglishAcc}</td>
                    <td className="py-4 px-4 font-mono">{b.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Code Integration Box */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-20 px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Integrate with 3 Lines of Code</h2>
            <p className="text-xs text-slate-600">Drop-in replacement for OpenAI Whisper API endpoint with 5x lower latency.</p>
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-6 text-slate-100 font-mono text-xs shadow-xl">
            <button
              onClick={copyCode}
              className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-[11px] font-sans font-bold text-slate-300 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#11E97F]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy cURL"}</span>
            </button>

            <pre className="overflow-x-auto text-[#11E97F] leading-relaxed pt-2">
{`curl -X POST https://api.voxera.ai/v1/audio/transcriptions \\
  -H "Authorization: Bearer YOUR_VOXERA_KEY" \\
  -F file="@call_audio.wav" \\
  -F model="parrot-sonic-indic-v2" \\
  -F language="hi-IN"`}
            </pre>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
