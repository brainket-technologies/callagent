import { BRAND_CONFIG } from "./brand-config";

export const APP_NAME = BRAND_CONFIG.name;
export const APP_SHORT_NAME = BRAND_CONFIG.shortName;
export const APP_TAGLINE = BRAND_CONFIG.tagline;
export const COMPANY_NAME = BRAND_CONFIG.companyName;
export const SUPPORT_EMAIL = BRAND_CONFIG.supportEmail;
export const ADMIN_EMAIL = BRAND_CONFIG.adminEmail;

export const DEFAULT_RATE_PER_MINUTE_PAISE = BRAND_CONFIG.ratePerMinutePaise;
export const MIN_CALL_BALANCE_PAISE = BRAND_CONFIG.minCallBalancePaise;

export const VOICE_PROVIDERS = [
  { id: "cartesia", name: "Cartesia Sonic", latency: "90ms", languages: ["en", "hi", "es", "fr", "de"] },
  { id: "elevenlabs", name: "ElevenLabs Turbo v2.5", latency: "160ms", languages: ["en", "hi", "ta", "te", "bn"] },
  { id: "azure", name: "Azure Neural Speech", latency: "140ms", languages: ["en", "hi", "gu", "kn", "ml"] },
  { id: "google", name: "Google Chirp 2", latency: "180ms", languages: ["en", "hi", "mr", "pa"] },
  { id: "sarvam", name: "Sarvam Bulbul (Indic)", latency: "120ms", languages: ["hi", "ta", "te", "bn", "gu", "kn", "mr"] },
] as const;

export const INDUSTRY_TEMPLATES = [
  {
    id: "logistics-ndr",
    title: "Logistics NDR & Delivery Rescheduling",
    category: "Logistics",
    description: "Verify address inaccuracies, reschedule delivery time slots for undelivered packages, and reduce Return to Origin (RTO).",
    primaryVoice: "Cartesia Sonic - Friendly Indian",
    tone: "logistics-ndr",
    language: "Hindi / English",
    variables: ["callee_name", "order_id", "courier_partner", "delivery_address"],
    promptObjective: "Call customer regarding failed delivery for order #{{order_id}}, confirm their complete address and preferred re-delivery date/time.",
  },
  {
    id: "healthcare-appointment",
    title: "Clinic & Hospital Consultation Confirmation",
    category: "Healthcare",
    description: "Confirm patient arrival for scheduled consultations, provide clinic directions, or offer reschedule options.",
    primaryVoice: "ElevenLabs - Gentle Care",
    tone: "healthcare-clinic",
    language: "English / Regional",
    variables: ["callee_name", "doctor_name", "appointment_time", "clinic_address"],
    promptObjective: "Call patient to confirm scheduled consultation with Dr. {{doctor_name}} at {{appointment_time}}, collect confirmation or reschedule.",
  },
  {
    id: "emi-reminder",
    title: "EMI Payment & Due Recovery",
    category: "Financial",
    description: "Remind customers of upcoming or overdue EMIs, confirm repayment date, and dispatch instant payment link via WhatsApp.",
    primaryVoice: "Cartesia Sonic - Indian Professional",
    tone: "financial-collections",
    language: "Hinglish / English",
    variables: ["callee_name", "amount_due", "due_date", "loan_id", "payment_link"],
    promptObjective: "Politely verify the callee identity, notify them about the pending EMI of ₹{{amount_due}} due on {{due_date}}, confirm when they can pay, and send payment link if agreed.",
  },
  {
    id: "loan-qualification",
    title: "Instant Loan Lead Qualification",
    category: "Financial",
    description: "Screen pre-approved loan inquiries, check employment status, monthly income, and route qualified leads to loan officers.",
    primaryVoice: "ElevenLabs - Professional Executive",
    tone: "financial-sales",
    language: "English / Hindi",
    variables: ["callee_name", "requested_amount", "employment_type", "monthly_salary"],
    promptObjective: "Acknowledge recent loan inquiry, qualify applicant criteria (employment & salary), and confirm intent to proceed.",
  },
  {
    id: "education-counseling",
    title: "Student Admissions & Course Counseling",
    category: "Education",
    description: "Guide prospective students through course curriculum, certification benefits, and schedule personalized faculty guidance.",
    primaryVoice: "Cartesia Sonic - Warm Counselor",
    tone: "education-counselor",
    language: "English / Hindi",
    variables: ["callee_name", "course_name", "batch_date", "counselor_name"],
    promptObjective: "Connect with prospective student {{callee_name}} interested in {{course_name}}, explain placement benefits and confirm demo slot on {{batch_date}}.",
  },
  {
    id: "candidate-screening",
    title: "HR First-Round Recruiter Screening",
    category: "HR & Recruitment",
    description: "Conduct preliminary screening for applicants: verify current notice period, salary expectations, and schedule interview.",
    primaryVoice: "Azure Neural - Warm Executive",
    tone: "hr-screening",
    language: "English",
    variables: ["callee_name", "job_role", "current_company", "notice_period"],
    promptObjective: "Reach out to job applicants for {{job_role}}, check their availability, notice period, and schedule technical interview on calendar.",
  },
  {
    id: "ecommerce-cart-recovery",
    title: "eCommerce Cart Recovery & Order Care",
    category: "eCommerce",
    description: "Re-engage abandoned cart shoppers with instant discount codes, verify shipping details, and offer instant checkout assistance.",
    primaryVoice: "Cartesia Sonic - Energetic Support",
    tone: "ecommerce-sales",
    language: "English / Hindi",
    variables: ["callee_name", "cart_item", "discount_code", "checkout_url"],
    promptObjective: "Call customer regarding abandoned item {{cart_item}}, offer exclusive coupon {{discount_code}}, and send checkout link.",
  },
] as const;

