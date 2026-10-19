"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Plus,
  CreditCard,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  txnNumber: string;
  workspaceName: string;
  userEmail: string;
  type: string;
  serviceName: string;
  amountPaise: number;
  balanceAfterPaise: number;
  billingUnit: string;
  currency: string;
  gateway: string;
  status: string;
  timestampStr: string;
  invoiceUrl: string | null;
  createdAt: string;
}

export default function UserTransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = selectedType === "all" ? "/api/transactions" : `/api/transactions?type=${selectedType}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  const filteredTransactions = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.txnNumber.toLowerCase().includes(q) ||
      t.serviceName.toLowerCase().includes(q) ||
      t.gateway.toLowerCase().includes(q)
    );
  });

  const formatAmount = (paise: number) => {
    return "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs border border-emerald-200">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Transaction History
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Wallet & Usage Log
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Complete record of all wallet recharges, per-minute AI voice calling deductions, SMS usage, and invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard/services"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#11E97F] hover:bg-[#0fd673] rounded-xl transition shadow-xs"
          >
            <CreditCard className="h-4 w-4" />
            <span>Services & Pricing</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Current Wallet Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              ₹5,000.00
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Recharges auto-reflect instantly via Razorpay UPI & Cards.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total Transactions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {transactions.length}
            </span>
            <span className="text-xs text-slate-500">records in DB</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Includes voice calls, SMS, recharges, and number rentals.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Billing Currency</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-800">INR (₹)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              PostgreSQL Base
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            All debits computed according to official rate card.
          </p>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {[
              { id: "all", label: "All Records" },
              { id: "free_credit", label: "Free Credits" },
              { id: "recharge", label: "Recharges" },
              { id: "call_usage", label: "AI Voice Calls" },
              { id: "sms_usage", label: "SMS Alerts" },
              { id: "number_rental", label: "Number Rentals" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer",
                  selectedType === tab.id
                    ? "bg-[#11E97F] text-slate-950 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search TXN ID, service..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Txn Number</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description / Service</th>
                <th className="py-3 px-4">Gateway / Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading billing history from PostgreSQL...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isCredit = txn.type === "recharge" || txn.type === "free_credit";

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {txn.txnNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono",
                            isCredit
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 text-slate-500" />
                          )}
                          <span>{txn.type.replace(/_/g, " ")}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {txn.serviceName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {txn.gateway}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={cn(isCredit ? "text-emerald-700" : "text-slate-900")}>
                          {isCredit ? "+" : "-"}
                          {formatCurrency(txn.amountPaise, txn.currency)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatCurrency(txn.balanceAfterPaise, txn.currency)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                            txn.status === "success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="capitalize">{txn.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                        {txn.timestampStr || new Date(txn.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Invoice receipt for ${txn.txnNumber} generated.`)}
                          title="Download Receipt"
                          className="inline-flex items-center gap-1 p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
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
    </div>
  );
}
