import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

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
  icon: varchar("icon", { length: 50 }).default("💼"),
  audioRate: varchar("audio_rate", { length: 20 }).default("1.00"),
  audioPitch: varchar("audio_pitch", { length: 20 }).default("1.00"),
  isDefault: boolean("is_default").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



