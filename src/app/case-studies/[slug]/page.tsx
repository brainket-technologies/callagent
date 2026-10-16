import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Cpu,
  PhoneCall,
  Activity,
  Layers,
  ShieldCheck,
  Building,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { BRAND_CONFIG } from "@/lib/brand-config";

// Case studies data map
const caseStudiesMap: Record<
  string,
  {
    company: string;
    industry: string;
    logoBadge: string;
    title: string;
    summary: string;
    challenge: string;
    solution: string;
    results: { label: string; stat: string; desc: string }[];
    architecture: string[];
    author: string;
    role: string;
    quote: string;
  }
> = {
  policybazaar: {
    company: "PolicyBazaar",
    industry: "Insurance & Fintech",
    logoBadge: "PB Insurance",
    title: "PolicyBazaar Scales Insurance Lead Conversion by 38% via Sub-300ms Voice Agents",
    summary:
      "PolicyBazaar processes over 100,000 comparison requests daily. High drop-off during premium calculation was historically handled by human telecallers with a 45-minute callback delay. Voxera AI reduced response time to 15 seconds.",
    challenge:
      "Human relationship managers were overwhelmed with unqualified leads, while high-intent policy buyers were left waiting over 45 minutes for a call back. Lead decay caused conversion rates to stagnate.",
    solution:
      "Deployed Voxera's sub-300ms conversational agent with Hinglish vernacular fluency. The agent connects to users instantly, explains deductible trade-offs, and transfers verified buyers to senior insurance underwriters.",
    results: [
      { label: "Conversion Lift", stat: "+38%", desc: "Direct increase in finalized policy purchases" },
      { label: "Connect Speed", stat: "15 sec", desc: "Instant outreach post-form submission" },
      { label: "BPO Overhead", stat: "-58%", desc: "Dramatically lower cost per qualified lead" },
    ],
    architecture: [
      "Webhook triggered by web drop-off event on policybazaar.com",
      "Instant SIP trunk outbound dial via dedicated Tata Tele gateway",
      "Cartesia Sonic Hindi voice model with custom insurance vocabulary",
      "Live underwriting API lookup for vehicle and health pre-approval",
      "Warm SIP transfer to human RM if user requests human advice",
    ],
    author: "Manoj Pandey",
    role: "DVP (AI Initiatives & Health)",
    quote:
      "Our RMs were spending half their day on people who had filled the form out of curiosity. Now, by the time a lead lands on their desk, Voxera has already had the hard first conversation.",
  },
  practo: {
    company: "Practo",
    industry: "Healthcare & Diagnostics",
    logoBadge: "Practo Health",
    title: "Practo Automates 1,000+ Daily Doctor Appointments with Zero Human Wait Time",
    summary:
      "Managing doctor appointment confirmations across 20+ Indian cities requires continuous multi-lingual outreach. Practo deployed Voxera AI to confirm, reschedule, and route patient inquiries 24/7.",
    challenge:
      "Clinic no-show rates hovered above 25% due to forgotten appointments and last-minute schedule changes. Human call center staff struggled to support regional Indian languages (Hindi, Tamil, Kannada, Telugu).",
    solution:
      "Integrated Voxera AI voice agents with Practo's doctor calendar API. Patients receive automated reminder calls 3 hours prior with interactive reschedule options in their preferred language.",
    results: [
      { label: "Daily Bookings", stat: "~1,000", desc: "Handled autonomously across India" },
      { label: "No-Show Drop", stat: "41%", desc: "Massive reduction in empty doctor slots" },
      { label: "Patient CSAT", stat: "4.9/5", desc: "Highest satisfaction score of any channel" },
    ],
    architecture: [
      "Cron-based EHR trigger 3 hours prior to scheduled consultation",
      "Regional language detection based on patient phone number circle",
      "Dynamic reschedule negotiation checking doctor calendar slots",
      "SMS & WhatsApp confirmation dispatch with Google Maps clinic pin",
    ],
    author: "Nirbhay Jnanendra",
    role: "Lead Product Manager",
    quote:
      "Voxera worked closely with us for over a year. We went from a simple pilot to automating ~1,000 appointments daily with zero degradation in clinic relations.",
  },
  pharmeasy: {
    company: "PharmEasy",
    industry: "E-Pharmacy & Diagnostics",
    logoBadge: "PharmEasy",
    title: "PharmEasy Recovers 29% of Abandoned Prescription Carts with AI Voice + WhatsApp",
    summary:
      "Patients needing prescription medicines often drop off during doctor prescription upload. PharmEasy uses Voxera AI to verify doctor approvals and send instant WhatsApp checkout links.",
    challenge:
      "Regulatory compliance requires pharmacist verification of doctor prescriptions. Delayed human callbacks led to high cart abandonment as patients bought from neighborhood medical stores instead.",
    solution:
      "Autonomous calls initiated within 60 seconds of prescription upload. The agent confirms patient address, clarifies doctor dosage instructions, and drops a one-click payment link on WhatsApp.",
    results: [
      { label: "Cart Recovery", stat: "+29%", desc: "Drop-off converted back into revenue" },
      { label: "Resolution Rate", stat: "72%", desc: "Resolved on first conversational turn" },
      { label: "Cost Per Order", stat: "-64%", desc: "Lower operational fulfillment cost" },
    ],
    architecture: [
      "Rx OCR parsing engine extracts prescribed medication list",
      "Voxera AI voice agent reads dosage instructions using SSML phonetic rules",
      "Real-time integration with WhatsApp Business Cloud API",
      "Automated fallback to human pharmacist for schedule X drugs",
    ],
    author: "Soniya Lal",
    role: "Associate Director (Product)",
    quote:
      "Voxera helped us re-engage users at the right moment, and when combined with immediate WhatsApp follow-up, it created our highest-converting re-engagement pipeline.",
  },
  smallcase: {
    company: "Smallcase",
    industry: "Wealth Management",
    logoBadge: "smallcase",
    title: "Smallcase Guides First-Time Investors Through Demat & KYC Funnel Drop-offs",
    summary:
      "Stock market beginners frequently drop off during Aadhaar e-sign and broker verification. Smallcase implemented Voxera AI to provide empathetic, compliant onboarding assistance.",
    challenge:
      "Complex SEBI regulatory forms and KYC document verification caused 40%+ drop-off among non-metro first-time investors.",
    solution:
      "Authoritative, reassuring voice assistants that explain why Aadhaar OTP is required and guide users through broker account linking in plain vernacular language.",
    results: [
      { label: "KYC Completion", stat: "+33%", desc: "Lift in finalized broker connections" },
      { label: "BPO Overhead", stat: "70%", desc: "Cost reduction vs human support desks" },
      { label: "Time-to-Trade", stat: "2.4x", desc: "Faster time from install to first trade" },
    ],
    architecture: [
      "Segment / Mixpanel event trigger on KYC screen drop-off",
      "SEBI-compliant scripted subroutines with zero hallucination constraints",
      "Dynamic explanation of broker requirements (Zerodha, Groww, AngelOne)",
      "Instant in-call SMS dispatch with direct app deep-link",
    ],
    author: "Vipul Rawal",
    role: "VP (Product)",
    quote:
      "Whether it was someone exploring US equities or dropping off during KYC, Voxera helped us engage users with the right context at the right time.",
  },
  ekart: {
    company: "Ekart Logistics",
    industry: "Supply Chain & Logistics",
    logoBadge: "Ekart Supply",
    title: "Ekart Slashes RTO Rates by 22% with Autonomous Address & Landmark Verification",
    summary:
      "Failed delivery attempts (RTO) are the single largest cost center in Indian e-commerce logistics. Ekart deployed Voxera AI to verify recipient availability and delivery landmarks.",
    challenge:
      "Incomplete delivery addresses and unavailable customers cost logistics fleets millions in wasted fuel and repeated van dispatch attempts.",
    solution:
      "Pre-dispatch autonomous calls verifying recipient availability, preferred delivery time window, and landmark instructions.",
    results: [
      { label: "RTO Drop", stat: "22%", desc: "Direct reduction in return-to-origin orders" },
      { label: "Annual Savings", stat: "₹4.8 Cr", desc: "Saved in repeated delivery fleet runs" },
      { label: "Address Quality", stat: "98.4%", desc: "First-attempt delivery success rate" },
    ],
    architecture: [
      "WMS (Warehouse Management System) trigger prior to van loading",
      "Phonetic street and landmark speech recognition",
      "Dynamic reschedule slot updates directly into delivery rider app",
    ],
    author: "Arjun Venkat",
    role: "Director of Last-Mile Operations",
    quote:
      "Failed delivery attempts bleed margins. Voxera validates delivery nuances before our delivery vans even leave the sorting hub.",
  },
};

