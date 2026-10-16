"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function BlogIndexPage() {
  const posts = [
    {
      title: "How We Optimized WebRTC and Opus Audio to Beat 300ms Conversational Latency",
      snippet: "A deep dive into packet-loss concealment, jitter buffers, and zero-allocation C++ audio pipelines handling Indian telecom carrier trunks.",
      date: "Oct 12, 2026",
      readTime: "7 min read",
      category: "Engineering",
    },
    {
      title: "Why Vernacular Hinglish Speech Requires Hybrid Phonetic Normalization",
      snippet: "How standard acoustic models misinterpret code-switched phrases like 'bhai order kab aayega' and how custom SSML dictionaries solve it.",
      date: "Oct 04, 2026",
      readTime: "5 min read",
      category: "Speech AI",
    },
    {
      title: "The Death of Per-Seat BPO Call Centers: Unit Economics of Autonomous Voice",
      snippet: "Comparing the fully loaded cost of human agents (₹25,000/mo) against 100% metered per-second cloud telephony at ₹7/min.",
      date: "Sep 28, 2026",
      readTime: "9 min read",
      category: "Economics",
    },
    {
      title: "TRAI Telephony Compliance: How to Handle Consent, DND and DLT Registration",
      snippet: "A practical guide for Indian tech teams setting up outbound voice campaigns without risking carrier disconnection or spam flags.",
      date: "Sep 18, 2026",
      readTime: "6 min read",
      category: "Compliance",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span>Engineering & Telephony Insights</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            {BRAND_CONFIG.name} Engineering Blog
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Technical teardowns, latency benchmarks, and architectural designs from our speech intelligence research group.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div
              key={post.title}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:border-[#11E97F] hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900 leading-snug hover:text-emerald-700 transition cursor-pointer">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{post.snippet}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-emerald-700 transition cursor-pointer">
                  <span>Read full article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
