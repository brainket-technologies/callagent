"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileText,
  X,
  Volume2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CallLog {
  id: string;
  workspaceName: string;
  caller: string;
  callee: string;
  durationSec: number;
  costPaise: number;
  status: "completed" | "failed" | "busy" | "in_progress";
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
  transcript?: string;
}

interface MsgLog {
  id: string;
  workspaceName: string;
  channel: "WhatsApp" | "SMS";
  recipient: string;
  direction: "outbound" | "inbound";
  messageText: string;
  status: "delivered" | "sent" | "failed";
  costPaise: number;
  timestamp: string;
}

const MOCK_CALLS: CallLog[] = [
  {
    id: "call-901",
    workspaceName: "FinTech India HQ",
    caller: "+91 80 4718 9000",
    callee: "+91 98765 43210",
    durationSec: 114,
    costPaise: 2000, // ₹20.00
    status: "completed",
    sentiment: "positive",
    timestamp: "10 mins ago",
    transcript: "Agent: Hi! Welcome to FinTech support. How can I help you today?\nCustomer: Hello, I wanted to know the EMI status of my loan application.\nAgent: Sure, your application #9821 has been approved and disbursed.",
  },
  {
    id: "call-902",
    workspaceName: "PolicyBazaar Telesales",
    caller: "+91 80 4718 9001",
    callee: "+91 98200 11223",
    durationSec: 86,
    costPaise: 1500, // ₹15.00
    status: "completed",
    sentiment: "positive",
    timestamp: "24 mins ago",
    transcript: "Agent: Hello Vikram, calling regarding your health insurance quotation.\nCustomer: Yes, please send me the comparison details on WhatsApp.",
  },
  {
    id: "call-903",
    workspaceName: "Zomato Restaurant Support",
    caller: "+91 80 4718 9002",
    callee: "+91 97111 88990",
    durationSec: 32,
    costPaise: 1000,
    status: "busy",
    sentiment: "neutral",
    timestamp: "45 mins ago",
  },
  {
    id: "call-904",
    workspaceName: "Practo Health Care Line",
    caller: "+91 80 4718 9004",
    callee: "+91 94000 55667",
    durationSec: 145,
    costPaise: 3000,
    status: "completed",
    sentiment: "neutral",
    timestamp: "1 hour ago",
    transcript: "Agent: Practo Health reminder. Your dental appointment with Dr. Mehta is confirmed for tomorrow at 4 PM.",
  },
];

const MOCK_MESSAGES: MsgLog[] = [
  {
    id: "msg-101",
    workspaceName: "FinTech India HQ",
    channel: "WhatsApp",
    recipient: "+91 98765 43210",
    direction: "outbound",
    messageText: "Your EMI loan receipt #8192 for ₹14,500 has been received successfully.",
    status: "delivered",
    costPaise: 50, // ₹0.50
    timestamp: "8 mins ago",
  },
  {
    id: "msg-102",
    workspaceName: "PolicyBazaar Telesales",
    channel: "WhatsApp",
    recipient: "+91 98200 11223",
    direction: "outbound",
    messageText: "Here is your customized Max Life Insurance comparison brochure: https://voxera.ai/docs/brochure.pdf",
    status: "delivered",
    costPaise: 50,
    timestamp: "20 mins ago",
  },
  {
    id: "msg-103",
    workspaceName: "Zomato Restaurant Support",
    channel: "SMS",
    recipient: "+91 97111 88990",
    direction: "outbound",
    messageText: "Zomato Partner: Order #4489 has been picked up by the delivery executive.",
    status: "sent",
    costPaise: 25,
    timestamp: "40 mins ago",
  },
];

export default function AdminCallsPage() {
  const [tab, setTab] = useState<"calls" | "messages">("calls");
  const [search, setSearch] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const filteredCalls = MOCK_CALLS.filter(
    (c) =>
      c.callee.includes(search) ||
      c.caller.includes(search) ||
      c.workspaceName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMessages = MOCK_MESSAGES.filter(
    (m) =>
      m.recipient.includes(search) ||
      m.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
      m.messageText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Call & Message Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telephony sessions, duration, wholesale carrier deductions, and WhatsApp messages.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <button
            onClick={() => setTab("calls")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tab === "calls"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Voice Calls ({MOCK_CALLS.length})</span>
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              tab === "messages"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Messages ({MOCK_MESSAGES.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by phone number, workspace name..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Voice Calls Table */}
      {tab === "calls" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Call ID</th>
                  <th className="py-3 px-4">Workspace</th>
                  <th className="py-3 px-4">Callee Number</th>
                  <th className="py-3 px-4">Caller DID</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Billed Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{call.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{call.workspaceName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{call.callee}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{call.caller}</td>
                    <td className="py-3 px-4 font-mono">
                      {Math.floor(call.durationSec / 60)}m {call.durationSec % 60}s
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatCurrency(call.costPaise)}
                    </td>
                    <td className="py-3 px-4">
                      {call.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="h-3 w-3" />
                          <span className="capitalize">{call.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{call.timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 ml-auto transition cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span>Transcript</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages Table */}
      {tab === "messages" && (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Msg ID</th>
                  <th className="py-3 px-4">Workspace</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{msg.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{msg.workspaceName}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        {msg.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{msg.recipient}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{msg.messageText}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(msg.costPaise)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="capitalize">{msg.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{msg.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Call Transcript: {selectedCall.id}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedCall.workspaceName} • {selectedCall.callee}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 max-h-72 overflow-y-auto">
              {selectedCall.transcript || "No transcript recorded for this session."}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="font-semibold text-slate-600">
                Duration: {selectedCall.durationSec}s • Billed: {formatCurrency(selectedCall.costPaise)}
              </span>
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
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
