"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  MapPin,
  PhoneCall,
  Lock,
  Globe,
  ExternalLink,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";

export function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  const footerSections = {
    products: [
      { label: "Voice Telephony (SIP & WebRTC)", href: "/#features" },
      { label: "WhatsApp AI Agents", href: "/use-cases" },
      { label: "Parrot Speech-to-Text (STT)", href: "/models/speech-to-text" },
      { label: "In-Browser Voice Widget", href: "/#features" },
      { label: "Omnichannel Gateway", href: "/#features" },
      { label: "Carrier Trunking (Tata & Twilio)", href: "/#telephony" },
    ],
    resources: [
      { label: "Case Studies", href: "/case-studies" },
      { label: "Industries", href: "/industries" },
      { label: "Use Cases", href: "/use-cases" },
      { label: "Developer API Docs", href: "/docs" },
      { label: "Engineering Blog", href: "/blog" },
      { label: "Telecom Compliance Guide", href: "/docs" },
      { label: "Buying Guide & TCO", href: "/pricing" },
    ],
    company: [
      { label: "Pricing & Rate Cards", href: "/pricing" },
      { label: "About Us", href: "/about" },
      { label: "Book a Demo", href: "/book-a-demo" },
      { label: "Contact Us", href: "/contact" },
      { label: "Super Admin Plane", href: "/admin" },
      { label: "Developer Studio", href: "/dashboard/assistants" },
    ],
    legal: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Trust Center & Compliance", href: "/security" },
      { label: "Grievance Officer", href: "/contact" },
      { label: "TRAI Telephony Regulations", href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      {/* Top Pre-Footer / Newsletter Callout */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Get enterprise voice AI intelligence delivered to your inbox
            </h3>
            <p className="text-xs text-slate-500">
              Weekly teardowns of low-latency speech pipelines, telephony routing, and conversational AI benchmarks.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter work email..."
              required
              className="h-10 w-full md:w-72 rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#11E97F] focus:outline-none focus:ring-2 focus:ring-[#11E97F]/20 shadow-2xs"
            />
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] px-4 text-xs font-black text-[#0A0E1A] shadow-xs hover:shadow-md hover:shadow-[#11E97F]/30 transition cursor-pointer"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info & Address Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black text-sm shadow-xs">
                <Radio className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {BRAND_CONFIG.name}
                </span>
                <span className="h-2 w-2 rounded-xs bg-[#11E97F]" />
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Autonomous enterprise voice AI platform for high-scale call centers, fintech lead qualification, debt collection, and customer success.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>168, 19th Main Rd, HSR Layout Sector 4, Bengaluru, Karnataka 560102</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="hover:text-slate-900 transition">
                  {BRAND_CONFIG.supportEmail}
                </a>
              </div>
            </div>

            {/* Compliance Trust Badges */}
            <div className="pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Certifications & Compliance
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-700">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">SOC 2 Type II</span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">ISO 27001</span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">HIPAA Compliant</span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">GDPR Ready</span>
              </div>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Products
            </p>
            <ul className="space-y-2 text-xs">
              {footerSections.products.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-slate-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Resources
            </p>
            <ul className="space-y-2 text-xs">
              {footerSections.resources.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-slate-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Company
            </p>
            <ul className="space-y-2 text-xs">
              {footerSections.company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-slate-900 transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-2">
                Legal
              </p>
              <ul className="space-y-2 text-xs">
                {footerSections.legal.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-slate-500 hover:text-slate-900 transition">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 {BRAND_CONFIG.companyName} All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/terms" className="hover:text-slate-900 transition">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Trust Center</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Grievance Officer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
