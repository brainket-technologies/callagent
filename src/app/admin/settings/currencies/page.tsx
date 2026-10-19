"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Star,
  Edit3,
  Trash2,
  Globe,
  ArrowRightLeft,
  X,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Check,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyItem {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  isBaseCurrency: boolean;
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Preset popular currencies for 1-click superadmin selection (with standard Forex benchmarks)
const POPULAR_PRESETS = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rateVsUsd: 1.0 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rateVsUsd: 83.33 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rateVsUsd: 0.92 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", rateVsUsd: 3.67 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rateVsUsd: 0.78 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rateVsUsd: 1.34 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rateVsUsd: 1.38 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rateVsUsd: 1.52 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", rateVsUsd: 3.75 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rateVsUsd: 152.0 },
];

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

export default function AdminCurrenciesPage() {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add / Edit Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CurrencyItem | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formSymbol, setFormSymbol] = useState("");
  const [formExchangeRate, setFormExchangeRate] = useState("1.00");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/currencies");
      const data = await res.json();
      if (data.success) {
        setCurrencies(data.currencies || []);
      }
    } catch (err: any) {
      console.error("Failed to load currencies:", err);
      showNotification("error", "Failed to connect to currency database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormCode("");
    setFormName("");
    setFormSymbol("");
    setFormExchangeRate("1.00");
    setFormIsDefault(false);
    setFormIsEnabled(true);
    setModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setFormCode(preset.code);
    setFormName(preset.name);
    setFormSymbol(preset.symbol);

    const defaultPreset = POPULAR_PRESETS.find((p) => p.code === defaultCurrency.code);
    const defaultVsUsd = defaultPreset ? defaultPreset.rateVsUsd : (defaultCurrency.code === "INR" ? 83.33 : 1.0);
    const targetVsUsd = preset.rateVsUsd;
    const computedRatio = targetVsUsd / defaultVsUsd;
    const rateStr =
      computedRatio >= 100
        ? computedRatio.toFixed(2)
        : computedRatio >= 1
        ? computedRatio.toFixed(2)
        : computedRatio.toFixed(4);
    setFormExchangeRate(rateStr);
  };

  const handleOpenEdit = (curr: CurrencyItem) => {
    setEditingItem(curr);
    setFormCode(curr.code);
    setFormName(curr.name);
    setFormSymbol(curr.symbol);
    setFormExchangeRate(curr.exchangeRate);
    setFormIsDefault(curr.isDefault);
    setFormIsEnabled(curr.isEnabled);
    setModalOpen(true);
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || !formSymbol.trim()) {
      showNotification("error", "Currency Code, Name, and Symbol are required");
      return;
    }

    try {
      setSubmitting(true);
      const action = editingItem ? "update" : "add";
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: editingItem?.id,
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          symbol: formSymbol.trim(),
          exchangeRate: formExchangeRate.trim(),
          isDefault: formIsDefault,
          isEnabled: formIsEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message || "Currency saved successfully!");
        setModalOpen(false);
        fetchCurrencies();
      } else {
        showNotification("error", data.error || "Failed to save currency");
      }
    } catch (err: any) {
      showNotification("error", "Network error while saving currency");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (curr: CurrencyItem) => {
    try {
      const nextStatus = !curr.isEnabled;
      setCurrencies((prev) =>
        prev.map((c) => (c.id === curr.id ? { ...c, isEnabled: nextStatus } : c))
      );

      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: curr.id, isEnabled: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
      } else {
        showNotification("error", data.error || "Failed to toggle status");
        fetchCurrencies();
      }
    } catch (err) {
      showNotification("error", "Network error");
      fetchCurrencies();
    }
  };

  const handleSetDefault = async (curr: CurrencyItem) => {
    try {
      setCurrencies((prev) =>
        prev.map((c) => ({
          ...c,
          isDefault: c.id === curr.id,
          isEnabled: c.id === curr.id ? true : c.isEnabled,
        }))
      );

      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default", id: curr.id }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
      } else {
        showNotification("error", data.error || "Failed to set default");
        fetchCurrencies();
      }
    } catch (err) {
      showNotification("error", "Network error");
      fetchCurrencies();
    }
  };

  const handleDelete = async (curr: CurrencyItem) => {
    if (curr.isDefault) {
      showNotification("error", `Active platform default currency (${curr.code}) cannot be deleted! Set another currency as default first.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete ${curr.code} (${curr.name})?`)) {
      return;
    }

    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: curr.id }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
        setCurrencies((prev) => prev.filter((c) => c.id !== curr.id));
      } else {
        showNotification("error", data.error || "Failed to delete currency");
      }
    } catch (err) {
      showNotification("error", "Network error");
    }
  };

  const filteredCurrencies = currencies.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === "active") return c.isEnabled;
    if (statusFilter === "disabled") return !c.isEnabled;
    return true;
  });

  const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0] || {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    exchangeRate: "1.00",
  };

  const defRate = parseFloat(defaultCurrency.exchangeRate || "1.00") || 1.0;

  // Calculates 1 [defaultCurrency] in terms of [curr]
  const getRateVsDefault = (curr: CurrencyItem) => {
    if (curr.code === defaultCurrency.code) return "1.0000";
    const currRate = parseFloat(curr.exchangeRate || "1.00") || 1.0;
    const ratio = currRate / defRate;
    if (ratio >= 100) return ratio.toFixed(2);
    if (ratio >= 10) return ratio.toFixed(3);
    return ratio.toFixed(4);
  };

  // Calculates sample 100 [defaultCurrency] in [curr]
  const getSample100VsDefault = (curr: CurrencyItem) => {
    const currRate = parseFloat(curr.exchangeRate || "1.00") || 1.0;
    const ratio = currRate / defRate;
    return (100 * ratio).toFixed(2);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm ring-2 ring-emerald-500/20">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Currency Management
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#11E97F] animate-pulse" />
                  Active Default: {defaultCurrency.code} ({defaultCurrency.symbol})
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                The default currency is the master platform anchor. Services use the default currency, and all other currencies convert from it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchCurrencies}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
            title="Reload currencies from PostgreSQL"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", loading && "animate-spin text-emerald-600")} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#11E97F] hover:bg-[#0fd673] rounded-xl transition shadow-xs cursor-pointer active:scale-95 hover:shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Currency</span>
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
          METRIC STATS CARDS (Dynamic to Default Currency)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Master Default Currency */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Master Platform Currency
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {defaultCurrency.code} ({defaultCurrency.symbol})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Default 1.00x
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Services and rate cards use this currency. Other units convert from it.
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-110 transition">
              <Landmark className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Card 2: Active Supported */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Active Currencies
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {currencies.filter((c) => c.isEnabled).length}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  of {currencies.length} configured
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Enabled for real-time customer rate card currency conversion.
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-110 transition">
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-400" />
        </div>

        {/* Card 3: Conversion Anchor */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Conversion Anchor
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-2xl font-black text-emerald-800 tracking-tight">
                  1 {defaultCurrency.code} Base
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Changing default automatically recalculates all platform exchange ratios.
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-110 transition">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400" />
        </div>
      </div>

      {/* =========================================================================
          TABLE / GRID CONTROLS BAR
          ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, name, or symbol..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1 rounded-lg font-semibold transition cursor-pointer",
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              All ({currencies.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "px-3 py-1 rounded-lg font-semibold transition cursor-pointer",
                statusFilter === "active"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Active ({currencies.filter((c) => c.isEnabled).length})
            </button>
            <button
              onClick={() => setStatusFilter("disabled")}
              className={cn(
                "px-3 py-1 rounded-lg font-semibold transition cursor-pointer",
                statusFilter === "disabled"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Disabled ({currencies.filter((c) => !c.isEnabled).length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400 hover:text-slate-700"
              )}
              title="Table view"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg transition cursor-pointer",
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400 hover:text-slate-700"
              )}
              title="Card Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: MODERN TABLE VIEW
          ========================================================================= */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Currency</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">
                    Exchange Rate (vs {defaultCurrency.code})
                  </th>
                  <th className="py-3.5 px-4">Default Status</th>
                  <th className="py-3.5 px-4">Active Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Loader2 className="h-7 w-7 animate-spin mx-auto text-emerald-600 mb-2" />
                      <p className="text-xs font-semibold">Loading currencies from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : filteredCurrencies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Coins className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No currencies match your filter</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try clearing the search or adding a new currency.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCurrencies.map((curr) => {
                    const flag = FLAG_MAP[curr.code] || "🌐";
                    const isBase = curr.isBaseCurrency;
                    const isDefault = curr.isDefault;

                    return (
                      <tr
                        key={curr.id}
                        className={cn(
                          "hover:bg-slate-50/90 transition group",
                          !curr.isEnabled && "opacity-60 bg-slate-50/30"
                        )}
                      >
                        {/* Currency Code & Flag Token */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-base shadow-2xs shrink-0 group-hover:scale-105 transition">
                              <span>{flag}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 font-mono text-sm">
                                  {curr.code}
                                </span>
                                {isDefault && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-950 border border-emerald-300 uppercase tracking-wider">
                                    Default
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ISO: {curr.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-4 px-4 font-semibold text-slate-800 text-xs">
                          {curr.name}
                        </td>

                        {/* Symbol */}
                        <td className="py-4 px-4">
                          <div className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg bg-slate-100 border border-slate-200/80 font-mono font-bold text-slate-900 text-xs">
                            {curr.symbol}
                          </div>
                        </td>

                        {/* Exchange Rate (Anchor to Default) */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            {isDefault ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-emerald-800 text-xs">
                                  1 {curr.code} = 1.00 {curr.code}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Master Anchor
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  1 {defaultCurrency.code} = {getRateVsDefault(curr)} {curr.code}
                                </span>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {defaultCurrency.symbol}100 ≈ {curr.symbol}{getSample100VsDefault(curr)}
                                </p>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Default Status */}
                        <td className="py-4 px-4">
                          {curr.isDefault ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-950 border border-emerald-300 shadow-2xs">
                              <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                              <span>Default Currency</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefault(curr)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-emerald-200 transition cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggle(curr)}
                              disabled={curr.isDefault}
                              className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                curr.isEnabled ? "bg-[#11E97F]" : "bg-slate-300",
                                curr.isDefault && "opacity-70 cursor-not-allowed"
                              )}
                              title={curr.isDefault ? "Default currency must remain enabled" : undefined}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                                  curr.isEnabled ? "translate-x-4" : "translate-x-0"
                                )}
                              />
                            </button>
                            <span
                              className={cn(
                                "text-[11px] font-bold",
                                curr.isEnabled ? "text-emerald-700" : "text-slate-400"
                              )}
                            >
                              {curr.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(curr)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Edit currency"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {!curr.isDefault && (
                              <button
                                onClick={() => handleDelete(curr)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete currency"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
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
            VIEW MODE 2: CARD GRID VIEW (Fintech Card Style)
            ========================================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCurrencies.map((curr) => {
            const flag = FLAG_MAP[curr.code] || "🌐";
            const isBase = curr.isBaseCurrency;

            return (
              <div
                key={curr.id}
                className={cn(
                  "relative rounded-2xl border p-5 bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group",
                  curr.isDefault
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/90",
                  !curr.isEnabled && "opacity-60 bg-slate-50/50"
                )}
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs">
                        <span>{flag}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base font-mono">
                            {curr.code}
                          </h3>
                          <span className="font-mono font-bold text-slate-400 text-xs">
                            ({curr.symbol})
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">{curr.name}</p>
                      </div>
                    </div>

                    {curr.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" /> Default
                      </span>
                    ) : isBase ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Base 1.00x
                      </span>
                    ) : null}
                  </div>

                  {/* Exchange Rate Pill (Anchor to Default) */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">
                        Exchange Rate (vs {defaultCurrency.code})
                      </span>
                      <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                        {curr.isDefault
                          ? `1 ${curr.code} = 1.00 ${curr.code} (Anchor)`
                          : `1 ${defaultCurrency.code} = ${getRateVsDefault(curr)} ${curr.code}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {curr.isDefault ? "Benchmark" : "Sample:"}
                      </span>
                      <p className="font-mono font-semibold text-emerald-700 text-xs">
                        {curr.isDefault
                          ? "Default Unit"
                          : `${defaultCurrency.symbol}100 ≈ ${curr.symbol}${getSample100VsDefault(curr)}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(curr)}
                      disabled={curr.isDefault}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                        curr.isEnabled ? "bg-[#11E97F]" : "bg-slate-300",
                        curr.isDefault && "opacity-70 cursor-not-allowed"
                      )}
                      title={curr.isDefault ? "Default currency must remain enabled" : undefined}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200",
                          curr.isEnabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {curr.isEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!curr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(curr)}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition cursor-pointer"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(curr)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {!curr.isDefault && (
                      <button
                        onClick={() => handleDelete(curr)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT CURRENCY MODAL (With 1-Click Popular Presets!)
          ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingItem ? `Edit Currency: ${editingItem.code}` : "Add System Currency"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves directly to PostgreSQL system_currencies table.
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

            <form onSubmit={handleSaveCurrency} className="p-6 space-y-4">
              {/* Quick Preset Selector for New Currency */}
              {!editingItem && (
                <div className="space-y-1.5 pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Quick Select Preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_PRESETS.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1",
                          formCode === p.code
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <span>{p.flag}</span>
                        <span>{p.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Currency Code & Symbol Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ISO Code (3-letter) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingItem?.isBaseCurrency)}
                    maxLength={10}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. USD, EUR, AED"
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-black rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Symbol <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    placeholder="e.g. $, ₹, €, د.إ, £"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Currency Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Currency Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. US Dollar, UAE Dirham, Euro"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Exchange Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Exchange Rate (vs 1 {defaultCurrency.code} Anchor) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingItem?.isDefault)}
                    value={formExchangeRate}
                    onChange={(e) => setFormExchangeRate(e.target.value)}
                    placeholder="e.g. 1.00"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <div className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">
                    1 {defaultCurrency.code} = {formExchangeRate || "0"} {formCode || "UNIT"}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {editingItem?.isDefault
                    ? `${formCode || "This"} is the active platform default anchor (fixed at 1.00).`
                    : `How many ${formCode || "units"} equal 1 ${defaultCurrency.code}. All services and customer rates convert using this.`}
                </p>
              </div>

              {/* Checkbox Options */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Set as Default Customer View Currency
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsEnabled}
                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Enable Currency for Platform Rate Cards & Billing
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
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
                  <span>Save Currency</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
