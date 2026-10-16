"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Send,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Enterprise Telephony Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            Get in Touch with Our Team
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Have questions about SIP trunking, wholesale pricing, or custom vernacular models? We respond within 2 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900">Direct Contact Channels</h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Support & Inquiries</p>
                    <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="text-emerald-700 font-semibold hover:underline">
                      {BRAND_CONFIG.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Enterprise Hotline</p>
                    <p className="font-mono text-slate-800">+91 (080) 4568-9200</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Headquarters (India)</p>
                    <p className="text-slate-500">
                      168, 19th Main Rd, HSR Layout Sector 4, Bengaluru, Karnataka 560102
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Support Hours</p>
                    <p className="text-slate-500">24/7/365 NOC & Telephony Monitoring</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Grievance & Compliance Officer</p>
              <p className="text-slate-500">
                In compliance with Information Technology (Intermediary Guidelines) Rules:
              </p>
              <p className="text-slate-700 font-medium">Mr. Vikramaditya Rao • grievance@voxera.ai</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
              {sent ? (
                <div className="py-12 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you, {formData.name}. Our enterprise telephony engineers will get back to you within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#11E97F] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#11E97F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Inquiry Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#11E97F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">How can we help? *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your call center setup, target languages, and volume..."
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-[#11E97F] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold text-xs shadow-md transition cursor-pointer"
                  >
                    Send Message ➔
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
