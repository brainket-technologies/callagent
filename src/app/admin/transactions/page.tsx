"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  workspaceName: string;
  type: "recharge" | "call_usage" | "phone_rental";
  amountPaise: number;
  balanceAfterPaise: number;
  gateway: string;
  status: "success" | "pending" | "failed";
  timestamp: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-88201",
    workspaceName: "FinTech India HQ",
    type: "recharge",
    amountPaise: 5000000, // ₹50,000
    balanceAfterPaise: 5000000,
    gateway: "Razorpay (UPI)",
    status: "success",
    timestamp: "Today, 02:40 PM",
  },
  {
    id: "TXN-88202",
    workspaceName: "PolicyBazaar Telesales",
    type: "recharge",
    amountPaise: 10000000, // ₹1,00,000
    balanceAfterPaise: 12500000,
    gateway: "Stripe (Corporate Card)",
    status: "success",
    timestamp: "Today, 11:15 AM",
  },
  {
    id: "TXN-88203",
    workspaceName: "Zomato Restaurant Support",
    type: "call_usage",
    amountPaise: 350000, // ₹3,500
    balanceAfterPaise: 1800000,
    gateway: "Internal Metering",
    status: "success",
    timestamp: "Today, 09:30 AM",
  },
  {
    id: "TXN-88204",
    workspaceName: "Practo Health Care Line",
    type: "phone_rental",
    amountPaise: 150000, // ₹1,500
    balanceAfterPaise: 8200000,
    gateway: "Monthly Recurring",
    status: "success",
    timestamp: "Yesterday, 04:12 PM",
  },
  {
    id: "TXN-88205",
    workspaceName: "Spam Caller Test Org",
    type: "recharge",
    amountPaise: 100000, // ₹1,000
    balanceAfterPaise: 25000,
    gateway: "Razorpay (NetBanking)",
    status: "failed",
    timestamp: "2 days ago",
  },
];

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "recharge" | "usage">("all");

  const filteredTxns = MOCK_TRANSACTIONS.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
      t.gateway.toLowerCase().includes(search.toLowerCase());

    if (filterType === "recharge") return matchesSearch && t.type === "recharge";
    if (filterType === "usage") return matchesSearch && t.type !== "recharge";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Ledger & Transactions (Txn)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit customer wallet deposits, gateway reconciliations, and telephony usage debits.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading consolidated financial CSV ledger.")}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Recharge Deposits</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(15000000)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">100% gateway verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Telephony Debits</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(500000)}</p>
          <p className="text-[11px] text-slate-500">Real-time billed duration</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Active Gateways</p>
          <p className="text-2xl font-bold text-slate-900">Razorpay • Stripe</p>
          <p className="text-[11px] text-emerald-600 font-semibold">0.02% failure rate</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Txn ID, Workspace, Gateway..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "all" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Txns ({MOCK_TRANSACTIONS.length})
          </button>
          <button
            onClick={() => setFilterType("recharge")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "recharge" ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Credits (Recharges)
          </button>
          <button
            onClick={() => setFilterType("usage")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === "usage" ? "bg-purple-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Debits (Call Usage)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Workspace</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.map((t) => {
                const isCredit = t.type === "recharge";

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{t.workspaceName}</td>
                    <td className="py-3.5 px-4">
                      {isCredit ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
                          <span>Wallet Topup</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <ArrowUpRight className="h-3 w-3 text-purple-600" />
                          <span>Usage Debit</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={isCredit ? "text-emerald-700" : "text-slate-900"}>
                        {isCredit ? "+" : "-"}
                        {formatCurrency(t.amountPaise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {formatCurrency(t.balanceAfterPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{t.gateway}</td>
                    <td className="py-3.5 px-4">
                      {t.status === "success" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">{t.timestamp}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloaded receipt for ${t.id}`)}
                        className="text-slate-400 hover:text-slate-900 transition p-1 cursor-pointer"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
