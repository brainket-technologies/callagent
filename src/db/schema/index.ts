import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer, numeric } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 255 }).notNull().default("Administrator"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentGateways = pgTable("payment_gateways", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  mode: varchar("mode", { length: 20 }).notNull().default("live"),
  liveKeyId: text("live_key_id"),
  liveSecret: text("live_secret"),
  liveWebhookSecret: text("live_webhook_secret"),
  testKeyId: text("test_key_id"),
  testSecret: text("test_secret"),
  testWebhookSecret: text("test_webhook_secret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated separate table for Tools & Integrations
export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: text("icon"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  configKey: text("config_key").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for Telephony Carriers / Providers added by SuperAdmin
export const telephonyProviders = pgTable("telephony_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  authType: varchar("auth_type", { length: 50 }).notNull().default("api_key_and_token"),
  docsUrl: text("docs_url"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User configured provider credentials and numbers
export const userTelephonyConfigs = pgTable("user_telephony_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  providerSlug: varchar("provider_slug", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  apiKey: text("api_key").notNull(),
  authToken: text("auth_token").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for AI Voice Models (Cartesia, ElevenLabs, Google, Sarvam, etc.)
export const aiVoices = pgTable("ai_voices", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull().default("Cartesia"),
  voiceId: varchar("voice_id", { length: 150 }).notNull(),
  model: varchar("model", { length: 100 }).default("Sonic-3.5"),
  tag: varchar("tag", { length: 50 }).default("Neutral"),
  gender: varchar("gender", { length: 20 }).default("female"),
  languages: jsonb("languages").default([]),
  tone: varchar("tone", { length: 100 }),
  previewAudioUrl: text("preview_audio_url"),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for Supported System Languages managed by SuperAdmin
export const systemLanguages = pgTable("system_languages", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }),
  flagEmoji: varchar("flag_emoji", { length: 20 }).default("🇮🇳"),
  sampleText: text("sample_text"),
  isPrimary: boolean("is_primary").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for Conversational Tones / Speaking Styles managed by SuperAdmin
export const systemTones = pgTable("system_tones", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  description: text("description"),
  promptInstruction: text("prompt_instruction"),
  sampleText: text("sample_text"),
  sampleTextEn: text("sample_text_en"),
  icon: varchar("icon", { length: 50 }).default("💼"),
  audioRate: varchar("audio_rate", { length: 20 }).default("1.00"),
  audioPitch: varchar("audio_pitch", { length: 20 }).default("1.00"),
  isDefault: boolean("is_default").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for System Currencies ("WAHA SE ADD HOGI CURRENCY")
export const systemCurrencies = pgTable("system_currencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 10 }).notNull().unique(), // e.g. "INR", "USD", "EUR", "AED", "GBP"
  name: varchar("name", { length: 100 }).notNull(), // e.g. "Indian Rupee", "US Dollar"
  symbol: varchar("symbol", { length: 15 }).notNull().default("₹"), // "₹", "$", "€", "د.إ", "£"
  exchangeRate: varchar("exchange_rate", { length: 30 }).notNull().default("1.00"), // Multiplier relative to Base Currency (1 INR = X target currency)
  isBaseCurrency: boolean("is_base_currency").notNull().default(false), // Base currency flag
  isDefault: boolean("is_default").notNull().default(false), // Default selected currency
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for Services & Customer Rate Card ("kiska kitna amount lenge hum log")
export const servicePricing = pgTable("service_pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  serviceName: varchar("service_name", { length: 150 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default("calling"), // calling, messaging, telephony, ai_voice, recording, number
  customerRate: varchar("customer_rate", { length: 50 }).notNull().default("2.00"), // e.g. "2.00", "0.25"
  ratePaise: integer("rate_paise").notNull().default(200), // 200 = ₹2.00
  billingUnit: varchar("billing_unit", { length: 50 }).notNull().default("Per minute"), // Per minute, Per SMS, Per minute or usage, Per day/month
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  currencyId: uuid("currency_id"),
  isConfigurable: boolean("is_configurable").notNull().default(false),
  icon: varchar("icon", { length: 50 }).default("⚡"),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated table for Wallet & Usage Billing Transactions
export const billingTransactions = pgTable("billing_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  txnNumber: varchar("txn_number", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // recharge, call_usage, sms_usage, number_rental, recording_usage
  serviceName: varchar("service_name", { length: 150 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  balanceAfter: numeric("balance_after", { precision: 12, scale: 2 }).notNull().default("0.00"),
  billingUnit: varchar("billing_unit", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
  gateway: varchar("gateway", { length: 50 }),
  status: varchar("status", { length: 30 }).notNull(), // success, pending, failed
  timestampStr: varchar("timestamp_str", { length: 100 }),
  invoiceUrl: text("invoice_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().default("User"),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  device: varchar("device", { length: 150 }).default("Desktop · macOS"),
  browser: varchar("browser", { length: 150 }).default("Chrome 155"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated Workspaces Table ("user , work spase table donno alg agl hogi")
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  ownerId: uuid("owner_id").references(() => users.id),
  walletBalance: numeric("wallet_balance", { precision: 12, scale: 2 }).notNull().default("200.00"),
  concurrencyLimit: integer("concurrency_limit").notNull().default(2),
  concurrencyBilledAt: timestamp("concurrency_billed_at").defaultNow(),
  currency: varchar("currency", { length: 10 }).notNull().default("INR"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Workspace Members mapping table
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dedicated table for Workspace Company Details / KYC
export const workspaceCompanyDetails = pgTable("workspace_company_details", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  isBusiness: boolean("is_business").notNull().default(false),
  gstin: varchar("gstin", { length: 20 }),
  entityType: varchar("entity_type", { length: 100 }),
  companyName: varchar("company_name", { length: 255 }).notNull().default(""),
  pan: varchar("pan", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dedicated OTP Verifications Table
export const userOtpVerifications = pgTable("user_otp_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull().default("1234"),
  isVerified: boolean("is_verified").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dedicated Workspace Activity & Audit Logs Table
export const workspaceLogs = pgTable("workspace_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: varchar("user_email", { length: 255 }),
  operation: varchar("operation", { length: 150 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }),
  resourceType: varchar("resource_type", { length: 50 }).default("general"),
  details: jsonb("details").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dedicated Workspace API Keys Table
export const workspaceApiKeys = pgTable("workspace_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull().default("Default Secret Key"),
  key: varchar("key", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});