export const DEFAULT_STUDIO_PROMPT = `Hi, this is {{agent_name}} calling from {{company}}. Am I speaking with {{Callee Name}}?

[Wait]

"Okay—calling regarding {{call_purpose}}. Is now a good time, just two minutes?"

[Wait]

"Got it. And what's the best way you want us to proceed—quick update now, or schedule a time?"

[Wait]

Step 3: Main Point
• Lead with benefit: "I can get this sorted quickly so you don't have to follow up again."
• If any detail is needed: ask only the minimum required detail relevant to {{call_purpose}} (do not invent sensitive requirements).

Ask for commitment: "So should I go ahead and proceed with this now?"
• IF Yes: → Confirmation → Closing
• IF Objection: → Step 4
• IF Needs expert: → Transfer

Step 4: Objection Handling
Pattern: Acknowledge → Reframe → Soft Ask

"I understand. Actually, this will take less than two minutes. Do you want to do it now, or should I call you back at a better time?"

Step 5: Closing
• Confirm what was agreed

Subroutines
Callback: "No problem. When should I call you back—today evening or tomorrow morning?" → Confirm time → [END CALL]
Polite Exit: "Okay, no worries. If you need anything later, you can reach out to {{company}}. Take care." → [END CALL]
Transfer: "Sure, I'll connect you to the right person. Please hold." → [Transfer] → [END CALL]

FAQs
Trigger: "Why are you calling?"
• Response: "I'm calling from {{company}} regarding {{call_purpose}}."
• Action: "Is now a good time—two minutes?"

Trigger: "Is this about my number {{Mobile Number}}?"
• Response: "Yes, this call is on the number ending with {{Mobile Number}}."
• Action: "Just confirming—are you the right person to speak to about {{call_purpose}}?"

Trigger: "How do I know this is legit?"
• Response: "Don't share any OTP, PIN, or card details on calls. If you prefer, I can schedule a callback or you can verify via {{company}} official channel."
• Action: Offer callback or transfer to a human representative.

Scenario 1: Happy Path
Agent: "Hi, this is {{agent_name}} calling from {{company}}. Am I speaking with {{Callee Name}}?"
User: "Yes."
Agent: "Okay—calling regarding {{call_purpose}}. Is now a good time, just two minutes?"
User: "Yeah, tell me."
Agent: "Got it. To make sure I'm on the right request—can you confirm what this was about on your side?"
User: "It was about the request I raised."
Agent: "Right. I can proceed with the next step now. Should I go ahead?"
User: "Yes."
Agent: "Alright—done. I'll proceed and you'll get an update shortly. Bye." → [END CALL]

Scenario 2: Objection → Converted
User is hesitant; agent reframes and gets consent.
Agent: "Hi, this is {{agent_name}} calling from {{company}}. Am I speaking with {{Callee Name}}?"
User: "Yes, but what is it?"
Agent: "Calling regarding {{call_purpose}}. Is now a good time—two minutes?"
User: "Not really. Make it quick."
Agent: "Okay. One quick thing—can you confirm what this was about on your side?"
User: "Just an issue I reported."
Agent: "Got it. I can proceed with the next step right now so you don't have to follow up again. Should I go ahead?"
User: "Fine."
Agent: "Alright—done. You'll get an update shortly. Bye." → [END CALL]

Scenario 3: Busy → Callback
User is busy; agent schedules callback.
Agent: "Hi, this is {{agent_name}} calling from {{company}}. Am I speaking with {{Callee Name}}?"
User: "Yes, I'm busy."
Agent: "Okay. When should I call you back—today evening or tomorrow morning?"
User: "Tomorrow morning."
Agent: "Got it. I'll call tomorrow morning. Bye." → [END CALL]

Scenario 4: Edge Case — Transfer / Out of Scope
User asks for a specialist; agent transfers.
Agent: "Hi, this is {{agent_name}} calling from {{company}}. Am I speaking with {{Callee Name}}?"
User: "Yes. I want to talk to a person."
Agent: "Sure. I'll connect you to the right person. Please hold."
User: "Okay."
Agent: "Connecting you now." → [END CALL]
`;
