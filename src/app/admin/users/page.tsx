"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  Unlock,
  Eye,
  X,
  Building,
  Mail,
  Wallet,
  PhoneCall,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientUser {
  id: string;
  workspaceName: string;
  slug: string;
  ownerEmail: string;
  balancePaise: number;
  totalCalls: number;
  concurrencyLimit: number;
  status: "active" | "blocked";
  assignedPhone: string;
  createdAt: string;
}

const INITIAL_CLIENTS: ClientUser[] = [
  {
    id: "ws-1",
    workspaceName: "FinTech India HQ",
    slug: "fintech-india",
    ownerEmail: "vikram@fintechcorp.in",
    balancePaise: 4500000, // ₹45,000
    totalCalls: 14200,
    concurrencyLimit: 25,
    status: "active",
    assignedPhone: "+91 80 4718 9000",
    createdAt: "2026-09-12",
  },
  {
    id: "ws-2",
    workspaceName: "PolicyBazaar Telesales",
    slug: "policybazaar-tele",
    ownerEmail: "rahul.gupta@policybazaar.com",
    balancePaise: 12500000, // ₹1,25,000
    totalCalls: 38400,
    concurrencyLimit: 50,
    status: "active",
    assignedPhone: "+91 80 4718 9001",
    createdAt: "2026-08-20",
  },
  {
    id: "ws-3",
    workspaceName: "Zomato Restaurant Support",
    slug: "zomato-support",
    ownerEmail: "partnerops@zomato.com",
    balancePaise: 1800000, // ₹18,000
    totalCalls: 8900,
    concurrencyLimit: 20,
    status: "active",
    assignedPhone: "+91 80 4718 9002",
    createdAt: "2026-09-01",
  },
  {
    id: "ws-4",
    workspaceName: "Spam Caller Test Org",
    slug: "spam-caller-test",
    ownerEmail: "rohit@testtelecom.org",
    balancePaise: 25000, // ₹250
    totalCalls: 450,
    concurrencyLimit: 5,
    status: "blocked",
    assignedPhone: "+91 80 4718 9003",
    createdAt: "2026-10-02",
  },
  {
    id: "ws-5",
    workspaceName: "Practo Health Care Line",
    slug: "practo-health",
    ownerEmail: "clinics@practo.com",
    balancePaise: 8200000, // ₹82,000
    totalCalls: 22100,
    concurrencyLimit: 30,
    status: "active",
    assignedPhone: "+91 80 4718 9004",
    createdAt: "2026-07-15",
  },
];

export default function AdminUsersPage() {
  const [clients, setClients] = useState<ClientUser[]>(INITIAL_CLIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [selectedClient, setSelectedClient] = useState<ClientUser | null>(null);

  // Toggle Block / Unblock action
  const handleToggleBlock = (id: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "active" ? "blocked" : "active";
          return { ...c, status: newStatus };
        }
        return c;
      })
    );

    if (selectedClient && selectedClient.id === id) {
      setSelectedClient((prev) =>
        prev ? { ...prev, status: prev.status === "active" ? "blocked" : "active" } : null
      );
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === "all" ? true : c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">User & Workspace Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage registered client tenants, inspect prepaid balances, and block/unblock workspace privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            Total Workspaces: <strong className="text-slate-900">{clients.length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by workspace name or email..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Active ({clients.filter((c) => c.status === "active").length})
          </button>
          <button
            onClick={() => setStatusFilter("blocked")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "blocked"
                ? "bg-red-600 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Blocked ({clients.filter((c) => c.status === "blocked").length})
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Workspace Name</th>
                <th className="py-3 px-4">Owner Email</th>
                <th className="py-3 px-4">Prepaid Balance</th>
                <th className="py-3 px-4">Calls (Logged)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const isBlocked = client.status === "blocked";

                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition">
                    {/* Workspace Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {client.workspaceName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{client.workspaceName}</p>
                          <p className="text-[10px] font-mono text-slate-400">/{client.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {client.ownerEmail}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-emerald-700">
                        {formatCurrency(client.balancePaise)}
                      </span>
                    </td>

                    {/* Calls */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {client.totalCalls.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <Ban className="h-3 w-3" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {client.createdAt}
                    </td>

                    {/* Actions: Block/Unblock & Details */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Details Button */}
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>Details</span>
                        </button>

                        {/* Block / Unblock Button */}
                        <button
                          onClick={() => handleToggleBlock(client.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                            isBlocked
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {isBlocked ? (
                            <>
                              <Unlock className="h-3.5 w-3.5" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              <span>Block</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          WORKSPACE DETAILS MODAL
          ========================================================================= */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {selectedClient.workspaceName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedClient.workspaceName}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedClient.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Owner Email
                </span>
                <span className="font-mono font-bold text-slate-900">{selectedClient.ownerEmail}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-slate-400" />
                  Prepaid Balance
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(selectedClient.balancePaise)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-400" />
                  Assigned Phone DID
                </span>
                <span className="font-mono font-bold text-slate-900">{selectedClient.assignedPhone}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  Concurrency Limit
                </span>
                <span className="font-bold text-slate-900">{selectedClient.concurrencyLimit} Channels</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Registered Date
                </span>
                <span className="font-medium text-slate-700">{selectedClient.createdAt}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Current Account State</span>
                <span>
                  {selectedClient.status === "blocked" ? (
                    <span className="font-bold text-red-600">Blocked (Telephony Suspended)</span>
                  ) : (
                    <span className="font-bold text-emerald-600">Active (Fully Provisioned)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleBlock(selectedClient.id)}
                className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  selectedClient.status === "blocked"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {selectedClient.status === "blocked" ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    <span>Unblock Workspace</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    <span>Block Workspace</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedClient(null)}
                className="h-10 px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
