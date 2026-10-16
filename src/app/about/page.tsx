"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Building,
  Target,
  Sparkles,
  Award,
  Globe2,
  ShieldCheck,
  Radio,
  ArrowRight,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function AboutPage() {
  const leadership = [
    { name: "Dr. Vikram Sethi", role: "Co-Founder & Chief Scientist", bio: "Ex-Google DeepMind speech researcher. PhD in Acoustic Neural Modeling." },
    { name: "Ananya Iyer", role: "Co-Founder & CEO", bio: "Ex-McKinsey Telecom Practice. Scaled enterprise telephony across SE Asia and India." },
    { name: "Rohan Deshmukh", role: "VP of Telephony & SIP Infrastructure", bio: "Built carrier interconnects handling 50M+ minutes at Bharti Airtel." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <Radio className="h-3.5 w-3.5 text-emerald-600" />
            <span>Our Mission & Telephony Pedigree</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            Building the Conversational Neural Fabric for Enterprise Calls
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 leading-relaxed font-normal">
            We started {BRAND_CONFIG.name} with a singular belief: business voice calls should feel indistinguishable from a skilled, empathetic human representative, at 1/10th the cost.
          </p>
        </div>

        {/* Narrative & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-4xl font-black text-slate-900 font-mono">10M+</p>
            <p className="text-xs font-bold text-slate-700">Autonomous Calls Handled</p>
            <p className="text-[11px] text-slate-500">Across BFSI, Health, Logistics</p>
          </div>

          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2">
            <p className="text-4xl font-black text-emerald-800 font-mono">&lt; 350ms</p>
            <p className="text-xs font-bold text-emerald-900">End-to-End Latency</p>
            <p className="text-[11px] text-emerald-700">P99 turnaround in Indian languages</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-4xl font-black text-slate-900 font-mono">99.99%</p>
            <p className="text-xs font-bold text-slate-700">Carrier SIP Uptime</p>
            <p className="text-[11px] text-slate-500">Triple redundant data centers</p>
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Leadership & Telephony Experts</h2>
            <p className="text-xs text-slate-500">Engineers and researchers from leading speech laboratories and telecom operators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadership.map((leader) => (
              <div key={leader.name} className="p-6 rounded-3xl border border-slate-200 bg-white space-y-2 shadow-xs">
                <div className="h-10 w-10 rounded-2xl bg-[#11E97F] text-[#0A0E1A] font-black flex items-center justify-center text-sm">
                  {leader.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="font-bold text-base text-slate-900 pt-2">{leader.name}</h4>
                <p className="text-xs font-bold text-emerald-700">{leader.role}</p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
