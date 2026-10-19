"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Coins,
  CreditCard,
  Calculator,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Mic,
  Disc,
  Hash,
  ArrowUpRight,
  Sparkles,
  Zap,
  Info,
  RefreshCw,
  Sliders,
  DollarSign,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceItem {
  id: string;
  slug: string;
  serviceName: string;
  category: string;
  customerRate: string;
  ratePaise: number;
  billingUnit: string;
  currency: string;
  isConfigurable: boolean;
  icon: string;
  description: string;
  isEnabled: boolean;
}

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  isDefault: boolean;
}

export default function UserServicesPricingPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("INR");
  const [loading, setLoading] = useState(true);

  // Calculator states
  const [calcMinutes, setCalcMinutes] = useState(1500); // AI calling minutes
  const [calcSms, setCalcSms] = useState(500); // SMS count
  const [calcNumbers, setCalcNumbers] = useState(2); // Virtual numbers count

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setServices((data.services || []).filter((s: ServiceItem) => s.isEnabled));
        if (data.currencies) {
          setCurrencies(data.currencies);
          if (data.defaultCurrency) {
            setSelectedCurrencyCode(data.defaultCurrency.code);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const defaultCurrency =
    currencies.find((c) => c.isDefault) || currencies[0] || {
      code: "INR",
      symbol: "₹",
      exchangeRate: "1.00",
    };

  const activeCurrency =
    currencies.find((c) => c.code === selectedCurrencyCode) || defaultCurrency;

  const defaultRate = parseFloat(defaultCurrency.exchangeRate || "1.00") || 1.0;
  const activeRate = parseFloat(activeCurrency.exchangeRate || "1.00") || 1.0;
  const exchangeMultiplier = activeRate / defaultRate;

  const parseNumericRate = (raw: string | number | undefined): number => {
    if (typeof raw === "number") return raw;
    if (!raw) return 0;
    const match = String(raw).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const convertRate = (baseRateStr: string) => {
    const base = parseNumericRate(baseRateStr);
    const converted = base * exchangeMultiplier;
    if (converted >= 100) return converted.toFixed(2);
    if (converted >= 1) return converted.toFixed(2);
    if (converted >= 0.01) return converted.toFixed(3);
    return converted.toFixed(4);
  };

  // Cost calculation (Service customer rates are denominated in defaultCurrency)
  const aiCallRate = parseNumericRate(services.find((s) => s.slug === "ai-voice-call")?.customerRate || "2.00");
  const smsRate = parseNumericRate(services.find((s) => s.slug === "sms")?.customerRate || "0.25");
  const numberRate = parseNumericRate(services.find((s) => s.slug === "number-rental")?.customerRate || "499.00");

  const totalEstimatedBase = calcMinutes * aiCallRate + calcSms * smsRate + calcNumbers * numberRate;
  const totalEstimatedConverted = (totalEstimatedBase * exchangeMultiplier).toFixed(2);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#11E97F]/15 flex items-center justify-center text-emerald-800 shadow-xs border border-emerald-300">
              <Layers className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Services & Transparent Pricing
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Real-time Rate Card
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Pay only for what you use. Zero hidden fees, per-second metering with live multi-currency conversion.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Switcher (Powered by PostgreSQL system_currencies table) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Coins className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500">Currency:</span>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#11E97F] hover:bg-[#0fd673] rounded-xl transition shadow-xs"
          >
            <CreditCard className="h-4 w-4" />
            <span>Transaction History</span>
          </Link>
        </div>
      </div>

      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 shadow-sm border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#11E97F] animate-pulse" />
              <p className="text-xs font-bold tracking-wider uppercase text-emerald-400 font-mono">
                Active Telephony Wallet
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-white">
                {activeCurrency.symbol}
                {(5000 * exchangeMultiplier).toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                ({activeCurrency.code})
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Estimated ~{Math.floor(5000 / aiCallRate)} minutes of AI Voice Calling available. Auto-recharge enabled.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert("Recharge Gateway: Enter amount to top up via Razorpay / Stripe.")}
              className="px-5 py-2.5 rounded-xl bg-[#11E97F] text-slate-950 font-black text-xs hover:bg-[#0fd673] transition shadow-md cursor-pointer flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Add Balance (Recharge)</span>
            </button>
            <Link
              href="/dashboard/transactions"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
            >
              View Billing Log
            </Link>
          </div>
        </div>

        {/* Subtle decorative background graphic */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#11E97F]/10 blur-2xl pointer-events-none" />
      </div>

      {/* Services & Rate Card Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Customer Rate Card
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              (Live rates in {activeCurrency.code})
            </span>
          </div>

          {selectedCurrencyCode !== defaultCurrency.code && (
            <span className="text-xs text-slate-500 font-mono">
              1 {defaultCurrency.code} = {exchangeMultiplier.toFixed(4)} {activeCurrency.code} (Converted from Default)
            </span>
          )}
        </div>

        {/* Services Rate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-semibold">Loading rate card from server...</p>
            </div>
          ) : (
            services.map((svc) => {
              const convertedRate = convertRate(svc.customerRate);
              const isHighlight = svc.slug === "ai-voice-call";

              return (
                <div
                  key={svc.id}
                  className={cn(
                    "relative rounded-2xl p-5 transition-all duration-200 border bg-white shadow-2xs hover:shadow-md flex flex-col justify-between",
                    isHighlight
                      ? "border-emerald-300 ring-2 ring-emerald-500/10"
                      : "border-slate-200/90"
                  )}
                >
                  {isHighlight && (
                    <div className="absolute -top-2.5 right-4 bg-[#11E97F] text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                      Popular Core
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-xl">
                        {svc.icon || "⚡"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{svc.serviceName}</h3>
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {svc.category}
                        </span>
                      </div>
                    </div>

                    {/* Price and Unit */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">
                          Customer Rate
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {activeCurrency.symbol}
                            {convertedRate}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            / {svc.billingUnit.replace(/Per\s+/i, "")}
                          </span>
                          {selectedCurrencyCode !== defaultCurrency.code && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({defaultCurrency.symbol}{svc.customerRate} {defaultCurrency.code})
                            </span>
                          )}
                        </div>
                      </div>

                      {svc.isConfigurable && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          Configurable
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      {svc.description || "High-performance enterprise grade telecommunications and AI engine."}
                    </p>
                  </div>

                  {/* Metering specs */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Billing Unit:</span>
                    <span className="font-bold text-slate-700">{svc.billingUnit}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Usage Cost Estimator */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Monthly Cost Estimator
            </h3>
            <p className="text-xs text-slate-500">
              Adjust sliders below to simulate your monthly telephony and AI usage bill.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: AI Call Minutes */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">AI Voice Calling</span>
              <span className="font-mono font-black text-emerald-700">
                {calcMinutes} mins
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={calcMinutes}
              onChange={(e) => setCalcMinutes(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>100 mins</span>
              <span>Rate: {activeCurrency.symbol}{convertRate(String(aiCallRate))}/min</span>
              <span>20k mins</span>
            </div>
          </div>

          {/* Slider 2: SMS Alerts */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Transactional SMS</span>
              <span className="font-mono font-black text-emerald-700">
                {calcSms} SMS
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={calcSms}
              onChange={(e) => setCalcSms(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span>Rate: {activeCurrency.symbol}{convertRate(String(smsRate))}/SMS</span>
              <span>10k SMS</span>
            </div>
          </div>

          {/* Slider 3: Virtual Numbers */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Virtual DID Numbers</span>
              <span className="font-mono font-black text-emerald-700">
                {calcNumbers} Numbers
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={calcNumbers}
              onChange={(e) => setCalcNumbers(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1</span>
              <span>Rate: {activeCurrency.symbol}{convertRate(String(numberRate))}/mo</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Estimated Output Banner */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-emerald-950">
              Estimated Monthly Telephony Spend
            </p>
            <p className="text-[11px] text-emerald-800">
              Includes {calcMinutes} AI voice minutes + {calcSms} SMS + {calcNumbers} phone rentals.
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">
              {activeCurrency.symbol}
              {totalEstimatedConverted}
            </span>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              / month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
