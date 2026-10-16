"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Calendar,
  Clock,
  Phone,
  Sparkles,
  Star,
  ShieldCheck,
  Building2,
  Mail,
  User,
  Check,
  PhoneCall,
  X,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function BookADemoPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 Fields
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    workEmail?: string;
    company?: string;
  }>({});
  const [touched, setTouched] = useState(false);

  // Step 2 Fields
  const [callVolume, setCallVolume] = useState("10,000 - 50,000 calls / month");
  const [primaryUseCase, setPrimaryUseCase] = useState("Lead Qualification & Outbound Sales");
  const [launchTimeline, setLaunchTimeline] = useState("Within 2 weeks");

  // Step 3 Fields
  const [selectedDate, setSelectedDate] = useState("Tomorrow, 2:30 PM IST");
  const [sendTestCallNow, setSendTestCallNow] = useState(true);

  // Cookie banner state
  const [cookieConsent, setCookieConsent] = useState(true);
  const [quickPhoneModalOpen, setQuickPhoneModalOpen] = useState(false);

  // Validate Step 1
  const validateStep1 = () => {
    setTouched(true);
    const newErrors: { fullName?: string; workEmail?: string; company?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name.";
    }
    if (!workEmail.trim()) {
      newErrors.workEmail = "Please enter a valid work email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
      newErrors.workEmail = "Please enter a valid work email.";
    }
    if (!company.trim()) {
      newErrors.company = "Please enter your company name.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleContinueStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinishBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A] flex flex-col justify-between">
      <div>
        <MarketingHeader />

        <main className="mx-auto max-w-7xl px-6 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* ============================================================== */}
            {/* LEFT COLUMN: Headings, Logos & G2 Badges (Ref: ringg.ai/book-a-demo) */}
            {/* ============================================================== */}
            <div className="lg:col-span-6 space-y-10 pt-2">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  10x your business at a fraction of the cost with {BRAND_CONFIG.shortName} agents.
                </h1>
              </div>

              {/* Client Logos Section */}
              <div className="space-y-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Best brands win with {BRAND_CONFIG.name}
                </p>

                {/* Grid of 8 Logos Matching Screenshot */}
                <div className="grid grid-cols-4 gap-y-6 gap-x-4 items-center">
                  {/* CRED */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <div className="h-6 w-5 rounded-sm border-2 border-slate-800 flex items-center justify-center text-[10px] font-black">
                      C
                    </div>
                    <span className="font-bold text-xs tracking-wider">CRED</span>
                  </div>

                  {/* Groww */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-black">
                      ↗
                    </div>
                    <span className="font-bold text-xs tracking-tight">Groww</span>
                  </div>

                  {/* Flipkart */}
                  <div className="flex items-center gap-1 text-slate-800 italic">
                    <span className="font-extrabold text-xs">Flipkart</span>
                    <span className="h-4 w-3.5 bg-amber-500 rounded-xs flex items-center justify-center text-[9px] text-white not-italic font-black">
                      f
                    </span>
                  </div>

                  {/* policybazaar.com */}
                  <div className="flex items-center text-slate-800 text-xs font-bold tracking-tight">
                    <span>policy</span>
                    <span className="text-slate-500">bazaar</span>
                    <span className="h-3.5 w-3.5 rounded-full bg-slate-400 text-white text-[7px] flex items-center justify-center ml-0.5">
                      com
                    </span>
                  </div>

                  {/* DCB BANK */}
                  <div className="font-extrabold tracking-wider text-slate-900 text-xs">
                    <span className="border-b-2 border-slate-900 pb-0.5">DCB BANK</span>
                  </div>

                  {/* PharmEasy */}
                  <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                    <span className="h-4 w-4 rounded-full border border-teal-600 text-teal-600 flex items-center justify-center text-[10px] font-bold">
                      +
                    </span>
                    <span>PharmEasy</span>
                  </div>

                  {/* practo */}
                  <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-slate-800" />
                    <span>practo</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-600" />
                  </div>

                  {/* tabby */}
                  <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-extrabold tracking-tight text-center w-fit">
                    tabby
                  </div>
                </div>
              </div>

              {/* G2 Badges Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500">
                  Easiest to do business across all markets
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Badge 1: Easiest To Do Business With */}
                  <div className="w-28 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs text-center relative overflow-hidden group hover:border-cyan-400 transition">
                    <div className="h-1 bg-cyan-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-1">
                      <span>FALL 2024</span>
                      <span className="h-3 w-3 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] font-black">
                        G
                      </span>
                    </div>
                    <div className="h-10 flex items-center justify-center">
                      <p className="text-[10px] font-extrabold text-slate-900 leading-tight">
                        Easiest To Do Business With
                      </p>
                    </div>
                  </div>

                  {/* Badge 2: High Performer */}
                  <div className="w-28 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs text-center relative overflow-hidden group hover:border-amber-400 transition">
                    <div className="h-1 bg-amber-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-1">
                      <span>FALL 2024</span>
                      <span className="h-3 w-3 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] font-black">
                        G
                      </span>
                    </div>
                    <div className="h-10 flex items-center justify-center">
                      <p className="text-[10px] font-extrabold text-slate-900 leading-tight">
                        High Performer
                      </p>
                    </div>
                  </div>

                  {/* Badge 3: Users Love Us */}
                  <div className="w-28 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs text-center relative overflow-hidden group hover:border-rose-400 transition">
                    <div className="h-1 bg-rose-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-1">
                      <span>MILESTONE</span>
                      <span className="h-3 w-3 rounded-full bg-red-500 text-white flex items-center justify-center text-[7px] font-black">
                        G
                      </span>
                    </div>
                    <div className="h-10 flex flex-col items-center justify-center">
                      <p className="text-[10px] font-extrabold text-slate-900 leading-tight">
                        Users Love Us
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5 text-rose-500">
                        <Star className="h-2 w-2 fill-rose-500" />
                        <Star className="h-2 w-2 fill-rose-500" />
                        <Star className="h-2 w-2 fill-rose-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: Interactive Multi-Step Form Card (Exact match)   */}
            {/* ============================================================== */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-9 shadow-sm relative">
                {/* 3 Step Pill Indicator at the top */}
                {step < 4 && (
                  <div className="flex items-center gap-2 mb-8">
                    <div
                      className={`h-1.5 w-10 rounded-full transition-colors ${
                        step >= 1 ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-1.5 w-10 rounded-full transition-colors ${
                        step >= 2 ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-1.5 w-10 rounded-full transition-colors ${
                        step >= 3 ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}

                {/* STEP 1: Personal & Company Info */}
                {step === 1 && (
                  <form onSubmit={handleContinueStep1} className="space-y-5">
                    {/* Row 1: Full name & Work email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) {
                              setErrors((prev) => ({ ...prev, fullName: undefined }));
                            }
                          }}
                          placeholder=""
                          className={`h-12 w-full rounded-xl border px-3.5 text-sm transition focus:outline-none ${
                            touched && errors.fullName
                              ? "border-red-400 bg-red-50/20 focus:border-red-500"
                              : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900"
                          }`}
                        />
                        {touched && errors.fullName && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      {/* Work email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Work email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={workEmail}
                          onChange={(e) => {
                            setWorkEmail(e.target.value);
                            if (errors.workEmail) {
                              setErrors((prev) => ({ ...prev, workEmail: undefined }));
                            }
                          }}
                          placeholder=""
                          className={`h-12 w-full rounded-xl border px-3.5 text-sm transition focus:outline-none ${
                            touched && errors.workEmail
                              ? "border-red-400 bg-red-50/20 focus:border-red-500"
                              : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900"
                          }`}
                        />
                        {touched && errors.workEmail && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.workEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone with +91 country prefix */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phone
                        </label>
                        <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-900 transition overflow-hidden">
                          <span className="px-3.5 py-3 text-xs font-semibold text-slate-600 border-r border-slate-200 bg-slate-100 flex items-center shrink-0">
                            +91
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="h-12 w-full px-3 text-sm bg-transparent focus:outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">With country code</p>
                      </div>

                      {/* Your role dropdown */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Your role
                        </label>
                        <div className="relative">
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 pr-8 text-sm text-slate-700 focus:bg-white focus:border-slate-900 focus:outline-none transition"
                          >
                            <option value="">Select...</option>
                            <option value="Founder / CEO">Founder / CEO</option>
                            <option value="VP / Director of Sales">VP / Director of Sales</option>
                            <option value="Head of Customer Experience">Head of Customer Experience</option>
                            <option value="Product / Tech Lead">Product / Tech Lead</option>
                            <option value="Contact Center Director">Contact Center Director</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Company */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value);
                          if (errors.company) {
                            setErrors((prev) => ({ ...prev, company: undefined }));
                          }
                        }}
                        placeholder=""
                        className={`h-12 w-full rounded-xl border px-3.5 text-sm transition focus:outline-none ${
                          touched && errors.company
                            ? "border-red-400 bg-red-50/20 focus:border-red-500"
                            : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900"
                        }`}
                      />
                      {touched && errors.company && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.company}</p>
                      )}
                    </div>

                    {/* Row 4: Company website */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Company website
                      </label>
                      <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-900 transition overflow-hidden">
                        <span className="px-3.5 py-3 text-xs font-medium text-slate-400 border-r border-slate-200 bg-slate-100 flex items-center shrink-0">
                          https://
                        </span>
                        <input
                          type="text"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="example.com"
                          className="h-12 w-full px-3 text-sm bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Continue Button at Bottom Right (Exact Orange style from screenshot) */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        className="rounded-xl bg-[#F95700] hover:bg-[#E04E00] text-white px-7 py-3 text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: Use Cases & Volume */}
                {step === 2 && (
                  <form onSubmit={handleContinueStep2} className="space-y-6 animate-in fade-in-50">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Tell us about your calling requirements
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Helps us tailor a personalized voice AI demo and economic ROI sheet.
                      </p>
                    </div>

                    {/* Call Volume */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Estimated Monthly Call Volume
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          "< 10,000 calls / mo",
                          "10,000 - 50,000 calls / mo",
                          "50,000 - 250,000 calls / mo",
                          "250,000+ Enterprise Scale",
                        ].map((vol) => (
                          <button
                            type="button"
                            key={vol}
                            onClick={() => setCallVolume(vol)}
                            className={`p-3 rounded-xl border text-left font-medium transition ${
                              callVolume === vol
                                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            {vol}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Use Case */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Primary AI Voice Use Case
                      </label>
                      <div className="space-y-2 text-xs">
                        {[
                          "Lead Qualification & Outbound Sales",
                          "24/7 Inbound Customer Support & FAQ Resolution",
                          "Overdue Payment Recovery & Soft Collections",
                          "E-Commerce NDR Verification & Address Confirmation",
                          "Appointment Booking & Hospital Doctor Scheduling",
                        ].map((uc) => (
                          <button
                            type="button"
                            key={uc}
                            onClick={() => setPrimaryUseCase(uc)}
                            className={`w-full p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                              primaryUseCase === uc
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <span>{uc}</span>
                            {primaryUseCase === uc && <Check className="h-3.5 w-3.5 text-[#11E97F]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#F95700] hover:bg-[#E04E00] text-white px-7 py-3 text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: Date & Time Picker */}
                {step === 3 && (
                  <form onSubmit={handleFinishBooking} className="space-y-6 animate-in fade-in-50">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Select Architecture Demo Slot
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        A dedicated solution architect will demonstrate live calls with your workflow.
                      </p>
                    </div>

                    {/* Date / Slot picker */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Available Time Slots (IST)
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          "Today, 4:30 PM IST",
                          "Tomorrow, 11:30 AM IST",
                          "Tomorrow, 2:30 PM IST",
                          "Tomorrow, 5:00 PM IST",
                          "Friday, 12:00 PM IST",
                          "Friday, 3:30 PM IST",
                        ].map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedDate(slot)}
                            className={`p-3 rounded-xl border text-center font-medium transition ${
                              selectedDate === slot
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Instant Test Call Checkbox */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="testCall"
                        checked={sendTestCallNow}
                        onChange={(e) => setSendTestCallNow(e.target.checked)}
                        className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <label htmlFor="testCall" className="text-xs text-emerald-950 font-medium cursor-pointer">
                        <span className="font-bold text-emerald-900 block">
                          Receive a 60-second test AI call on +91 {phone || "your phone"}
                        </span>
                        Our Indian accent agent will dial you to verify low latency & zero robotic delay.
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#F95700] hover:bg-[#E04E00] text-white px-7 py-3 text-xs font-bold transition flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <span>Confirm Booking</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 4: Success State */}
                {step === 4 && (
                  <div className="py-8 text-center space-y-5 animate-in zoom-in-95">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900">
                        Demo Confirmed!
                      </h3>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto">
                        Calendar invite with Google Meet link dispatched to{" "}
                        <strong className="text-slate-900">{workEmail}</strong>.
                      </p>
                    </div>

                    {/* Summary card */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Attendee:</span>
                        <span className="font-semibold text-slate-900">{fullName} ({company})</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Scheduled Slot:</span>
                        <span className="font-semibold text-slate-900">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Use Case:</span>
                        <span className="font-semibold text-slate-900">{primaryUseCase}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Pilot Bonus:</span>
                        <span className="font-semibold text-emerald-600">₹5,000 Sandbox Telephony Credits</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/dashboard/assistants"
                        className="rounded-xl px-5 py-2.5 text-xs font-extrabold text-[#0A0E1A] bg-[#11E97F] hover:bg-[#0ED071] transition shadow-xs"
                      >
                        Explore Studio Canvas
                      </Link>
                      <Link
                        href="/docs"
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                      >
                        Read API Documentation
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* FLOATING PHONE BUTTON ON BOTTOM-RIGHT (Matching Screenshot)     */}
      {/* ============================================================== */}
      <button
        onClick={() => setQuickPhoneModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-13 w-13 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
        aria-label="Test Phone Call Agent"
      >
        <PhoneCall className="h-5 w-5 text-white" />
      </button>

      {/* Quick Phone Test Call Modal */}
      {quickPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Instant Phone Test</h4>
                  <p className="text-[11px] text-slate-500">Live Indian accent agent</p>
                </div>
              </div>
              <button
                onClick={() => setQuickPhoneModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter your mobile number to receive a live 60-second inbound test call right now:
            </p>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-slate-900">
              <span className="px-3 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 bg-slate-100 flex items-center">
                +91
              </span>
              <input
                type="tel"
                placeholder="98765 43210"
                className="w-full px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                alert("Calling your phone right now via Voxera SIP gateway...");
                setQuickPhoneModalOpen(false);
              }}
              className="w-full rounded-xl bg-[#11E97F] hover:bg-[#0ED071] py-2.5 text-xs font-extrabold text-[#0A0E1A] transition shadow-xs cursor-pointer"
            >
              Dial My Phone Now ➔
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* COOKIE CONSENT BAR ON BOTTOM (Matching Screenshot)              */}
      {/* ============================================================== */}
      {cookieConsent && (
        <div className="fixed bottom-4 inset-x-4 max-w-2xl mx-auto z-30 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-base">🍪</span>
            <span>We use cookies to improve your experience and understand how the platform is used.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCookieConsent(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              Manage
            </button>
            <button
              onClick={() => setCookieConsent(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}
