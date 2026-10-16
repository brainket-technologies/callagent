"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  ShieldCheck,
  HelpCircle,
  Phone,
  Sparkles,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [estimatedMins, setEstimatedMins] = useState(5000);

  const estimatedCost = Math.round(estimatedMins * 10); // ₹10/min
  const humanCost = Math.round((estimatedMins / 3000) * 25000); // 1 agent = ~3000 mins/mo @ ₹25,000

  const plans = [
    {
      name: "Developer Starter",
      tagline: "Ideal for testing, hackathons, and small pilots",
      price: "₹0",
      period: "No monthly commitment",
      rateText: "₹10.00 / minute (Pay as you go)",
      popular: false,
      ctaText: "Start Free with ₹500 Credits",
      ctaHref: "/dashboard/assistants",
      features: [
        "100% per-second metered wallet billing",
        "Up to 10 concurrent active calls",
        "Cartesia & ElevenLabs voice models",
        "Standard latency (~450ms)",
        "Email support (48h SLA)",
        "REST API & Webhook access",
      ],
    },
    {
      name: "Scale & Growth",
      tagline: "For high-volume fintech, healthcare, and e-commerce brands",
      price: billingCycle === "monthly" ? "₹14,999" : "₹11,999",
      period: "/ month + calling credits",
      rateText: "₹7.50 / minute (Wholesale discounted rate)",
      popular: true,
      ctaText: "Start 14-Day Free Trial",
      ctaHref: "/dashboard/assistants",
      features: [
        "Everything in Developer Starter",
        "Up to 250 concurrent SIP channels",
        "Sub-300ms ultra-low latency cluster",
        "Bring Your Own SIP Trunk (Tata, Twilio, Plivo)",
        "Real-time CRM integrations (Salesforce, HubSpot)",
        "Custom SSML phonetic dictionary",
        "Dedicated Slack channel & 4h SLA",
      ],
    },
    {
      name: "Enterprise Dedicated",
      tagline: "Dedicated cloud tenant, private LLMs, and custom carrier routing",
      price: "Custom",
      period: "Annual contract with SLA guarantees",
      rateText: "Volume wholesale down to ₹4.50 / min",
      popular: false,
      ctaText: "Talk to Telephony Architects",
      ctaHref: "/book-a-demo",
      features: [
        "Unlimited concurrent channels (100k+ SIP)",
        "On-premise / Private VPC deployment",
        "Custom fine-tuned vernacular STT/TTS",
        "Zero-data retention (HIPAA & SOC 2 compliant)",
        "Dedicated Enterprise Account Director",
        "99.99% carrier uptime SLA with failover",
        "Custom ERP & Core Banking API bridges",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 text-center px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#11E97F]/15 to-transparent blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span>Transparent Telecom Metering • Zero Hidden Platform Fees</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Predictable Voice AI Pricing. <br />
            <span className="text-[#0ED071]">Pay Only For Talk Time.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            No surprise overages or per-seat penalties. Every second is metered from your prepaid balance with wholesale carrier pass-through rates.
          </p>

          {/* Billing Toggle */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-[#11E97F] px-1.5 py-0.2 text-[9px] font-black text-[#0A0E1A]">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all ${
                plan.popular
                  ? "border-[#11E97F] bg-white shadow-xl shadow-emerald-500/10 ring-2 ring-[#11E97F]"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#11E97F] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0A0E1A] shadow-xs">
                  Most Popular for Enterprises
                </div>
              )}

              <div>
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{plan.tagline}</p>

                <div className="mt-6 border-b border-slate-100 pb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  <div className="mt-2 inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {plan.rateText}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Plan Capabilities
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href={plan.ctaHref}
                  className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs ${
                    plan.popular
                      ? "bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] shadow-md hover:shadow-lg hover:shadow-[#11E97F]/30"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Volume Estimator Slider */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-20 px-6">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">
              Interactive Monthly Telecom Estimator
            </h2>
            <p className="text-sm text-slate-600">
              Drag the slider to calculate your estimated monthly bill compared to traditional human call centers.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700">Estimated Monthly Voice Minutes</span>
                <span className="font-mono text-xl text-emerald-700 font-black">
                  {estimatedMins.toLocaleString()} mins
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={50000}
                step={500}
                value={estimatedMins}
                onChange={(e) => setEstimatedMins(Number(e.target.value))}
                className="w-full accent-[#11E97F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>500 mins</span>
                <span>25,000 mins</span>
                <span>50,000+ mins</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Traditional Human BPO</p>
                <p className="mt-1 text-2xl font-black text-slate-400 line-through">
                  ₹{humanCost.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Salary + overhead</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-800 font-bold">{BRAND_CONFIG.name} AI Cloud</p>
                <p className="mt-1 text-2xl font-black text-emerald-700 font-mono">
                  ₹{estimatedCost.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">100% per-second metered</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#11E97F]/15 border border-[#11E97F] text-slate-900">
                <p className="text-xs font-bold text-emerald-900">Estimated Monthly Savings</p>
                <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
                  ₹{Math.max(0, humanCost - estimatedCost).toLocaleString()}
                </p>
                <p className="text-[11px] font-bold text-emerald-700 mt-1">
                  ~{Math.round(((humanCost - estimatedCost) / humanCost) * 100)}% margin savings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">Everything you need to know about wallet credits and carrier billing.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <h4 className="font-bold text-sm text-slate-900">Do wallet credits expire?</h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              No. Prepaid wallet credits never expire. You can recharge any balance and use it over months without penalty.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <h4 className="font-bold text-sm text-slate-900">Can I bring my own SIP trunk (BYOT)?</h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Yes! Scale and Enterprise plans support BYOT with Tata Tele, Twilio, Plivo, Exotel, and Asterisk gateways with zero extra surcharge.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <h4 className="font-bold text-sm text-slate-900">How is telephony latency kept under 350ms?</h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              We operate co-located edge clusters in Mumbai, Bangalore, and Frankfurt with direct SIP peering into Indian telecom carriers.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