export function generateStaticParams() {
  return Object.keys(caseStudiesMap).map((slug) => ({ slug }));
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = caseStudiesMap[slug];

  if (!cs) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#11E97F] selection:text-[#0A0E1A]">
      <MarketingHeader />

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12">
        {/* Back link */}
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case Studies</span>
        </Link>

        {/* Title Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-800 font-mono">
              {cs.logoBadge}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {cs.industry}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            {cs.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {cs.summary}
          </p>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl bg-slate-50 border border-slate-200/80 p-6 md:p-8 text-center">
          {cs.results.map((r) => (
            <div key={r.label} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">{r.stat}</p>
              <p className="text-xs font-bold text-emerald-700">{r.label}</p>
              <p className="text-[11px] text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonial Quote */}
        <div className="rounded-3xl border-l-4 border-[#11E97F] bg-emerald-50/40 p-8 shadow-xs">
          <p className="text-base md:text-lg italic text-slate-800 leading-relaxed">
            &quot;{cs.quote}&quot;
          </p>
          <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{cs.author}</p>
              <p className="text-xs text-slate-500">{cs.role}, {cs.company}</p>
            </div>
          </div>
        </div>

        {/* Narrative Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-700">
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">The Challenge</h2>
            <p className="text-slate-600">{cs.challenge}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">The Solution</h2>
            <p className="text-slate-600">{cs.solution}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-2xl font-black text-slate-900">Technical Architecture</h2>
            <ul className="space-y-3">
              {cs.architecture.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Card */}
        <div className="rounded-3xl border-2 border-[#11E97F] bg-white p-8 md:p-10 text-center space-y-4 shadow-lg shadow-emerald-500/10">
          <h3 className="text-2xl font-black text-slate-900">
            Ready to achieve similar results for your business?
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Test a live voice agent in your browser or speak to our enterprise telephony solutions architects today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/assistants"
              className="h-11 rounded-xl px-6 text-xs font-black text-[#0A0E1A] bg-[#11E97F] hover:bg-[#0ED071] transition shadow-md flex items-center justify-center"
            >
              Start Free Trial ➔
            </Link>
            <Link
              href="/book-a-demo"
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center justify-center"
            >
              Book 1-on-1 Architecture Review
            </Link>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
