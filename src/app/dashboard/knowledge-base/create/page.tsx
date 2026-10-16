"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Globe, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateKnowledgeBasePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tab, setTab] = useState<"files" | "urls">("files");
  const [urls, setUrls] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Knowledge base name is required.");
      return;
    }
    alert(`Knowledge base "${name.toLowerCase().replace(/\s+/g, "_")}" created!`);
    router.push("/dashboard/knowledge-base");
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in">
      {/* Header (Matching Screenshot 6!) */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/knowledge-base"
          className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">Create knowledge base</h1>
      </div>

      <div className="space-y-6">
        {/* Name input */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-2">
          <label className="text-xs font-semibold text-neutral-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product Knowledge Base"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
          <p className="text-[11px] text-neutral-400">
            Saved as lowercase with underscores in place of spaces.
          </p>
        </div>

        {/* Upload Files vs Add URLs Tabs */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex border-b border-neutral-100 text-xs font-semibold">
            <button
              onClick={() => setTab("files")}
              className={`pb-3 px-3 transition border-b-2 ${
                tab === "files" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
              }`}
            >
              Upload files
            </button>
            <button
              onClick={() => setTab("urls")}
              className={`pb-3 px-3 transition border-b-2 ${
                tab === "urls" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
              }`}
            >
              Add URLs
            </button>
          </div>

          {tab === "files" ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">Upload files from your device to add them to your knowledge base.</p>

              {!uploadedFileName ? (
                <div
                  onClick={() => setUploadedFileName("company_faqs_and_policies.csv")}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center hover:border-neutral-900 hover:bg-neutral-50 cursor-pointer transition"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 mb-3">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">Drag and drop or click to upload</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Upload a CSV, TSV, or PDF to preview it. Max file size: 20MB
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-neutral-900">{uploadedFileName} (1.2 MB)</span>
                  </div>
                  <button onClick={() => setUploadedFileName(null)} className="text-neutral-500 hover:text-red-500">
                    Remove
                  </button>
                </div>
              )}

              {/* Note callout (Matching Screenshot 6!) */}
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-800">
                <strong>Note:</strong> Structured data (like CSV with clear columns) helps the AI find and match answers faster and more accurately than unstructured text.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">Add web page URLs to crawl and vectorize documentation automatically.</p>
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                rows={4}
                placeholder="https://example.com/pricing&#10;https://example.com/faqs"
                className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs font-mono focus:border-neutral-900 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setName("");
              setUploadedFileName(null);
            }}
          >
            Clear all
          </Button>
          <Button onClick={handleSave} className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
