"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency } from "@/lib/utils";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillingPlanPage() {
  const { workspace, transactions, setRechargeModalOpen } = useStore();
  const [tab, setTab] = useState<"plan" | "transactions">("plan");

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Billing plan</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage concurrency, credits, and billing history
        </p>
      </div>

      {/* Tabs (Plan vs Transactions) - Matching Screenshot 51! */}
      <div className="flex border-b border-neutral-200 text-xs font-semibold">
        <button
          onClick={() => setTab("plan")}
          className={`pb-3 px-3 border-b-2 transition ${
            tab === "plan" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
          }`}
        >
          Plan
        </button>
        <button
          onClick={() => setTab("transactions")}
          className={`pb-3 px-3 border-b-2 transition ${
            tab === "transactions" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
          }`}
        >
          Transactions
        </button>
      </div>

      {tab === "plan" ? (
        <div className="space-y-6">
          {/* Available Balance Box (Matching Screenshot 51!) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Available balance</p>
                <p className="text-3xl font-extrabold text-neutral-900 mt-1">
                  {formatCurrency(workspace.walletBalancePaise)}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Default Bill Plan INR • Calls at ₹10/min (or ₹6/min pulse on high volume), Number at ₹499/month, Concurrency at 25 calls per minute
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => alert("Coupon code modal opened. Enter promo code.")}
                  className="text-xs h-9"
                >
                  <Gift className="h-3.5 w-3.5 mr-1.5" />
                  Redeem Coupon
                </Button>

                <Button
                  onClick={() => setRechargeModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs h-9 px-4 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Balance
                </Button>
              </div>
            </div>
          </div>

          {/* Concurrency Section (Matching Screenshot 51!) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 font-medium">Concurrency</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">25 channels (₹0)</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  25 free unlocked channels (0 billed this cycle)
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => alert("Concurrency adjustment requested.")}
                className="text-xs h-8"
              >
                Change concurrency
              </Button>
            </div>
          </div>

          {/* Rates Summary Cards (Matching Screenshot 51!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs text-neutral-400 font-medium">Call cost</p>
              <p className="text-sm font-bold text-neutral-900 mt-1">₹10.00</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">per 60 seconds pulse</p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs text-neutral-400 font-medium">Number rental</p>
              <p className="text-sm font-bold text-neutral-900 mt-1">₹499.00/mo</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">per Indian number</p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs text-neutral-400 font-medium">Concurrency</p>
              <p className="text-sm font-bold text-neutral-900 mt-1">₹999.00/mo</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">per extra concurrent line</p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs text-neutral-400 font-medium">Analytics & Evals</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">Free</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">included in platform</p>
            </div>
          </div>
        </div>
      ) : (
        /* TRANSACTIONS TAB: IMMUTABLE FINANCIAL LEDGER */
        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Double-Entry Financial Ledger</h3>
            <span className="text-xs text-neutral-400">All amounts in INR (Paise)</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold text-[10px] uppercase">
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
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-50/80">
                  <td className="py-3.5 px-4 font-sans font-semibold text-neutral-900">
                    <p>{tx.description}</p>
                    <span className="text-[10px] font-mono text-neutral-400">{tx.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <Badge variant={tx.amountPaise > 0 ? "success" : "secondary"}>
                      {tx.type}
                    </Badge>
                  </td>
                  <td
                    className={`py-3.5 px-4 font-bold ${
                      tx.amountPaise > 0 ? "text-emerald-600" : "text-neutral-900"
                    }`}
                  >
                    {tx.amountPaise > 0 ? `+${formatCurrency(tx.amountPaise)}` : formatCurrency(tx.amountPaise)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-neutral-800">
                    {formatCurrency(tx.balanceAfterPaise)}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500 font-sans">
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    <button
                      onClick={() => alert(`Downloading GST Tax Invoice for ${tx.id}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
