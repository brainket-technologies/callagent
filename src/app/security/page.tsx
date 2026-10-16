"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck2,
  CheckCircle2,
  Download,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function SecurityTrustCenterPage() {
  const certifications = [
    { title: "SOC 2 Type II", status: "Certified", desc: "Annual independent audit of security, availability, and confidentiality controls." },
    { title: "ISO 27001:2022", status: "Certified", desc: "Certified Information Security Management System (ISMS) across all infrastructure." },
    { title: "HIPAA Compliant", status: "Verified", desc: "Signed Business Associate Agreements (BAAs) available for healthcare partners." },
    { title: "GDPR & DPDP Act Ready", status: "Compliant", desc: "Full adherence to European GDPR and Indian Digital Personal Data Protection standards." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Enterprise Security & Trust Center</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            Enterprise-Grade Security by Design
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Review our certifications, penetration testing reports, and real-time infrastructure security controls.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {certifications.map((c) => (
            <div key={c.title} className="p-7 rounded-3xl border border-slate-200 bg-white space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{c.title}</h3>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Security Controls Breakdown */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Infrastructure Security Controls</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>TLS 1.3 / SRTP:</strong> All SIP signaling and RTP audio packets are encrypted end-to-end.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Role-Based Access Control (RBAC):</strong> Granular permissions for workspace owners, developers, and billing managers.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Vulnerability Scans:</strong> Continuous automated vulnerability scanning and semi-annual third-party penetration tests.</span>
            </li>
          </ul>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
