"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  UploadCloud,
  FileCode,
  Copy,
  ExternalLink,
  Sparkles,
  Clock,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function SttLabsPage() {
  const [language, setLanguage] = useState("Hindi");
  const [punctuation, setPunctuation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [activeOutputTab, setActiveOutputTab] = useState<"transcription" | "code">("transcription");

  const [transcriptResult, setTranscriptResult] = useState<string>(
    "नमस्ते, मैं आपकी क्या सहायता कर सकता हूँ? क्या आप मुझे अपने आर्डर का स्टेटस बता सकते हैं?"
  );

  const [simulatedMetrics, setSimulatedMetrics] = useState({
    computeLatency: 114,
    audioDuration: 3.42,
    processingTime: 0.18,
  });

  const pythonSnippet = `from ${BRAND_CONFIG.pythonSdk.replace("-", "_")} import Client

with Client(api_key="sk_live_00000000-0000-0000-000000000000") as client:
    result = client.transcribe("sample.wav", language="${language === "Hindi" ? "hi" : "en"}", enable_cap_punc=${punctuation})
    print(result.transcription)
    print(f"Latency: {result.compute_latency_ms}ms")`;

  const handleTranscribeLive = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setTranscriptResult(
          language === "Hindi"
            ? "हाँ बिल्कुल, मैं आज ही अपना लोन रीपेमेंट ऑनलाइन पूरा कर दूँगा।"
            : "Yes certainly, I will complete my loan repayment online today itself."
        );
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Speech To Text</h1>
            <Badge variant="secondary" className="text-[10px]">BETA</Badge>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Transcribe audio in real time using our ultra low-latency speech-to-text API.
          </p>
        </div>

        <button
          onClick={() => alert("STT API documentation: REST transcribe() and WebSocket stream() specs.")}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 shadow-sm flex items-center gap-1.5"
        >
          <span>API docs</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Interactive Testing Sandbox (Matching Screenshot 40!) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="md:col-span-5 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none"
            >
              <option value="Hindi">Hindi (hi)</option>
              <option value="English">English (en-IN)</option>
              <option value="Tamil">Tamil (ta)</option>
              <option value="Bengali">Bengali (bn)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-semibold text-neutral-800">Punctuation & Capitalization</p>
              <p className="text-[11px] text-neutral-400">Automatic grammatical post-processing</p>
            </div>
            <input
              type="checkbox"
              checked={punctuation}
              onChange={(e) => setPunctuation(e.target.checked)}
              className="h-4 w-4 rounded text-neutral-900"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                alert("Simulated audio file upload (sample_call.wav).");
                setTranscriptResult("Hello, can you reschedule my appointment for tomorrow at 4 PM?");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload file (up to 25MB)</span>
            </button>

            <button
              onClick={handleTranscribeLive}
              className={`w-full flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition shadow ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isRecording ? "Listening & Streaming..." : "Transcribe live microphone"}</span>
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="md:col-span-7 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveOutputTab("transcription")}
                className={`rounded-md px-3 py-1 transition ${
                  activeOutputTab === "transcription" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
                }`}
              >
                Transcription
              </button>
              <button
                onClick={() => setActiveOutputTab("code")}
                className={`rounded-md px-3 py-1 transition ${
                  activeOutputTab === "code" ? "bg-white shadow text-neutral-900" : "text-neutral-500"
                }`}
              >
                Code
              </button>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  activeOutputTab === "transcription" ? transcriptResult : pythonSnippet
                );
                alert("Copied to clipboard!");
              }}
              className="text-neutral-400 hover:text-neutral-900 p-1"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {activeOutputTab === "transcription" ? (
            <div className="space-y-4">
              <div className="min-h-36 rounded-xl bg-neutral-50 p-4 text-sm font-medium text-neutral-900 leading-relaxed">
                {transcriptResult}
              </div>

              {/* Telemetry pill values (Matching Screenshot 40!) */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-500 pt-1">
                <span className="rounded bg-neutral-100 px-2 py-0.5">
                  compute_latency: <strong>{simulatedMetrics.computeLatency}ms</strong>
                </span>
                <span className="rounded bg-neutral-100 px-2 py-0.5">
                  audio_duration: <strong>{simulatedMetrics.audioDuration}s</strong>
                </span>
                <span className="rounded bg-neutral-100 px-2 py-0.5">
                  processing_time: <strong>{simulatedMetrics.processingTime}s</strong>
                </span>
              </div>
            </div>
          ) : (
            <pre className="min-h-36 rounded-xl bg-neutral-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {pythonSnippet}
            </pre>
          )}
        </div>
      </div>

      {/* Developer SDK Specs Section (Matching Screenshots 42, 43, 44!) */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900">Python SDK Implementation</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Production-grade Python SDK for {BRAND_CONFIG.name} STT. Transcribe audio files over REST or stream live audio over WebSocket.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded-xl bg-[#0A1128] border border-[#1E305E] px-4 py-2 text-xs font-mono text-cyan-300 shadow-xs">
              pip install {BRAND_CONFIG.pythonSdk}
            </code>
          </div>
        </div>

        {/* REST API specs table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            transcribe() (offline / REST)
          </h4>
          <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Parameter</th>
                <th className="py-2.5 px-4">Default</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">source</td>
                <td className="py-2 px-4 text-neutral-500">—</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Input audio: str, Path, bytes, or BinaryIO</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">language</td>
                <td className="py-2 px-4 text-neutral-500">&quot;hi&quot;</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Language hint sent to transcription proxy</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">enable_cap_punc</td>
                <td className="py-2 px-4 text-neutral-500">True</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Enable capitalization and punctuation</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* WebSocket Streaming specs table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            stream() (real-time / WebSocket)
          </h4>
          <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Parameter</th>
                <th className="py-2.5 px-4">Default</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">sample_rate</td>
                <td className="py-2 px-4 text-neutral-500">16000</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Audio sample rate (16kHz standard)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">vad_tail_sil_ms</td>
                <td className="py-2 px-4 text-neutral-500">200</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Server VAD tail silence in milliseconds</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold text-neutral-900">vad_confidence</td>
                <td className="py-2 px-4 text-neutral-500">0.55</td>
                <td className="py-2 px-4 font-sans text-neutral-600">Server VAD confidence threshold</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
