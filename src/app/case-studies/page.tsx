"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Stethoscope,
  Pill,
  Building2,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Users,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function CaseStudiesIndexPage() {
  const caseStudies = [
    {
      company: "PolicyBazaar",
      slug: "policybazaar",
      logoBadge: "PB Insurance",
      industry: "Fintech & Insurance",
      headline: "How PolicyBazaar boosted lead qualification by 38% and reduced RM burnout",
      desc: "Instant AI voice outreach to visitors abandoning insurance comparison forms within 30 seconds of drop-off.",
      metrics: [
        { label: "Lead Conversion Lift", value: "+38%" },
        { label: "Connect Latency", value: "< 280ms" },
        { label: "Daily Call Volume", value: "85,000" },
      ],
      quote: "Our RMs were spending half their day on tire-kickers. Now, by the time a lead lands on their desk, Voxera has already completed the first qualification.",
      author: "Manoj Pandey",
      role: "DVP (AI Initiatives & Health)",
    },
    {
      company: "Practo",
      slug: "practo",
      logoBadge: "Practo Health",
      industry: "Healthcare & Telemedicine",
      headline: "Scaling clinic appointment confirmations from a pilot to 1,000+ bookings daily",
      desc: "Multilingual doctor appointment confirmation, rescheduling, and clinic location guidance in Hindi, English, and Tamil.",
      metrics: [
        { label: "Daily Appointments", value: "~1,000" },
        { label: "No-Show Reduction", value: "41%" },
        { label: "Resolution Rate", value: "92%" },
      ],
      quote: "Voxera worked closely with our clinical team. We went from a simple 50-call pilot to automating our entire pan-India OPD confirmation funnel.",
      author: "Nirbhay Jnanendra",
      role: "Lead Product Manager",
    },
    {
      company: "PharmEasy",
      slug: "pharmeasy",
      logoBadge: "PharmEasy",
      industry: "E-Pharmacy & Diagnostics",
      headline: "Automating prescription verification and cart abandonment re-engagement",
      desc: "Seamless voice calls paired with instant WhatsApp payment links for chronic medicine refills.",
      metrics: [
        { label: "Cart Recovery", value: "+29%" },
        { label: "First-Call Resolution", value: "72%" },
        { label: "Cost Per Order", value: "-64%" },
      ],
      quote: "Re-engaging users at the right moment with immediate WhatsApp follow-ups created our highest converting channel this quarter.",
      author: "Soniya Lal",
      role: "Associate Director (Product)",
    },
    {
      company: "Smallcase",
      slug: "smallcase",
      logoBadge: "smallcase",
      industry: "Wealth Management",
      headline: "Guiding first-time investors through KYC drop-offs and portfolio advisory",
      desc: "Authoritative, empathetic voice calls explaining regulatory paperwork and assisting user onboarding.",
      metrics: [
        { label: "KYC Completion Rate", value: "+33%" },
        { label: "BPO Cost Savings", value: "70%" },
        { label: "Customer CSAT", value: "4.8/5" },
      ],
      quote: "Whether it was users dropping off during Aadhaar e-sign or exploring US equities, the AI provided accurate context every single time.",
      author: "Vipul Rawal",
      role: "VP (Product)",
    },
    {
      company: "Ekart Logistics",
      slug: "ekart",
      logoBadge: "Ekart Supply",
      industry: "Logistics & Supply Chain",
      headline: "Cutting RTO (Return to Origin) rates by 22% via real-time address validation",
      desc: "Autonomous outbound calls before final dispatch to confirm customer availability and landmark directions.",
      metrics: [
        { label: "RTO Reduction", value: "22%" },
        { label: "Failed Delivery Save", value: "₹4.8 Cr" },
        { label: "Address Precision", value: "98.4%" },
      ],
      quote: "Failed delivery attempts bleed margins. Voxera validates landmark nuances and rescheduling times before our vans even leave the hub.",
      author: "Arjun Venkat",
      role: "Director of Last-Mile Operations",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 text-center px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#11E97F]/15 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Proven Enterprise ROI • 10M+ Real Calls Analyzed</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Customer Success Stories. <br />
            <span className="text-[#0ED071]">Real Calls. Proven Lift.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            See how top Indian and global enterprises replace expensive, slow call center operations with deterministic voice intelligence.
          </p>
        </div>
      </section>

      {/* Case Studies List */}
      <section className="mx-auto max-w-7xl px-6 pb-28 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseStudies.map((cs) => (
            <div
              key={cs.slug}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:border-[#11E97F] hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-800 font-mono">
                    {cs.logoBadge}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {cs.industry}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                  {cs.headline}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{cs.desc}</p>

                {/* Metrics Highlight */}
                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
                  {cs.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-lg font-black text-slate-900 font-mono">{m.value}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Testimonial Quote */}
                <div className="mt-6 rounded-2xl border-l-4 border-[#11E97F] bg-slate-50/60 p-4">
                  <p className="text-xs italic text-slate-700 leading-relaxed">&quot;{cs.quote}&quot;</p>
                  <p className="mt-2 text-[11px] font-bold text-slate-900">
                    {cs.author} • <span className="text-slate-500 font-normal">{cs.role}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href={`/case-studies/${cs.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition"
                >
                  <span>Read full case study</span>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
