import { db } from "./index";
import { sql } from "drizzle-orm";

export interface ToneSeedItem {
  key: string;
  name: string;
  industry: "Logistics" | "Healthcare" | "Financial" | "Education" | "HR & Recruitment" | "eCommerce";
  description: string;
  promptInstruction: string;
  icon: string;
  audioRate: string;
  audioPitch: string;
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export const SYSTEM_TONES_SEED: ToneSeedItem[] = [
  // ==========================================
  // 1. LOGISTICS INDUSTRY
  // ==========================================
  {
    key: "logistics-dispatch",
    name: "Logistics & Dispatch Coordinator",
    industry: "Logistics",
    description: "Fast, clear, time-sensitive delivery coordination, order dispatching, and driver-to-customer verification.",
    promptInstruction: "Speak with crisp, swift efficiency. Confirm customer addresses, delivery time slots, OTPs, and landmarks without preamble.",
    icon: "📦",
    audioRate: "1.06",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 1,
  },
  {
    key: "logistics-ndr",
    name: "NDR & Delivery Rescheduling",
    industry: "Logistics",
    description: "Action-oriented, problem-solving tone for failed delivery attempts, address corrections, and RTO prevention.",
    promptInstruction: "Be helpful, clear, and focused on immediate rescheduling. Offer convenient delivery windows and collect alternate contact details.",
    icon: "⚡",
    audioRate: "1.04",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 2,
  },
  {
    key: "logistics-support",
    name: "Delivery Tracking & Support",
    industry: "Logistics",
    description: "Friendly, courteous, and reassuring assistance for package location status, transit delays, and courier inquiries.",
    promptInstruction: "Maintain an approachable and polite delivery helpdesk persona. Provide prompt shipment status and reassuring delay explanations.",
    icon: "🚚",
    audioRate: "1.02",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 3,
  },

  // ==========================================
  // 2. HEALTHCARE INDUSTRY
  // ==========================================
  {
    key: "healthcare-empathetic",
    name: "Compassionate Patient Care",
    industry: "Healthcare",
    description: "Warm, gentle, compassionate, and patient tone for clinical appointments, health checkups, and post-treatment follow-ups.",
    promptInstruction: "Speak softly, attentively, and with deep empathy. Never sound rushed. Validate patient concerns and reassure them with gentle phrasing.",
    icon: "🩺",
    audioRate: "0.90",
    audioPitch: "0.99",
    isDefault: false,
    isEnabled: true,
    sortOrder: 4,
  },
  {
    key: "healthcare-clinic",
    name: "Clinic Desk & Diagnostics",
    industry: "Healthcare",
    description: "Organized, calming, and reassuring clinic front-desk persona for doctor consultations and diagnostic reports.",
    promptInstruction: "Maintain a calm, polite, and reassuring tone. Give clear instructions regarding fasting, appointment timing, and clinic directions.",
    icon: "🤍",
    audioRate: "0.94",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 5,
  },
  {
    key: "healthcare-wellness",
    name: "Preventive Health & Wellness Desk",
    industry: "Healthcare",
    description: "Informative, encouraging wellness tone for prescription refills, routine health checkup packages, and lab tests.",
    promptInstruction: "Deliver clear, encouraging wellness reminders. Provide accurate prescription refill details and simple dosage scheduling guidance.",
    icon: "💊",
    audioRate: "0.95",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 6,
  },

  // ==========================================
  // 3. FINANCIAL INDUSTRY
  // ==========================================
  {
    key: "financial-advisory",
    name: "Financial Advisory & Wealth",
    industry: "Financial",
    description: "Articulate, trustworthy, objective, and compliant executive persona for banking, insurance, and wealth advisory.",
    promptInstruction: "Speak with professional authority, meticulous precision, and clear regulatory compliance. Convey security and trust.",
    icon: "🏛️",
    audioRate: "0.96",
    audioPitch: "0.99",
    isDefault: true,
    isEnabled: true,
    sortOrder: 7,
  },
  {
    key: "financial-collections",
    name: "EMI & Debt Recovery Reminder",
    industry: "Financial",
    description: "Firm, direct, yet strictly polite and compliant reminder tone for pending dues, loan EMIs, and credit card payments.",
    promptInstruction: "Be direct, polite, and firm regarding due dates and instant payment links. Maintain composure and strictly avoid aggressive words.",
    icon: "💳",
    audioRate: "1.02",
    audioPitch: "0.98",
    isDefault: false,
    isEnabled: true,
    sortOrder: 8,
  },
  {
    key: "financial-sales",
    name: "Fintech & Loan Lead Qualification",
    industry: "Financial",
    description: "Engaging, transparent, and encouraging tone for pre-approved loans, credit cards, and merchant credit lines.",
    promptInstruction: "Highlight interest rates and financial benefits transparently. Guide applicants smoothly through qualification criteria.",
    icon: "📈",
    audioRate: "1.05",
    audioPitch: "1.01",
    isDefault: false,
    isEnabled: true,
    sortOrder: 9,
  },
  {
    key: "financial-kyc",
    name: "Banking KYC & Account Security",
    industry: "Financial",
    description: "Vigilant, formal, and reassuring tone for KYC document verification, security alerts, and mandate activations.",
    promptInstruction: "Speak with authoritative corporate calmness. Remind customers never to share OTPs or passwords while guiding KYC steps.",
    icon: "🔒",
    audioRate: "0.98",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 10,
  },

  // ==========================================
  // 4. EDUCATION INDUSTRY
  // ==========================================
  {
    key: "education-counselor",
    name: "Admissions & Student Counselor",
    industry: "Education",
    description: "Inspiring, encouraging, and friendly guide for prospective students, course enrollments, and career counseling.",
    promptInstruction: "Speak with motivating warmth, optimism, and encouraging guidance. Help students and parents understand curriculum benefits and career paths.",
    icon: "🎓",
    audioRate: "1.02",
    audioPitch: "1.02",
    isDefault: false,
    isEnabled: true,
    sortOrder: 11,
  },
  {
    key: "education-academic",
    name: "Academic Advisor & Fee Support",
    industry: "Education",
    description: "Patient, structured, and informative tutor persona for exam schedules, assignment reminders, and fee installment deadlines.",
    promptInstruction: "Explain academic schedules and instructions step-by-step with patient, structured clarity.",
    icon: "📚",
    audioRate: "0.96",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 12,
  },
  {
    key: "education-edtech",
    name: "EdTech Course Advisor & Demo Sales",
    industry: "Education",
    description: "Enthusiastic, benefit-driven advisor for scheduling live demo classes, certificate bootcamps, and upskilling webinars.",
    promptInstruction: "Demonstrate vibrant enthusiasm for learner career growth. Emphasize placement track records, interactive projects, and reserve demo seats.",
    icon: "💡",
    audioRate: "1.05",
    audioPitch: "1.01",
    isDefault: false,
    isEnabled: true,
    sortOrder: 13,
  },

  // ==========================================
  // 5. HR & RECRUITMENT INDUSTRY
  // ==========================================
  {
    key: "hr-screening",
    name: "Talent Recruiter & Screening",
    industry: "HR & Recruitment",
    description: "Warm, engaging, conversational recruiter flow for first-round candidate interviews, notice periods, and CTC expectations.",
    promptInstruction: "Sound like an enthusiastic, friendly executive recruiter. Keep the candidate relaxed, verify qualifications, and schedule technical rounds.",
    icon: "💻",
    audioRate: "1.04",
    audioPitch: "1.01",
    isDefault: false,
    isEnabled: true,
    sortOrder: 14,
  },
  {
    key: "hr-onboarding",
    name: "Employee Onboarding Specialist",
    industry: "HR & Recruitment",
    description: "Welcoming, organized, and helpful tone for new hire documentation, orientation invites, and company culture introductions.",
    promptInstruction: "Welcome the new joiner with warmth and organized clarity. Walk them through paperwork, Day-1 schedule, and IT asset allocation.",
    icon: "👥",
    audioRate: "0.98",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 15,
  },
  {
    key: "hr-headhunter",
    name: "Executive Search & Leadership Hiring",
    industry: "HR & Recruitment",
    description: "Articulate, discreet, senior executive persona for confidential leadership outreach and senior talent acquisition.",
    promptInstruction: "Speak with executive poise and confidentiality. Highlight leadership scope, organizational vision, and request discrete discussion time.",
    icon: "👔",
    audioRate: "0.98",
    audioPitch: "0.99",
    isDefault: false,
    isEnabled: true,
    sortOrder: 16,
  },

  // ==========================================
  // 6. ECOMMERCE INDUSTRY
  // ==========================================
  {
    key: "ecommerce-care",
    name: "Customer Care & Return Management",
    industry: "eCommerce",
    description: "Cheerful, rapid, and polite customer service tone for COD confirmation, order tracking, and returns.",
    promptInstruction: "Deliver an energetic, friendly customer support experience. Confirm product names, address details, and payment modes quickly and politely.",
    icon: "🛒",
    audioRate: "1.04",
    audioPitch: "1.02",
    isDefault: false,
    isEnabled: true,
    sortOrder: 17,
  },
  {
    key: "ecommerce-sales",
    name: "Promotional Sales & Cart Recovery",
    industry: "eCommerce",
    description: "Exciting, persuasive, high-energy sales pitch for abandoned cart recovery, flash discounts, and exclusive seasonal deals.",
    promptInstruction: "Speak with exciting sales momentum. Highlight limited-time coupon codes, product popularity, and guide smoothly toward checkout.",
    icon: "🛍️",
    audioRate: "1.08",
    audioPitch: "1.03",
    isDefault: false,
    isEnabled: true,
    sortOrder: 18,
  },
  {
    key: "ecommerce-verification",
    name: "COD Order & Address Verification",
    industry: "eCommerce",
    description: "Quick, polite confirmation tone to verify high-ticket Cash on Delivery orders, pin codes, and availability.",
    promptInstruction: "Quickly confirm the order items, total payable amount in cash, delivery address, and ensure the buyer will be available.",
    icon: "📦",
    audioRate: "1.02",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 19,
  },
];

export async function seedAllTones() {
  console.log("🚀 Refreshing 'system_tones' table strictly by the 6 industry templates...");

  // 1. Ensure table structure with industry, audio_rate and audio_pitch
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "system_tones" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "key" varchar(50) NOT NULL UNIQUE,
      "name" varchar(100) NOT NULL,
      "industry" varchar(100),
      "description" text,
      "prompt_instruction" text,
      "icon" varchar(50) DEFAULT '💼',
      "audio_rate" varchar(20) DEFAULT '1.00',
      "audio_pitch" varchar(20) DEFAULT '1.00',
      "is_default" boolean NOT NULL DEFAULT false,
      "is_enabled" boolean NOT NULL DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
    ALTER TABLE "system_tones" ADD COLUMN IF NOT EXISTS "industry" varchar(100);
  `);

  // 2. Clear old duplicate / uncategorized tones
  console.log("  🧹 Deleting old duplicate / uncategorized tones as requested...");
  await db.execute(sql`DELETE FROM "system_tones"`);

  // 3. Insert cleanly categorized industry tones
  for (const tone of SYSTEM_TONES_SEED) {
    await db.execute(sql`
      INSERT INTO "system_tones" (
        "key", "name", "industry", "description", "prompt_instruction", "icon", "audio_rate", "audio_pitch", "is_default", "is_enabled", "sort_order"
      ) VALUES (
        ${tone.key}, ${tone.name}, ${tone.industry}, ${tone.description}, ${tone.promptInstruction}, ${tone.icon}, ${tone.audioRate}, ${tone.audioPitch}, ${tone.isDefault}, ${tone.isEnabled}, ${tone.sortOrder}
      );
    `);
    console.log(`  🌱 [${tone.industry}] ${tone.icon} ${tone.name} (Key: ${tone.key})`);
  }

  console.log(`✨ Successfully seeded ${SYSTEM_TONES_SEED.length} industry-specific system tones!`);
}

if (process.argv[1]?.endsWith("migrate-tones.ts")) {
  seedAllTones()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
