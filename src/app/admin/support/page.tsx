"use client";

import React, { useState } from "react";
import {
  Headphones,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

interface Ticket {
  id: string;
  workspaceName: string;
  email: string;
  subject: string;
  priority: "critical" | "high" | "normal";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  messages: { sender: "user" | "admin"; text: string; time: string }[];
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-401",
    workspaceName: "FinTech India HQ",
    email: "vikram@fintechcorp.in",
    subject: "Requesting 50 additional SIP concurrency channels for loan campaign",
    priority: "high",
    status: "open",
    createdAt: "15 mins ago",
    messages: [
      {
        sender: "user",
        text: "Hi support, our outbound loan recovery campaign needs 50 concurrent channels instead of current 25. Please review and increase.",
        time: "15 mins ago",
      },
    ],
  },
  {
    id: "TKT-402",
    workspaceName: "PolicyBazaar Telesales",
    email: "rahul.gupta@policybazaar.com",
    subject: "Cartesia voice latency experiencing 150ms spikes on Mumbai trunk",
    priority: "critical",
    status: "in_progress",
    createdAt: "1 hour ago",
    messages: [
      {
        sender: "user",
        text: "We noticed TTFT increased from 240ms to ~410ms on voice ID sonic-en-in-male-1.",
        time: "1 hour ago",
      },
      {
        sender: "admin",
        text: "Investigating wholesale trunk routing. We rerouted your traffic through Frankfurt fallback cluster.",
        time: "40 mins ago",
      },
    ],
  },
  {
    id: "TKT-403",
    workspaceName: "Practo Health Care Line",
    email: "clinics@practo.com",
    subject: "Invoice GST number update for October billing cycle",
    priority: "normal",
    status: "resolved",
    createdAt: "Yesterday",
    messages: [
      {
        sender: "user",
        text: "Please regenerate our GST invoice #8192 with GSTIN: 27AAAAA0000A1Z5.",
        time: "Yesterday",
      },
      {
        sender: "admin",
        text: "Updated invoice generated and emailed to your finance team.",
        time: "Yesterday",
      },
    ],
  },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState("");
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;

    const updated = tickets.map((t) => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: "in_progress" as const,
          messages: [
            ...t.messages,
            { sender: "admin" as const, text: replyText.trim(), time: "Just now" },
          ],
        };
      }
      return t;
    });

    setTickets(updated);
    setActiveTicket((prev) =>
      prev
        ? {
            ...prev,
            status: "in_progress",
            messages: [
              ...prev.messages,
              { sender: "admin", text: replyText.trim(), time: "Just now" },
            ],
          }
        : null
    );
    setReplyText("");
  };

  const handleResolve = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "resolved" as const } : t))
    );
    if (activeTicket && activeTicket.id === id) {
      setActiveTicket((prev) => (prev ? { ...prev, status: "resolved" } : null));
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Client Support Desk & Inquiries
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Respond to customer support tickets, telephony inquiries, and infrastructure escalations.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ticket ID, subject, workspace..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Tickets List */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Workspace</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{t.workspaceName}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium max-w-md truncate">
                    {t.subject}
                  </td>
                  <td className="py-3.5 px-4">
                    {t.priority === "critical" && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Critical
                      </span>
                    )}
                    {t.priority === "high" && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        High
                      </span>
                    )}
                    {t.priority === "normal" && (
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === "resolved" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <Clock className="h-3 w-3" />
                        <span className="capitalize">{t.status.replace("_", " ")}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">{t.createdAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveTicket(t)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Open & Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Drawer / Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {activeTicket.id} • {activeTicket.workspaceName}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{activeTicket.subject}</h3>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activeTicket.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    m.sender === "admin"
                      ? "bg-emerald-50 border border-emerald-200/80 ml-8 text-slate-900"
                      : "bg-slate-50 border border-slate-200/80 mr-8 text-slate-900"
                  }`}
                >
                  <div className="flex justify-between font-bold text-[10px] text-slate-500">
                    <span>{m.sender === "admin" ? "Voxera Support Team" : activeTicket.email}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your official administrative reply..."
                className="w-full h-20 p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleResolve(activeTicket.id)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
