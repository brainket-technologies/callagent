"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency, cn } from "@/lib/utils";
import {
  CreditCard,
  Plus,
  Zap,
  Download,
  CheckCircle2,
  Sliders,
  Gift,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
  Printer,
  ShieldCheck,
  Search,
  Percent,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { BRAND_CONFIG } from "@/lib/brand-config";

interface DbTransaction {
  id: string;
  txnNumber: string;
  type: string;
  serviceName: string;
  amount: string;
  balanceAfter: string;
  amountPaise: number;
  balanceAfterPaise: number;
  billingUnit?: string;
  currency?: string;
  gateway?: string;
  status: string;
  timestampStr?: string;
  invoiceUrl?: string | null;
  createdAt: string;
}

interface ServicePricingItem {
  id: string;
  slug: string;
  serviceName: string;
  category: string;
  customerRate: string;
  billingUnit: string;
  currency: string;
  icon?: string;
  description?: string;
  isEnabled?: boolean;
}

export default function BillingPlanPage() {
  const { workspace, setRechargeModalOpen } = useStore();
  const [tab, setTab] = useState<"plan" | "transactions">("plan");

  // Dynamic state loaded from PostgreSQL
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [services, setServices] = useState<ServicePricingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Live balance from DB
  const [liveBalance, setLiveBalance] = useState<number>(Number(workspace.walletBalance || 200));

  // Modals
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const [concurrencyModalOpen, setConcurrencyModalOpen] = useState(false);
  const [channels, setChannels] = useState<number>(2);
  const [concurrencySaving, setConcurrencySaving] = useState(false);
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null);
  const [concurrencySuccessNotice, setConcurrencySuccessNotice] = useState<string | null>(null);

  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<DbTransaction | null>(null);

  // Fetch live transactions and service rates on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // 1. Fetch live transactions from DB
      const txRes = await fetch("/api/transactions");
      const txData = await txRes.json();
      if (txData.success && Array.isArray(txData.transactions)) {
        setTransactions(txData.transactions);
      }

      // 2. Fetch live services pricing from DB
      const srvRes = await fetch("/api/services");
      const srvData = await srvRes.json();
      if (srvData.success && Array.isArray(srvData.services)) {
        setServices(srvData.services);
      }

      // 3. Fetch latest workspace balance from DB session
      const sessRes = await fetch("/api/auth/session");
      const sessData = await sessRes.json();
      if (sessData.success && sessData.workspace) {
        const bal = Number(sessData.workspace.walletBalance ?? 200);
        setLiveBalance(bal);
        if (sessData.workspace.concurrencyLimit) {
          setChannels(Number(sessData.workspace.concurrencyLimit));
        }
      }

      // 4. Also fetch concurrency info directly
      const concRes = await fetch("/api/workspace/concurrency").catch(() => null);
      if (concRes) {
        const concData = await concRes.json().catch(() => null);
        if (concData?.success && concData.channels) {
          setChannels(Number(concData.channels));
        }
      }
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchInitialData();
  };

  // Helper rate lookups from PostgreSQL
  const callService = services.find((s) => s.slug === "ai-voice-call" || s.slug === "outgoing-call");
  const callRateStr = callService ? `₹${Number(callService.customerRate).toFixed(2)}` : "₹2.00";

  const numberService = services.find((s) => s.slug === "number-rental");
  const numberRateStr = numberService ? `₹${Number(numberService.customerRate).toFixed(2)}/mo` : "₹499.00/mo";

  const freeChannels = 2;
  const concurrencyService = services.find((s) => s.slug === "call-concurrency");
  const channelRate = concurrencyService ? Number(concurrencyService.customerRate) : 999;
  const billedChannels = Math.max(0, channels - freeChannels);
  const concurrencyCost = billedChannels * channelRate;

  // Concurrency save handler with DB balance check & deduction
  const handleSaveConcurrency = async () => {
    try {
      setConcurrencySaving(true);
      setConcurrencyError(null);
      setConcurrencySuccessNotice(null);

      const res = await fetch("/api/workspace/concurrency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels }),
      });
      const data = await res.json();

      if (!data.success) {
        setConcurrencyError(data.error || "Failed to update concurrency");
        return;
      }

      setConcurrencySuccessNotice(data.message);
      if (data.newBalance !== undefined) {
        setLiveBalance(Number(data.newBalance));
      }

      setTimeout(() => {
        setConcurrencyModalOpen(false);
        setConcurrencySuccessNotice(null);
        setConcurrencyError(null);
      }, 1500);

      // Refresh transactions ledger & balance
      fetchInitialData();
    } catch (err: any) {
      setConcurrencyError("Network error updating concurrency. Please try again.");
    } finally {
      setConcurrencySaving(false);
    }
  };

  // Coupon redemption
  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponMessage(null);
      const res = await fetch("/api/workspace/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponMessage({ text: data.message });
        setLiveBalance(Number(data.newBalance));
        setCouponCode("");
        // Reload transactions
        fetchInitialData();
        setTimeout(() => {
          setCouponModalOpen(false);
          setCouponMessage(null);
        }, 1500);
      } else {
        setCouponMessage({ text: data.error || "Failed to apply coupon", error: true });
      }
    } catch (err) {
      setCouponMessage({ text: "Network error redeeming coupon", error: true });
    } finally {
      setCouponLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "recharges" && !tx.type.includes("recharge") && !tx.type.includes("credit")) return false;
    if (filterType === "usage" && !tx.type.includes("usage")) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.txnNumber.toLowerCase().includes(q) ||
        tx.serviceName.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Billing plan</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage concurrency, credits, and billing history
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs (Plan vs Transactions) */}
      <div className="flex border-b border-neutral-200 text-xs font-semibold">
        <button
          onClick={() => setTab("plan")}
          className={`pb-3 px-3 border-b-2 transition cursor-pointer ${
            tab === "plan"
              ? "border-[#11E97F] text-emerald-950 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setTab("transactions")}
          className={`pb-3 px-3 border-b-2 transition cursor-pointer ${
            tab === "transactions"
              ? "border-[#11E97F] text-emerald-950 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          Transactions
        </button>
      </div>

      {tab === "plan" ? (
        <div className="space-y-6">
          {/* Available Balance Box */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Available balance</p>
                <p className="text-3xl font-extrabold text-neutral-900 mt-1">
                  ₹{liveBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Default Bill Plan INR • Calls at {callRateStr}/min, Number at {numberRateStr}, Concurrency at {channels} channels
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCouponModalOpen(true)}
                  className="text-xs h-9 cursor-pointer"
                >
                  <Gift className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                  Redeem Coupon
                </Button>

                <Button
                  onClick={() => setRechargeModalOpen(true)}
                  className="text-xs h-9 px-4 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1 stroke-[3]" />
                  Add Balance
                </Button>
              </div>
            </div>
          </div>

          {/* Concurrency Section */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Concurrency</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">
                  {channels} channels ({concurrencyCost > 0 ? `₹${concurrencyCost.toLocaleString("en-IN")}/mo` : "₹0"})
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {billedChannels === 0
                    ? `${freeChannels} free unlocked channels (0 billed this cycle)`
                    : `${freeChannels} free + ${billedChannels} extra channels (₹${channelRate.toFixed(2)}/channel/mo)`}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setConcurrencyModalOpen(true)}
                className="text-xs h-8 hover:border-[#11E97F] hover:text-emerald-800 cursor-pointer"
              >
                Change concurrency
              </Button>
            </div>
          </div>

          {/* Simple Services Rate Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm"
              >
                <p className="text-xs text-neutral-400 font-medium">{srv.serviceName}</p>
                <p className="text-sm font-bold text-neutral-900 mt-1">
                  ₹{Number(srv.customerRate).toFixed(2)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {srv.billingUnit.toLowerCase().startsWith("per")
                    ? srv.billingUnit.toLowerCase()
                    : `per ${srv.billingUnit}`}
                </p>
              </div>
            ))}
          </div>


        </div>
      ) : (
        /* TRANSACTIONS TAB: IMMUTABLE FINANCIAL LEDGER */
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Double-Entry Financial Ledger</h3>
              <p className="text-[11px] text-neutral-400">All amounts in INR (Paise)</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => setFilterType("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                    filterType === "all" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("recharges")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                    filterType === "recharges" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  Recharges
                </button>
                <button
                  onClick={() => setFilterType("usage")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                    filterType === "usage" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  Usage
                </button>
              </div>

              <div className="relative w-44">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ledger..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:border-[#11E97F]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-600 mb-2" />
                      <span>Loading ledger from PostgreSQL database...</span>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit =
                      Number(tx.amount) > 0 ||
                      tx.type.includes("credit") ||
                      tx.type.includes("recharge");

                    const formattedAmount = isCredit
                      ? `+ ₹${Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : `- ₹${Math.abs(Number(tx.amount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

                    const formattedBalance = `₹${Number(tx.balanceAfter).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

                    return (
                      <tr key={tx.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-4 font-sans font-semibold text-neutral-900">
                          <p>{tx.serviceName}</p>
                          <span className="text-[10px] font-mono text-neutral-400">{tx.txnNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono",
                              isCredit
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-700"
                            )}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 text-neutral-500" />
                            )}
                            <span>{tx.type}</span>
                          </span>
                        </td>
                        <td
                          className={cn(
                            "py-3.5 px-4 font-bold font-mono",
                            isCredit ? "text-emerald-600" : "text-neutral-900"
                          )}
                        >
                          {formattedAmount}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-800 font-mono">
                          {formattedBalance}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 font-sans">
                          {tx.timestampStr ||
                            new Date(tx.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-sans">
                          <button
                            onClick={() => setSelectedInvoiceTx(tx)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            PDF
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
      )}

      {/* Coupon Modal */}
      <Modal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        title="Redeem Promotional Coupon"
        description="Enter your promotional or discount coupon code to credit your workspace wallet."
        maxWidth="md"
      >
        <form onSubmit={handleRedeemCoupon} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Coupon Code</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME100, VOXERA50"
                className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-mono uppercase text-neutral-900 focus:outline-none focus:border-[#11E97F]"
              />
              <Button type="submit" disabled={couponLoading || !couponCode.trim()} className="text-xs h-9 px-4">
                {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
              </Button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Available test coupons: <span className="font-mono text-emerald-700 font-bold">WELCOME100</span> (₹100 credit), <span className="font-mono text-emerald-700 font-bold">VOXERA50</span> (₹50 credit)
            </p>
          </div>

          {couponMessage && (
            <div
              className={cn(
                "p-3 rounded-xl text-xs font-medium flex items-center gap-2",
                couponMessage.error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              )}
            >
              {couponMessage.error ? null : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
              <span>{couponMessage.text}</span>
            </div>
          )}
        </form>
      </Modal>

      {/* Concurrency Modal */}
      <Modal
        isOpen={concurrencyModalOpen}
        onClose={() => setConcurrencyModalOpen(false)}
        title="Adjust Channel Concurrency"
        description="Configure how many parallel calls can run simultaneously for your inbound and outbound AI voice calls."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex justify-between text-xs font-bold text-neutral-900">
              <span>Concurrent Lines</span>
              <span className="font-mono text-emerald-700 font-bold text-sm">{channels} Channels</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={channels}
              onChange={(e) => setChannels(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>2 free included</span>
              <span>10 channels</span>
              <span>25 channels</span>
              <span>50 channels</span>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-600">
              <span>Free Included Channels</span>
              <span className="font-mono font-bold text-neutral-900">2 Channels (₹0)</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600">
              <span>Additional Channels ({billedChannels} × ₹{channelRate.toFixed(2)}/mo)</span>
              <span className="font-mono font-bold text-neutral-900">₹{concurrencyCost.toLocaleString("en-IN")}/mo</span>
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between font-bold text-neutral-900 text-sm">
              <span>Monthly Concurrency Total</span>
              <span className="font-mono text-emerald-700">₹{concurrencyCost.toLocaleString("en-IN")}/mo</span>
            </div>
          </div>

          <div className="text-xs text-neutral-600 space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
              ✓ Pehle 2 calls ek saath chalna bilkul FREE hai (₹0).
            </p>
            <p className="text-neutral-500">
              ✓ 2 se zyada jitne extra channels select karenge, unka ₹{channelRate.toFixed(2)}/channel/mo charge hoga jo wallet se debit hoga.
            </p>
          </div>

          {concurrencyError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2 animate-in fade-in">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                {concurrencyError}
              </p>
              {concurrencyError.toLowerCase().includes("insufficient") && (
                <div className="pt-1">
                  <Button
                    type="button"
                    onClick={() => {
                      setConcurrencyModalOpen(false);
                      setConcurrencyError(null);
                      setRechargeModalOpen(true);
                    }}
                    className="text-xs h-7 px-3 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Recharge Wallet Now
                  </Button>
                </div>
              )}
            </div>
          )}

          {concurrencySuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{concurrencySuccessNotice}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button
              variant="outline"
              disabled={concurrencySaving}
              onClick={() => {
                setConcurrencyModalOpen(false);
                setConcurrencyError(null);
              }}
              className="text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              disabled={concurrencySaving}
              onClick={handleSaveConcurrency}
              className="text-xs h-9 px-4 cursor-pointer font-bold"
            >
              {concurrencySaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Channels"
              )}
            </Button>
          </div>
        </div>
      </Modal>



      {/* Tax Invoice Modal */}
      <Modal
        isOpen={Boolean(selectedInvoiceTx)}
        onClose={() => setSelectedInvoiceTx(null)}
        title="GST Tax Invoice & Receipt"
        maxWidth="lg"
      >
        {selectedInvoiceTx && (
          <div className="space-y-6 text-neutral-800 print:text-black">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">{BRAND_CONFIG.name}</h2>
                <p className="text-xs text-neutral-500">Cloud Telephony & AI Voice Infrastructure</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">GSTIN: 07AAACV1234F1Z8</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 font-mono">
                  PAID
                </span>
                <p className="text-xs font-mono font-bold text-neutral-900 mt-1">
                  INV-{selectedInvoiceTx.txnNumber}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {selectedInvoiceTx.timestampStr || new Date(selectedInvoiceTx.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-neutral-400 uppercase text-[10px]">Billed To</p>
                <p className="font-bold text-neutral-900 mt-0.5">{workspace.name || "Default Workspace"}</p>
                <p className="text-neutral-500 text-[11px]">Workspace ID: {workspace.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-neutral-400 uppercase text-[10px]">Payment Details</p>
                <p className="font-bold text-neutral-900 mt-0.5">{selectedInvoiceTx.gateway || "Online UPI / Wallet"}</p>
                <p className="text-neutral-500 text-[11px]">Status: Success</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Item / Description</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-3 px-3 font-sans font-medium text-neutral-900">
                      {selectedInvoiceTx.serviceName}
                    </td>
                    <td className="py-3 px-3 font-sans text-neutral-500">{selectedInvoiceTx.type}</td>
                    <td className="py-3 px-3 text-right font-bold text-neutral-900">
                      ₹{Math.abs(Number(selectedInvoiceTx.amount)).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs">
              <div className="w-56 space-y-1.5 border-t border-neutral-200 pt-3">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{Math.abs(Number(selectedInvoiceTx.amount)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>GST (18% inclusive)</span>
                  <span className="font-mono">₹{(Math.abs(Number(selectedInvoiceTx.amount)) * 0.18 / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-sm border-t border-neutral-200 pt-1.5">
                  <span>Total Paid</span>
                  <span className="font-mono text-emerald-700">₹{Math.abs(Number(selectedInvoiceTx.amount)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 print:hidden">
              <span className="text-[11px] text-neutral-400">Digitally generated valid tax receipt.</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoiceTx(null)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="text-xs h-9 px-4 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
