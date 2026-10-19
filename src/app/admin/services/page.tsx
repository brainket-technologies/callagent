"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  PhoneCall,
  MessageSquare,
  Mic,
  Disc,
  Hash,
  X,
  Loader2,
  LayoutGrid,
  Table as TableIcon,
  Check,
  TrendingUp,
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
  currencyId: string | null;
  isConfigurable: boolean;
  icon: string;
  description: string;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  isDefault: boolean;
}

const FLAG_MAP: Record<string, string> = {
  INR: "🇮🇳",
  USD: "🇺🇸",
  AED: "🇦🇪",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  SGD: "🇸🇬",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  SAR: "🇸🇦",
  JPY: "🇯🇵",
};

const BILLING_UNIT_OPTIONS = [
  "60 sec",
  "30 sec",
  "15 sec",
  "1 sec",
  "Per SMS",
  "Per month",
  "Per day",
  "Per call",
  "Per minute or usage",
  "Per 1,000 characters",
  "Custom",
];

export default function AdminServicesRateCardPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("INR");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit / Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formRate, setFormRate] = useState("2.00");
  const [formUnit, setFormUnit] = useState("60 sec");
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [formCategory, setFormCategory] = useState("calling");
  const [formCurrency, setFormCurrency] = useState("INR");
  const [formConfigurable, setFormConfigurable] = useState(false);
  const [formIcon, setFormIcon] = useState("⚡");
  const [formDesc, setFormDesc] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
        if (data.currencies) {
          setCurrencies(data.currencies);
          if (data.defaultCurrency) {
            setSelectedCurrency(data.defaultCurrency.code);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load services:", err);
      showNotification("error", "Failed to load services from PostgreSQL");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const defaultCurrencyObj =
    currencies.find((c) => c.isDefault) || currencies[0] || {
      code: "INR",
      symbol: "₹",
      exchangeRate: "1.00",
    };

  const currentCurrencyObj =
    currencies.find((c) => c.code === selectedCurrency) || defaultCurrencyObj;

  const defaultRate = parseFloat(defaultCurrencyObj.exchangeRate || "1.00") || 1.0;
  const currentRate = parseFloat(currentCurrencyObj.exchangeRate || "1.00") || 1.0;
  const conversionRatio = currentRate / defaultRate;

  const parseNumericRate = (raw: string | number): number => {
    if (typeof raw === "number") return raw;
    if (!raw) return 0;
    const match = String(raw).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getConvertedRate = (baseRateStr: string) => {
    const base = parseNumericRate(baseRateStr);
    const converted = base * conversionRatio;
    if (converted >= 100) return converted.toFixed(2);
    if (converted >= 1) return converted.toFixed(2);
    if (converted >= 0.01) return converted.toFixed(3);
    return converted.toFixed(4);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormRate("1.00");
    setFormUnit("60 sec");
    setIsCustomUnit(false);
    setFormCategory("calling");
    setFormCurrency(defaultCurrencyObj.code);
    setFormConfigurable(false);
    setFormIcon("⚡");
    setFormDesc("");
    setFormEnabled(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingItem(svc);
    setFormName(svc.serviceName);
    setFormRate(svc.customerRate);
    let unit = svc.billingUnit;
    if (unit === "Per minute") unit = "60 sec";
    if (unit === "Per second") unit = "1 sec";
    if (unit === "Per day/month") unit = "Per month";
    const isKnown = BILLING_UNIT_OPTIONS.filter((u) => u !== "Custom").includes(unit);
    setFormUnit(unit);
    setIsCustomUnit(!isKnown);
    setFormCategory(svc.category);
    setFormCurrency(svc.currency || "INR");
    setFormConfigurable(svc.isConfigurable);
    setFormIcon(svc.icon || "⚡");
    setFormDesc(svc.description || "");
    setFormEnabled(svc.isEnabled);
    setModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRate.trim() || !formUnit.trim()) {
      showNotification("error", "Name, Rate, and Billing Unit are required");
      return;
    }

    try {
      setSubmitting(true);
      const rateNum = parseFloat(formRate) || 0;
      const ratePaise = Math.round(rateNum * 100);

      const action = editingItem ? "update" : "add";
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: editingItem?.id,
          slug: editingItem?.slug,
          serviceName: formName.trim(),
          customerRate: formRate.trim(),
          ratePaise,
          billingUnit: formUnit.trim(),
          category: formCategory,
          currency: formCurrency,
          isConfigurable: formConfigurable,
          icon: formIcon.trim(),
          description: formDesc.trim(),
          isEnabled: formEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message || "Service saved successfully!");
        setModalOpen(false);
        fetchData();
      } else {
        showNotification("error", data.error || "Failed to save service");
      }
    } catch (err) {
      showNotification("error", "Network error while saving service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (svc: ServiceItem) => {
    try {
      const nextStatus = !svc.isEnabled;
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, isEnabled: nextStatus } : s))
      );

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: svc.id, isEnabled: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
      } else {
        showNotification("error", data.error || "Failed to toggle status");
        fetchData();
      }
    } catch (err) {
      showNotification("error", "Network error");
      fetchData();
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.billingUnit.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm ring-2 ring-emerald-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Services & Rate Card Engine
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#11E97F] animate-pulse" />
                  Live Billing Rules
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Set customer pricing rates across AI Calling, SMS alerts, DID Numbers, and Voice Generation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dynamic Currency Selector linked to system_currencies table */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-base">{FLAG_MAP[selectedCurrency] || "🌐"}</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <Link
              href="/admin/settings/currencies"
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline pl-1 border-l border-slate-200"
              title="Add or configure currencies in PostgreSQL"
            >
              Currencies
            </Link>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", loading && "animate-spin text-emerald-600")} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#11E97F] hover:bg-[#0fd673] rounded-xl transition shadow-xs cursor-pointer active:scale-95 hover:shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {feedback && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-sm border transition-all animate-in slide-in-from-top-2",
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          )}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          METRIC STATS CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">AI Voice Call</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {currentCurrencyObj.symbol}
              {getConvertedRate(services.find((s) => s.slug === "ai-voice-call")?.customerRate || "2.00")}
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">/ min</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block border border-emerald-200/80">
            Core High-Yield Route
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">SMS Notification</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {currentCurrencyObj.symbol}
              {getConvertedRate(services.find((s) => s.slug === "sms")?.customerRate || "0.25")}
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">/ SMS</span>
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md mt-2 inline-block border border-slate-200">
            DLT Transactional
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Configurable Services</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              {services.filter((s) => s.isConfigurable).length} Services
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Inbound, Outbound, Recording, Numbers
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Master Default Currency</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-2xl font-black text-slate-900">{defaultCurrencyObj.code}</span>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Default Anchor
            </span>
          </div>
          <Link
            href="/admin/settings/currencies"
            className="text-[10px] font-bold text-emerald-700 hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>Change Default Currency</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
        </div>
      </div>

      {/* =========================================================================
          CONTROLS BAR
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service name, unit, category..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {filteredServices.length} billable items
          </span>

          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400 hover:text-slate-700"
              )}
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABLE VIEW
          ========================================================================= */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Service Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Customer Rate ({currentCurrencyObj.code})</th>
                  <th className="py-3.5 px-4">Billing Unit</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Loader2 className="h-7 w-7 animate-spin mx-auto text-emerald-600 mb-2" />
                      <p className="text-xs font-semibold">Loading rate cards from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      No services match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((svc) => {
                    const convertedRate = getConvertedRate(svc.customerRate);
                    const isViewingDefault = selectedCurrency === defaultCurrencyObj.code;

                    return (
                      <tr
                        key={svc.id}
                        className={cn(
                          "hover:bg-slate-50/90 transition group",
                          !svc.isEnabled && "opacity-60 bg-slate-50/30"
                        )}
                      >
                        {/* Service Item */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-2xs shrink-0 group-hover:scale-105 transition">
                              <span>{svc.icon || "⚡"}</span>
                            </div>
                            <div>
                              <p className="text-slate-900 font-bold text-xs">{svc.serviceName}</p>
                              <p className="text-[11px] text-slate-400 max-w-xs truncate">{svc.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {svc.category}
                          </span>
                        </td>

                        {/* Customer Rate */}
                        <td className="py-4 px-4 font-mono">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {currentCurrencyObj.symbol}
                              {convertedRate}
                            </span>
                            {!isViewingDefault ? (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({defaultCurrencyObj.symbol}{svc.customerRate} {defaultCurrencyObj.code})
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Default
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Billing Unit */}
                        <td className="py-4 px-4 text-slate-700 font-mono font-semibold">
                          {svc.billingUnit}
                        </td>

                        {/* Type */}
                        <td className="py-4 px-4">
                          {svc.isConfigurable ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              <Sliders className="h-2.5 w-2.5" /> Configurable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Fixed Rate
                            </span>
                          )}
                        </td>

                        {/* Active Toggle */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggle(svc)}
                              className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                                svc.isEnabled ? "bg-[#11E97F]" : "bg-slate-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200",
                                  svc.isEnabled ? "translate-x-4" : "translate-x-0"
                                )}
                              />
                            </button>
                            <span
                              className={cn(
                                "text-[11px] font-bold",
                                svc.isEnabled ? "text-emerald-700" : "text-slate-400"
                              )}
                            >
                              {svc.isEnabled ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenEdit(svc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-200 transition cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit Rate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =========================================================================
            CARD GRID VIEW
            ========================================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const convertedRate = getConvertedRate(svc.customerRate);
            const isViewingDefault = selectedCurrency === defaultCurrencyObj.code;

            return (
              <div
                key={svc.id}
                className={cn(
                  "relative rounded-2xl border p-5 bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group",
                  svc.slug === "ai-voice-call"
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/90",
                  !svc.isEnabled && "opacity-60 bg-slate-50/50"
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                        <span>{svc.icon || "⚡"}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{svc.serviceName}</h3>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                          {svc.category}
                        </span>
                      </div>
                    </div>

                    {svc.isConfigurable ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Configurable
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Fixed
                      </span>
                    )}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                        Customer Rate
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-slate-900 font-mono">
                          {currentCurrencyObj.symbol}
                          {convertedRate}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          / {svc.billingUnit.replace(/Per\s+/i, "")}
                        </span>
                      </div>
                    </div>

                    {!isViewingDefault && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {defaultCurrencyObj.symbol}{svc.customerRate} {defaultCurrencyObj.code}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">
                    {svc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(svc)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        svc.isEnabled ? "bg-[#11E97F]" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200",
                          svc.isEnabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {svc.isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Rate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          EDIT / ADD SERVICE MODAL
          ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingItem ? `Edit Rate: ${editingItem.serviceName}` : "Add Billable Service"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Updates live customer billing rates immediately in PostgreSQL.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. AI Voice Call, SMS Alerts, Recording"
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rate in Default Currency ({defaultCurrencyObj.code} {defaultCurrencyObj.symbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    placeholder="e.g. 2.00, 0.25, 499.00"
                    className="w-full px-3 py-2 text-xs font-mono font-black rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    All other currencies automatically convert from this {defaultCurrencyObj.code} rate.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Billing Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={isCustomUnit ? "Custom" : formUnit}
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setIsCustomUnit(true);
                        setFormUnit("");
                      } else {
                        setIsCustomUnit(false);
                        setFormUnit(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                  >
                    {BILLING_UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>

                  {isCustomUnit && (
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="Type custom billing unit (e.g. Per 500 words)"
                      className="w-full mt-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-300 bg-emerald-50/30 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition animate-in fade-in"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="calling">AI Voice Calling</option>
                    <option value="telephony">Telephony Calls</option>
                    <option value="messaging">SMS Alerts</option>
                    <option value="ai_voice">AI Speech Synthesis</option>
                    <option value="recording">Call Recording</option>
                    <option value="number">Virtual DID Numbers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="e.g. 🤖, 💬, 📞, 🎙️"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Explain billing rules and features..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfigurable}
                    onChange={(e) => setFormConfigurable(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Mark as Configurable Rate (Custom enterprise contracts)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Enable Service on Platform Rate Card
                  </span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-[#11E97F] hover:bg-[#0fd673] rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Rate Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
