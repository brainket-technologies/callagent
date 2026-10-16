"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  ShoppingBag,
  Truck,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function IndustriesPage() {
  const industries = [
    {
      title: "Fintech, Banking & NBFCs",
      icon: Building2,
      tag: "BFSI Compliant",
      desc: "Deterministic voice agents that handle pre-approved loan outreach, KYC completion assistance, and courteous debt collection reminders.",
      stats: ["40% Higher Recovery", "Zero Compliance Infractions", "Instant Bank API Sync"],
      useCases: ["EMI Payment Reminders", "Drop-off KYC Verification", "Credit Card Activation", "Fraud Alert Verification"],
    },
    {
      title: "Healthcare & Telemedicine",
      icon: Stethoscope,
      tag: "HIPAA Compliant",
      desc: "Multilingual patient communication for clinic confirmations, prescription refill reminders, and diagnostic lab test scheduling.",
      stats: ["41% Less No-Shows", "20+ Regional Dialects", "EMR/EHR Integrated"],
      useCases: ["OPD Appointment Booking", "Post-op Followup Check-in", "Diagnostic Report Dispatch", "Vaccination Reminders"],
    },
    {
      title: "E-Commerce & D2C Brands",
      icon: ShoppingBag,
      tag: "High Conversion",
      desc: "Turn abandoned carts into revenue and verify Cash-on-Delivery (COD) orders before warehouse dispatch to minimize RTO costs.",
      stats: ["29% Cart Recovery", "Sub-15s Response Time", "WhatsApp Combo Outbound"],
      useCases: ["COD Address Confirmation", "Abandoned Cart Recovery", "Product Recommendation", "Customer Review Surveys"],
    },
    {
      title: "Logistics, Supply Chain & Quick-Commerce",
      icon: Truck,
      tag: "Fleet Optimization",
      desc: "Automated delivery rescheduling, landmark direction clarification, and instant dispatch notifications that cut logistics waste.",
      stats: ["22% RTO Reduction", "₹4.8 Cr Saved Annually", "Real-time WMS Integration"],
      useCases: ["Delivery Reschedule Calling", "Landmark Voice Clarification", "Return Order Pickup Verification", "Rider Coordination"],
    },
    {
      title: "EdTech & Education",
      icon: GraduationCap,
      tag: "Lead Qualification",
      desc: "Qualify prospective students for courses, schedule 1-on-1 counselor meetings, and follow up on demo class attendance.",
      stats: ["3.4x Faster Contact", "55% Trial Attendance", "Affordable Lead Costs"],
      useCases: ["Demo Class Scheduling", "Fee Installment Reminders", "Course Counseling Intake", "Student Feedback Calls"],
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
            <span>Vertical AI Engines • Tailored for Indian & Global Scale</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Voice AI Built for Your <br />
            <span className="text-[#0ED071]">Industry&apos;s Specific Needs</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Every sector has unique vocabulary, compliance boundaries, and conversation flows. {BRAND_CONFIG.name} provides pre-trained models tuned for your business.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-28 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.title}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:border-[#11E97F] hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {ind.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-black text-slate-900">{ind.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{ind.desc}</p>

                  <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Key Outcomes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ind.stats.map((s) => (
                        <span key={s} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Common Workflows
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {ind.useCases.map((u) => (
                        <li key={u} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href="/book-a-demo"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <span>Deploy for this industry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
