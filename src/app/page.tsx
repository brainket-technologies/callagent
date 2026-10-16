"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Phone,
  Volume2,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Sliders,
  Play,
  Pause,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Layers,
  Activity,
  PhoneCall,
  CreditCard,
  Building,
  Headphones,
  Radio,
  Cpu,
  Server,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store-context";
import { formatCurrency, cn } from "@/lib/utils";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { voiceEngine } from "@/lib/voice-engine";

export default function LandingPage() {
  const { setTestCallDrawerOpen, setSelectedAssistantForTest, assistants } = useStore();

  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);

  // Interactive ROI Calculator State
  const [dailyCalls, setDailyCalls] = useState(2500);
  const [callDurationMins, setCallDurationMins] = useState(2);

  // Calculations:
  // Human BPO agent averages 100 calls/day, cost ₹25,000/month per seat
  const humanAgentsNeeded = Math.ceil(dailyCalls / 100);
  const humanCostMonthly = humanAgentsNeeded * 25000;

  // AI cost: ₹7/min blended wholesale rate
  const totalMinutesMonthly = dailyCalls * callDurationMins * 30;
  const aiCostMonthly = Math.round(totalMinutesMonthly * 7);
  const savingsMonthly = Math.max(0, humanCostMonthly - aiCostMonthly);
  const savingsPercent = Math.round((savingsMonthly / humanCostMonthly) * 100);

  const sampleVoices = [
    { id: "riya", name: "Riya (Sonic Indic)", provider: "Cartesia", lang: "Hindi / Hinglish", desc: "Warm, empathetic customer success & relationship manager" },
    { id: "priya", name: "Priya (Turbo v2.5)", provider: "ElevenLabs", lang: "Indian English", desc: "Crisp, authoritative corporate banking specialist" },
    { id: "rahul", name: "Rahul (Sonic 3.5)", provider: "Cartesia", lang: "Hindi / English", desc: "Consultative debt collection & reminder executive" },
    { id: "bulbul", name: "Bulbul Indic", provider: "Sarvam", lang: "Tamil / Regional", desc: "Ultra-fluent vernacular Indian regional dialer" },
  ];

  const handlePlayVoice = (voiceId: string) => {
    if (activeVoicePlaying === voiceId) {
      voiceEngine.stop();
      setActiveVoicePlaying(null);
      return;
    }

    setActiveVoicePlaying(voiceId);
    const phrases: Record<string, { text: string; lang: string; gender: string }> = {
      riya: {
        text: `नमस्ते, मैं ${BRAND_CONFIG.name} से बात कर रही हूँ, क्या कल दोपहर 2 बजे आपका आर्डर डिलीवरी ठीक रहेगा?`,
        lang: "hi-IN",
        gender: "female",
      },
      priya: {
        text: `Good afternoon! I am calling from Axis Credit powered by ${BRAND_CONFIG.name}. Can we verify your application now?`,
        lang: "en-IN",
        gender: "female",
      },
      rahul: {
        text: `नमस्ते सर, आपका ईएमआई पेमेंट पेंडिंग है, क्या मैं व्हाट्सएप्प पर इंस्टेंट पेमेंट लिंक भेज दूँ?`,
        lang: "hi-IN",
        gender: "male",
      },
      bulbul: {
        text: "வணக்கம்! உங்கள் டெலிவரி முகவரியை உறுதிப்படுத்துவதற்காக இந்த அழைப்பு.",
        lang: "ta-IN",
        gender: "female",
      },
    };

    const config = phrases[voiceId] || {
      text: `Hello, this is ${BRAND_CONFIG.name} voice intelligence.`,
      lang: "en-US",
      gender: "female",
    };

    voiceEngine.play({
      text: config.text,
      language: config.lang,
      gender: config.gender,
      voiceName: voiceId,
      tone: "friendly",
      onEnd: () => setActiveVoicePlaying(null),
      onError: () => setActiveVoicePlaying(null),
    });
  };

  const handleLaunchLiveDemo = () => {
    if (assistants.length > 0) {
      setSelectedAssistantForTest(assistants[0]);
    }
    setTestCallDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A] antialiased">
      {/* Top Marketing Navigation Header with Ringg.ai Menu Dropdowns */}
      <MarketingHeader />

      {/* HERO SECTION — Inspired by HackerRank "The future of development is human + AI" */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-white">
        {/* Soft emerald radial glow on white canvas */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#11E97F]/15 via-emerald-100/30 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-[#11E97F]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-32 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 text-center space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-emerald-300 animate-pulse" />
            <span>Sub-350ms Conversational Latency • 100k Concurrent SIP Capacity</span>
          </div>

          {/* HackerRank-style Main Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.08]">
            The future of <br />
            customer calls is <br />
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-emerald-100 text-emerald-800 ring-4 ring-[#11E97F]/30 shadow-inner">
                <Radio className="h-6 w-6 md:h-8 md:w-8 text-emerald-800" />
              </span>
              <span className="text-slate-900">human</span>
              <span className="text-slate-400 font-light">+</span>
              <span className="text-[#0ED071] drop-shadow-xs font-black">AI</span>
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed font-normal">
            We help you deploy hyper-realistic Indian-accented AI voice agents that resolve delivery verification, collect overdue payments, and handle enterprise support with zero robotic lag.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchLiveDemo}
              className="w-full sm:w-auto h-12 rounded-xl px-8 text-sm font-extrabold text-[#0A0E1A] bg-[#11E97F] hover:bg-[#0ED071] shadow-md hover:shadow-lg hover:shadow-[#11E97F]/30 flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <Phone className="h-4 w-4 fill-current animate-bounce" />
              <span>Test Live Agent in Browser</span>
            </button>

            <Link
              href="/dashboard/assistants"
              className="w-full sm:w-auto h-12 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-8 text-sm font-bold text-slate-800 shadow-2xs flex items-center justify-center gap-2 transition"
            >
              <span>Explore Studio Canvas</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </div>

          {/* Hero Feature Badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Cartesia Sonic & ElevenLabs Turbo
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tata Tele, Twilio & Plivo SIP Gateways
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Real-time Metered Wallet Auto-Deductions
            </span>
          </div>
        </div>
      </section>

      {/* Brand Logos Strip (Like Ringg.ai: Best brands win with Voxera AI) */}
      <section className="border-t border-slate-200/80 bg-slate-50/50 py-10 px-6">
        <div className="mx-auto max-w-7xl text-center space-y-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Best enterprise brands scale with {BRAND_CONFIG.name}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 font-black text-slate-800 text-sm md:text-base">
            <span className="hover:text-emerald-700 transition cursor-default">PolicyBazaar</span>
            <span className="hover:text-emerald-700 transition cursor-default">Practo</span>
            <span className="hover:text-emerald-700 transition cursor-default">PharmEasy</span>
            <span className="hover:text-emerald-700 transition cursor-default">smallcase</span>
            <span className="hover:text-emerald-700 transition cursor-default">Ekart</span>
            <span className="hover:text-emerald-700 transition cursor-default">CRED</span>
            <span className="hover:text-emerald-700 transition cursor-default">Groww</span>
          </div>
        </div>
      </section>

      {/* SECTION: VOICE AUDIO SHOWCASE (Light Mode) */}
      <section id="voices" className="py-20 border-t border-slate-200/80 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider font-mono">
              Phonetic Voice Fidelity
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Studio-Grade Vernacular Voices
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Natural breathing pauses, conversational fillers, and flawless Indian accent phonetics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleVoices.map((voice) => {
              const isPlaying = activeVoicePlaying === voice.id;
              return (
                <div
                  key={voice.id}
                  className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 bg-white ${
                    isPlaying
                      ? "border-[#11E97F] shadow-lg shadow-emerald-500/15 ring-2 ring-[#11E97F]"
                      : "border-slate-200 hover:border-emerald-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        {voice.provider}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 font-mono">
                        {voice.lang}
                      </span>
                    </div>

                    <h4 className="mt-4 text-base font-bold text-slate-900">{voice.name}</h4>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{voice.desc}</p>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handlePlayVoice(voice.id)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition cursor-pointer",
                        isPlaying
                          ? "bg-[#11E97F] text-[#0A0E1A] shadow-md shadow-[#11E97F]/30"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200"
                      )}
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                      <span>{isPlaying ? "Playing Audio Sample..." : "Listen Voice Sample"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: ARCHITECTURE SHOWCASE (Light Mode) */}
      <section id="features" className="py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider font-mono">
              Deterministic Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why {BRAND_CONFIG.name} Outperforms Legacy Call Centers
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Engineered with deterministic state machines and phonetic speech normalization to ensure 99.9% reliable call outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 space-y-4 hover:border-emerald-400 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Subroutine Decision Trees</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic subroutines handle busy call rescheduling, polite exits, and warm transfers to human agents seamlessly without LLM hallucinations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 space-y-4 hover:border-emerald-400 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Anti-Robotic Speech Blacklist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict negative constraints filter out robotic cliches like &quot;Certainly&quot; or &quot;I understand&quot;. Agents speak in natural, short conversational turns.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 space-y-4 hover:border-emerald-400 hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">TTS Phonetic Dictionary</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic SSML text pre-processing formats ₹5,000 as &quot;five thousand rupees&quot;, dates as &quot;twenty-five January&quot;, and phone numbers with natural breathing pauses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: INTERACTIVE ROI & SAVINGS CALCULATOR (Light Mode) */}
      <section id="calculator" className="py-20 border-t border-slate-200/80 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider font-mono">
              Enterprise Unit Economics
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Calculate Your Monthly Cost Reduction
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Compare traditional human BPO call center overhead against automated {BRAND_CONFIG.name} voice intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders on Left */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-2xs">
              <div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-700">Outbound Calls Per Day</span>
                  <span className="text-emerald-700 font-mono text-base font-extrabold">{dailyCalls.toLocaleString()} calls</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={25000}
                  step={100}
                  value={dailyCalls}
                  onChange={(e) => setDailyCalls(Number(e.target.value))}
                  className="mt-3 w-full accent-[#11E97F] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-700">Average Call Duration</span>
                  <span className="text-emerald-700 font-mono text-base font-extrabold">{callDurationMins} minutes</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={callDurationMins}
                  onChange={(e) => setCallDurationMins(Number(e.target.value))}
                  className="mt-3 w-full accent-[#11E97F] cursor-pointer"
                />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
                <p>• Human BPO baseline: 1 agent = 100 calls/day @ ₹25,000/mo CTC per seat.</p>
                <p>• {BRAND_CONFIG.name}: Dedicated 24/7 concurrent channels @ ₹7/min blended wholesale rate.</p>
              </div>
            </div>

            {/* Savings Result Card on Right */}
            <div className="lg:col-span-5 rounded-2xl border-2 border-[#11E97F] bg-white p-8 space-y-6 text-center shadow-lg shadow-emerald-500/10">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                  Estimated Monthly Savings
                </p>
                <p className="text-4xl sm:text-5xl font-black text-slate-900 mt-2 font-mono">
                  {formatCurrency(savingsMonthly * 100)}
                </p>
                <p className="text-sm font-extrabold text-emerald-600 mt-1">
                  Save ~{savingsPercent}% on telephony & staff costs
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Traditional BPO Cost:</span>
                  <span className="font-semibold text-slate-400 line-through">₹{humanCostMonthly.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{BRAND_CONFIG.name} Cost:</span>
                  <span className="text-emerald-700 font-bold">₹{aiCostMonthly.toLocaleString()}/mo</span>
                </div>
              </div>

              <Link
                href="/dashboard/assistants"
                className="w-full inline-flex items-center justify-center rounded-xl text-[#0A0E1A] font-extrabold h-12 text-xs bg-[#11E97F] hover:bg-[#0ED071] transition shadow-md hover:shadow-lg hover:shadow-[#11E97F]/30 active:scale-95"
              >
                Start Saving Today ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Enterprise Marketing Footer with Ringg.ai columns */}
      <MarketingFooter />
    </div>
  );
}
