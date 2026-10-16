"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            <Lock className="h-3.5 w-3.5" />
            <span>Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">Effective Date: October 1, 2026 • Version 2.4</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-slate-600">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Zero-Data Retention (ZDR) Commitment</h2>
            <p>
              {BRAND_CONFIG.name} treats your customer audio and conversation transcripts as private customer property. Audio streams processed through our STT and LLM pipelines are never retained or used to train public foundation models without explicit customer consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
            <p>
              We collect workspace administrative metadata (account email, billing address, tax identification numbers) and anonymized telephony call detail records (call duration, carrier latency, SIP completion status) necessary to meter billing and maintain network health.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Data Residency & Encryption</h2>
            <p>
              All customer call recordings and diarized transcripts are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. Enterprise customers can designate Indian data residency (AWS Mumbai / MeitY-empanelled data centers).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Grievance Officer Contact</h2>
            <p>
              If you have inquiries regarding privacy compliance, data deletion, or subject access requests, contact our designated Grievance Officer at <strong>grievance@voxera.ai</strong>.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
