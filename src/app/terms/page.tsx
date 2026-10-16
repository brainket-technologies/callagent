"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Effective Date: October 1, 2026 • Version 2.4</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-slate-600">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By signing up, accessing, or utilizing the APIs, developer dashboard, or telephony cloud services provided by {BRAND_CONFIG.companyName} (&quot;{BRAND_CONFIG.name}&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Telephony Compliance & Fair Usage</h2>
            <p>
              Users are strictly required to comply with all local and international telecommunication regulations, including Telecom Regulatory Authority of India (TRAI) guidelines, TRAI National Do Not Call (NDNC) registries, and the US Telephone Consumer Protection Act (TCPA). Unsolicited robocalls, harassment, or abusive autodialing are strictly prohibited and result in immediate account termination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Prepaid Wallet & Metered Billing</h2>
            <p>
              All telephony calls are metered on a per-second basis against your workspace wallet. Calls will terminate if your wallet balance falls below the minimum reserve threshold of ₹10.00. Recharge credits are non-refundable once consumed by telecom carrier minutes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Service Level Agreement (SLA)</h2>
            <p>
              We guarantee a monthly SIP carrier trunk uptime of 99.95% for Growth and Enterprise tiers, backed by automated multi-carrier failover between Tata Tele, Twilio, and Plivo gateways.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
