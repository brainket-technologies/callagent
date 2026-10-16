"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radio,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Menu,
  X,
  Phone,
  Sparkles,
  ShieldCheck,
  Building2,
  Stethoscope,
  Pill,
  TrendingUp,
  Truck,
  Mic,
  Briefcase,
  Layers,
  BookOpen,
  FileText,
  FileCode2,
  Calendar,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();
  const [caseStudiesOpen, setCaseStudiesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const caseStudiesDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        caseStudiesDropdownRef.current &&
        !caseStudiesDropdownRef.current.contains(e.target as Node)
      ) {
        setCaseStudiesOpen(false);
      }
      if (
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(e.target as Node)
      ) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const caseStudiesList = [
    {
      name: "PolicyBazaar",
      slug: "policybazaar",
      desc: "Instant lead qualification and insurance policy drop-off recovery",
      icon: TrendingUp,
      metric: "+38% Conversions",
    },
    {
      name: "Practo",
      slug: "practo",
      desc: "Automated clinic appointment booking and patient check-in reminders",
      icon: Stethoscope,
      metric: "~1,000 daily bookings",
    },
    {
      name: "PharmEasy",
      slug: "pharmeasy",
      desc: "Prescription verification and repeat order automated re-engagement",
      icon: Pill,
      metric: "72% call resolution",
    },
    {
      name: "Smallcase",
      slug: "smallcase",
      desc: "KYC assistance and equity investment advisory re-engagement",
      icon: Building2,
      metric: "3.2x ROI on BPO cost",
    },
    {
      name: "Ekart Logistics",
      slug: "ekart",
      desc: "Address verification, delivery reschedule and failed dispatch calls",
      icon: Truck,
      metric: "Sub-300ms verification",
    },
  ];

  const resourcesList = [
    {
      name: "Parrot Speech-to-Text",
      href: "/models/speech-to-text",
      desc: "Ultra-low latency STT optimized for Indian accents & dialects",
      icon: Mic,
    },
    {
      name: "Industries",
      href: "/industries",
      desc: "Tailored voice AI solutions for BFSI, Healthcare, D2C, Logistics",
      icon: Briefcase,
    },
    {
      name: "Use Cases",
      href: "/use-cases",
      desc: "Inbound support, outbound reminder, debt collection & surveys",
      icon: Layers,
    },
    {
      name: "Developer API Docs",
      href: "/docs",
      desc: "REST APIs, WebSocket live streams, Webhooks & Python SDKs",
      icon: FileCode2,
    },
    {
      name: "Engineering Blog",
      href: "/blog",
      desc: "Insights on audio pipelines, SIP trunking, and voice AI benchmarks",
      icon: BookOpen,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Logo with HackerRank Green Block */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black text-sm shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition">
            <Radio className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
              {BRAND_CONFIG.name}
            </span>
            <span className="h-2 w-2 rounded-xs bg-[#11E97F]" title="Brand Accent" />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <Link
            href="/docs"
            className={cn(
              "hover:text-slate-900 transition",
              pathname === "/docs" && "text-slate-950 font-bold"
            )}
          >
            API Docs
          </Link>

          <Link
            href="/pricing"
            className={cn(
              "hover:text-slate-900 transition",
              pathname === "/pricing" && "text-slate-950 font-bold"
            )}
          >
            Pricing
          </Link>

          {/* Case Studies Dropdown */}
          <div className="relative" ref={caseStudiesDropdownRef}>
            <button
              onClick={() => {
                setCaseStudiesOpen(!caseStudiesOpen);
                setResourcesOpen(false);
              }}
              className={cn(
                "flex items-center gap-1 hover:text-slate-900 transition cursor-pointer py-2",
                caseStudiesOpen && "text-slate-950 font-bold"
              )}
            >
              <span>Case Studies</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  caseStudiesOpen && "rotate-180"
                )}
              />
            </button>

            {caseStudiesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl animate-in fade-in-50 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Enterprise Proof Points
                  </p>
                </div>
                <div className="space-y-1">
                  {caseStudiesList.map((cs) => {
                    const Icon = cs.icon;
                    return (
                      <Link
                        key={cs.slug}
                        href={`/case-studies/${cs.slug}`}
                        onClick={() => setCaseStudiesOpen(false)}
                        className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 transition group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-[#11E97F] group-hover:text-[#0A0E1A] transition">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                              {cs.name}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                              {cs.metric}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{cs.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2 px-1">
                  <Link
                    href="/case-studies"
                    onClick={() => setCaseStudiesOpen(false)}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50/80 rounded-lg transition"
                  >
                    <span>View all case studies</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative" ref={resourcesDropdownRef}>
            <button
              onClick={() => {
                setResourcesOpen(!resourcesOpen);
                setCaseStudiesOpen(false);
              }}
              className={cn(
                "flex items-center gap-1 hover:text-slate-900 transition cursor-pointer py-2",
                resourcesOpen && "text-slate-950 font-bold"
              )}
            >
              <span>Resources</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  resourcesOpen && "rotate-180"
                )}
              />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-76 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl animate-in fade-in-50 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Architecture & Insights
                  </p>
                </div>
                <div className="space-y-1">
                  {resourcesList.map((res) => {
                    const Icon = res.icon;
                    return (
                      <Link
                        key={res.name}
                        href={res.href}
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 transition group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#11E97F] group-hover:text-[#0A0E1A] transition">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                            {res.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{res.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/book-a-demo"
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs transition"
          >
            Book a Demo
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition px-2 py-1"
          >
            Sign In
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              API Docs
            </Link>
            <Link
              href="/case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Case Studies
            </Link>
            <Link
              href="/models/speech-to-text"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Speech-to-Text
            </Link>
            <Link
              href="/industries"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Industries
            </Link>
            <Link
              href="/use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Use Cases
            </Link>
            <Link
              href="/book-a-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 font-bold"
            >
              Book a Demo
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#11E97F] text-[#0A0E1A] font-extrabold text-xs shadow-sm"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
