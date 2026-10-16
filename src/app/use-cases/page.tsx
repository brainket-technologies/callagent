"use client";

import React from "react";
import Link from "next/link";
import {
  PhoneIncoming,
  PhoneOutgoing,
  CreditCard,
  CalendarCheck,
  ClipboardList,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function UseCasesPage() {
  const useCases = [
    {
      title: "Inbound 24/7 Customer Support",
      icon: PhoneIncoming,
      tag: "Zero Hold Time",
      desc: "Resolve tier-1 support inquiries instantly. AI agents answer policy questions, check order tracking, and issue refund requests without human hold queues.",
      capabilities: [
        "Sub-300ms speech turnaround",
        "CRM & ticketing bi-directional sync (Zendesk, Freshdesk)",
        "Zero-drop warm transfers to live human agents",
        "Multilingual automatic dialect switching",
      ],
      metric: "84% resolution without human intervention",
    },
    {
      title: "Outbound Lead Qualification & Nurturing",
      icon: PhoneOutgoing,
      tag: "Speed-to-Lead",
      desc: "Connect with web inbound leads within 30 seconds of form fill. The agent asks qualifying questions, screens budget intent, and books meetings for account executives.",
      capabilities: [
        "Sub-15s webhook-triggered dialing",
        "Calendar synchronization (Google, Outlook, Cal.com)",
        "Automated WhatsApp recap message with meeting link",
        "Objection handling decision trees",
      ],
      metric: "+38% conversion lift vs 45-min delay",
    },
    {
      title: "Courteous Debt & EMI Collection",
      icon: CreditCard,
      tag: "Compliant Recovery",
      desc: "Empathetic, non-threatening payment reminder calls with instant payment link dispatch on SMS and WhatsApp while the borrower is still on the line.",
      capabilities: [
        "RBI & regulatory compliance guaranteed",
        "Dynamic settlement discount negotiation rules",
        "Instant Razorpay / UPI payment links via WhatsApp",
        "Polite dispute and broken PTP (Promise-to-Pay) tracking",
      ],
      metric: "40% increase in promise-to-pay adherence",
    },
    {
      title: "Appointment Booking & Rescheduling",
      icon: CalendarCheck,
      tag: "No-Show Elimination",
      desc: "Automated phone reminders for clinic consultations, vehicle servicing, and property site visits with interactive reschedule options.",
      capabilities: [
        "Two-way calendar availability check",
        "Natural time negotiation in Hinglish & regional languages",
        "Clinic/office location Google Maps link delivery",
        "Rider and doctor notification webhooks",
      ],
      metric: "41% reduction in empty missed slots",
    },
    {
      title: "Post-Interaction CSAT & Feedback Surveys",
      icon: ClipboardList,
      tag: "High Response Rate",
      desc: "Replace ignored email survey forms with a brief 45-second conversational voice call capturing qualitative NPS feedback and emotional sentiment.",
      capabilities: [
        "Real-time voice emotion & sentiment scoring",
        "Natural open-ended feedback transcription",
        "Immediate alert trigger for detractors (NPS < 6)",
        "Automated summary aggregation for leadership",
      ],
      metric: "6.5x higher completion rate vs email surveys",
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
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span>High-Impact Telephony Workflows • Inbound & Outbound</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Autonomous Voice AI For <br />
            <span className="text-[#0ED071]">Every Customer Touchpoint</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Whether qualifying inbound leads, collecting past-due invoices, or confirming deliveries, {BRAND_CONFIG.name} executes deterministic calls flawlessly.
          </p>
        </div>
      </section>

      {/* Use Cases Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-28 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs hover:border-[#11E97F] hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {uc.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-black text-slate-900">{uc.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{uc.desc}</p>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                      Key Capabilities
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {uc.capabilities.map((c) => (
                        <li key={c} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {uc.metric}
                  </span>
                  <Link
                    href="/dashboard/assistants"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-emerald-700 transition"
                  >
                    <span>Test Workflow</span>
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
