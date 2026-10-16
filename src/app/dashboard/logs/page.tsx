"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { sampleTranscriptLines } from "@/lib/mock-data";
import { CallSession } from "@/types";
import {
  Clock,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  PhoneIncoming,
  PhoneOutgoing,
  Sparkles,
  ChevronRight,
  X,
  Volume2,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LogsPage() {
  const { calls } = useStore();

  const [channelTab, setChannelTab] = useState<"phone" | "whatsapp" | "workflows">("phone");
  const [selectedCall, setSelectedCall] = useState<CallSession | null>(calls[0] || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<"1x" | "1.25x" | "1.5x">("1x");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCalls = calls.filter((c) =>
    c.calleeNumber.includes(searchQuery) ||
    c.assistantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const transcripts = selectedCall ? sampleTranscriptLines[selectedCall.id] || [
    { id: "1", speaker: "agent", text: `Hi, this is ${selectedCall.assistantName} calling from our company. Am I speaking with Rahul?`, timestampSec: 0 },
    { id: "2", speaker: "user", text: "Yes, speaking.", timestampSec: 3 },
    { id: "3", speaker: "agent", text: "I am calling regarding your recent request. Everything is ready to proceed.", timestampSec: 6 },
    { id: "4", speaker: "user", text: "Sounds good, please go ahead.", timestampSec: 10 },
    { id: "5", speaker: "agent", text: "Done! You will receive an update shortly. Bye.", timestampSec: 13 },
  ] : [];

  const handlePlayToggle = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Call Logs & Telemetry</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Complete inspection of call recordings, diarized transcripts, latencies, and billing deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => alert("Exported 4 call records to CSV.")}
            className="text-xs h-9 border-neutral-200"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Subtabs & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
        <div className="flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold w-fit">
          <button
            onClick={() => setChannelTab("phone")}
            className={`rounded-lg px-4 py-1.5 transition ${
              channelTab === "phone" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Phone
          </button>
          <button
            onClick={() => setChannelTab("whatsapp")}
            className={`rounded-lg px-4 py-1.5 transition ${
              channelTab === "whatsapp" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setChannelTab("workflows")}
            className={`rounded-lg px-4 py-1.5 transition ${
              channelTab === "workflows" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Workflows
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            Date range: 15 Sep - 15 Oct
          </span>
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
            {filteredCalls.length} calls
          </span>
        </div>
      </div>

      {/* Table & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by phone number or assistant..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Assistant</th>
                  <th className="py-3 px-4">Callee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`cursor-pointer transition-colors ${
                      selectedCall?.id === call.id ? "bg-neutral-100/70" : "hover:bg-neutral-50/80"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{call.assistantName}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">{call.calleeNumber}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          call.status === "completed"
                            ? "success"
                            : call.status === "busy"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {call.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{formatDuration(call.durationSeconds)}</td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{formatCurrency(call.costPaise)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="h-4 w-4 text-neutral-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Inspection Drawer */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-5">
          {selectedCall ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Call Inspection</h3>
                  <p className="text-xs font-mono text-neutral-400">{selectedCall.id}</p>
                </div>
                <Badge variant={selectedCall.status === "completed" ? "success" : "warning"}>
                  {selectedCall.status}
                </Badge>
              </div>

              {/* Waveform Player */}
              <div className="rounded-xl bg-neutral-950 p-4 text-white space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    <span>Recording Audio (Dual-Channel)</span>
                  </span>
                  <span className="font-mono text-emerald-400">
                    {formatDuration(selectedCall.durationSeconds)}
                  </span>
                </div>

                {/* Scrubable Waveform visualizer */}
                <div className="flex h-12 items-center gap-1 rounded bg-neutral-900 px-3">
                  {[40, 65, 30, 85, 95, 55, 70, 30, 60, 80, 45, 90, 65, 50, 75, 40, 85, 35, 60, 50, 70].map(
                    (val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${val}%` }}
                        className={`flex-1 rounded-full transition-all ${
                          isPlayingAudio && idx < 12 ? "bg-emerald-400" : "bg-neutral-700"
                        }`}
                      />
                    )
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handlePlayToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-neutral-200 transition"
                  >
                    {isPlayingAudio ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPlaybackSpeed(playbackSpeed === "1x" ? "1.25x" : playbackSpeed === "1.25x" ? "1.5x" : "1x")}
                      className="rounded bg-neutral-800 px-2 py-1 text-[11px] font-mono text-neutral-300 hover:bg-neutral-700"
                    >
                      {playbackSpeed}
                    </button>
                    <button
                      onClick={() => alert("Downloading raw WAV dual-channel audio file...")}
                      className="rounded bg-neutral-800 p-1.5 text-neutral-300 hover:bg-neutral-700"
                      title="Download audio WAV"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Latency Waterfall Breakdown */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-neutral-600" />
                    Turnaround Latency Breakdown
                  </span>
                  <span className="text-emerald-700 font-mono">
                    ~{selectedCall.sttLatencyMs + selectedCall.ttftMs + selectedCall.ttsLatencyMs}ms Total E2E
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="rounded-lg bg-white p-2 border border-neutral-200 text-center">
                    <p className="text-neutral-400">STT Transcribe</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{selectedCall.sttLatencyMs}ms</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-neutral-200 text-center">
                    <p className="text-neutral-400">LLM TTFT</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{selectedCall.ttftMs}ms</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-neutral-200 text-center">
                    <p className="text-neutral-400">TTS Audio Byte</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{selectedCall.ttsLatencyMs}ms</p>
                  </div>
                </div>
              </div>

              {/* Speaker Diarized Transcript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                  <span>Diarized Transcript</span>
                  <span className="text-[10px] text-neutral-400">{transcripts.length} utterances</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 p-3 text-xs">
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`flex flex-col ${
                        t.speaker === "agent" ? "items-start" : "items-end"
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 mb-0.5">
                        {t.speaker === "agent" ? selectedCall.assistantName : "Callee"} • {formatDuration(t.timestampSec)}
                      </span>
                      <div
                        className={`rounded-xl px-3 py-2 max-w-[88%] leading-relaxed ${
                          t.speaker === "agent"
                            ? "bg-white border border-neutral-200 text-neutral-900 shadow-sm"
                            : "bg-neutral-900 text-white"
                        }`}
                      >
                        {t.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Structured JSON Data */}
              {selectedCall.structuredData && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-1.5 text-xs">
                  <p className="font-bold text-neutral-800">Post-Call Analysis Extraction</p>
                  <pre className="font-mono text-[11px] text-neutral-700 bg-white p-2 rounded border border-neutral-200 overflow-x-auto">
                    {JSON.stringify(selectedCall.structuredData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-neutral-400">
              Select a call record to view waveform recording and transcript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
