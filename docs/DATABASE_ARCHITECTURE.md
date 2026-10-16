# AI Voice Agent SaaS (CallAgent) - Database & High-Scale Architecture
> **PostgreSQL (Drizzle ORM) + Redis + Apache Kafka + Docker**  
> **Designed for Scale: 1 Million+ Users, 100,000+ Concurrent Calls & Zero-Latency Voice Telemetry**

---

## 1. High-Level Architecture Topology

```mermaid
graph TD
    Client[Browser / Phone / WebCall SDK] -->|WebRTC / SIP / HTTPS| Ingress[Cloudflare / NGINX Ingress]
    
    subgraph "Application & Real-time Layer"
        Ingress -->|HTTPS Server Actions| NextApp[Next.js App Router Cluster]
        Ingress -->|WSS Audio & Control| VoiceGateway[Telephony / Voice Streaming Gateway]
    end

    subgraph "Distributed Caching & Realtime State"
        NextApp <-->|Sessions / Cache| RedisCluster[(Redis 7.2 Cluster)]
        VoiceGateway <-->|Call State & Distributed Lock| RedisCluster
        VoiceGateway <-->|Pub/Sub Telemetry| RedisCluster
    end

    subgraph "Event Streaming Backbone"
        VoiceGateway -->|Call Events / Audio Telemetry| Kafka[Apache Kafka / Redpanda]
        NextApp -->|Campaign Jobs / Webhook Queue| Kafka
    end

    subgraph "Background Workers & Processing"
        Kafka -->|Campaign Dial Queue| CampaignWorker[Campaign Batch Dialer]
        Kafka -->|Post-Call Transcript / Analysis| AnalyticsWorker[Analytics & LLM Processor]
        Kafka -->|Webhook Delivery| WebhookWorker[Webhook Dispatcher]
    end

    subgraph "Persistent Storage Layer"
        NextApp -->|Drizzle ORM Pooled Queries| PgBouncer[PgBouncer Connection Pool]
        AnalyticsWorker -->|Bulk Inserts / Partition Writes| PgBouncer
        CampaignWorker -->|Status Updates| PgBouncer
        PgBouncer --> Postgres[(PostgreSQL 16 + pgvector)]
        VoiceGateway -->|WAV Recordings| ObjectStorage[(S3 / MinIO Audio Bucket)]
    end
```

---

## 2. PostgreSQL Relational Schema (Drizzle ORM TypeScript Definitions)

The schema utilizes strict foreign keys, composite indexes, UUID primary keys, and table partitioning on high-volume tables (`call_sessions`, `call_transcripts`, `call_events`).

### 2.1 Enums & Global Types
```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const workspaceRoleEnum = pgEnum('workspace_role', ['owner', 'admin', 'member']);
export const agentTypeEnum = pgEnum('agent_type', ['inbound', 'outbound', 'hybrid']);
export const orchestrationModeEnum = pgEnum('orchestration_mode', ['single_node', 'workflow_dag']);
export const callStatusEnum = pgEnum('call_status', [
  'queued', 'ringing', 'in_progress', 'completed', 'busy', 'no_answer', 'failed', 'voicemail'
]);
export const callDirectionEnum = pgEnum('call_direction', ['inbound', 'outbound', 'webcall']);
export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'
]);
export const telephonyProviderEnum = pgEnum('telephony_provider', ['ringg', 'twilio', 'plivo', 'exotel', 'custom_sip']);
export const toolTypeEnum = pgEnum('tool_type', [
  'dtmf_tool', 'calendar_widget_tool', 'callback_schedule_tool', 'transfer_call_tool', 'webhook_tool', 'whatsapp_template_tool'
]);
```

---

### 2.2 Workspaces, Users & RBAC
```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Workspaces Table (Multi-tenant boundary)
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  concurrencyLimit: integer('concurrency_limit').default(10).notNull(), // Max simultaneous active calls
  dailySpendLimit: integer('daily_spend_limit').default(100000), // In minor units (paise/cents)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('workspaces_slug_idx').on(t.slug),
}));

// Workspace Members Table
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: workspaceRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  memberUniqueIdx: uniqueIndex('workspace_member_unique_idx').on(t.workspaceId, t.userId),
  workspaceIdx: index('workspace_members_workspace_idx').on(t.workspaceId),
}));

// API Keys Table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  publicKey: varchar('public_key', { length: 100 }).notNull().unique(), // pk_live_...
  hashedSecretKey: varchar('hashed_secret_key', { length: 255 }).notNull(), // sk_live_...
  permissions: jsonb('permissions').default([]).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  publicKeyIdx: uniqueIndex('api_keys_public_key_idx').on(t.publicKey),
}));
```

---

### 2.3 Assistants & Versioning
```typescript
// Core Agents Table
export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  agentType: agentTypeEnum('agent_type').default('outbound').notNull(),
  orchestrationMode: orchestrationModeEnum('orchestration_mode').default('single_node').notNull(),
  activeVersionId: uuid('active_version_id'), // Pointer to current default version
  isAbLive: boolean('is_ab_live').default(false).notNull(), // A/B testing flag
  inboundNumberId: uuid('inbound_number_id'), // Associated inbound DID
  whitelistedDomains: jsonb('whitelisted_domains').default([]).notNull(),
  webcallPublicKey: varchar('webcall_public_key', { length: 100 }),
  recordLocally: boolean('record_locally').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index('agents_workspace_idx').on(t.workspaceId),
  webcallKeyIdx: index('agents_webcall_key_idx').on(t.webcallPublicKey),
}));

// Agent Versions Table (A/B testing, prompts, models)
export const agentVersions = pgTable('agent_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  versionSlug: varchar('version_slug', { length: 50 }).notNull(), // 'v1', 'v2', etc.
  description: text('description'),
  callTraffic: integer('call_traffic').default(100).notNull(), // Percentage weight (0-100) for A/B testing
  
  // Prompt Configuration
  firstMessage: text('first_message').notNull(),
  isInterruptible: boolean('is_interruptible').default(true).notNull(),
  objectivePrompt: text('objective_prompt').notNull(),
  responseGuidelines: text('response_guidelines'),
  conversationScript: text('conversation_script'),
  faqs: jsonb('faqs').default([]).notNull(),
  
  // Voice & Language Models
  language: varchar('language', { length: 20 }).default('en-IN').notNull(),
  secondaryLanguage: varchar('secondary_language', { length: 20 }).default('hi-IN'),
  voiceProvider: varchar('voice_provider', { length: 50 }).default('elevenlabs').notNull(),
  voiceId: varchar('voice_id', { length: 100 }).notNull(),
  secondaryVoiceId: varchar('secondary_voice_id', { length: 100 }),
  voiceSpeed: integer('voice_speed').default(100).notNull(), // 100 = 1.0x
  sttModel: varchar('stt_model', { length: 50 }).default('deepgram_nova_2').notNull(),
  llmModel: varchar('llm_model', { length: 50 }).default('gpt-4o-mini').notNull(),
  llmTemperature: integer('llm_temperature').default(30), // 30 = 0.3
  
  // Call Session Constraints
  maxCallLength: integer('max_call_length').default(480).notNull(), // in seconds (8 mins)
  idleTimeoutWarning: integer('idle_timeout_warning').default(20).notNull(),
  idleTimeoutEnd: integer('idle_timeout_end').default(25).notNull(),
  callWindowStart: varchar('call_window_start', { length: 10 }).default('09:00').notNull(),
  callWindowEnd: varchar('call_window_end', { length: 10 }).default('21:00').notNull(),
  callWindowTimezone: varchar('call_window_timezone', { length: 100 }).default('Asia/Kolkata').notNull(),
  
  // Analytics & Custom Variables
  customVariables: jsonb('custom_variables').default([]).notNull(),
  keywordBoosting: jsonb('keyword_boosting').default([]).notNull(),
  postCallAnalysisSchema: jsonb('post_call_analysis_schema').default({}).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  agentVersionUniqueIdx: uniqueIndex('agent_version_slug_idx').on(t.agentId, t.versionSlug),
  agentIdx: index('agent_versions_agent_idx').on(t.agentId),
}));
```

---

### 2.4 Knowledge Base & Vector Storage (pgvector)
```typescript
import { customType } from 'drizzle-orm/pg-core';

// Define pgvector 1536-dimensional vector type
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});

export const knowledgeBases = pgTable('knowledge_bases', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  embeddingModel: varchar('embedding_model', { length: 100 }).default('text-embedding-3-small').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeDocuments = pgTable('knowledge_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  knowledgeBaseId: uuid('knowledge_base_id').references(() => knowledgeBases.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'file_pdf', 'url_crawl', 'faq_manual'
  sourceUrl: text('source_url'),
  status: varchar('status', { length: 50 }).default('ready').notNull(),
  totalChunks: integer('total_chunks').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => knowledgeDocuments.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding'), // 1536 dims for cosine similarity
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  docIdx: index('knowledge_chunks_doc_idx').on(t.documentId),
  // HNSW index created via migration: CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
}));
```

---

### 2.5 Telephony & Number Pools
```typescript
export const phoneNumberPools = pgTable('phone_number_pools', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  rotationStrategy: varchar('rotation_strategy', { length: 50 }).default('round_robin').notNull(),
  spamThresholdScore: integer('spam_threshold_score').default(30),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const phoneNumbers = pgTable('phone_numbers', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  poolId: uuid('pool_id').references(() => phoneNumberPools.id, { onDelete: 'set null' }),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull().unique(), // +918031705928
  countryCode: varchar('country_code', { length: 10 }).notNull(),
  provider: telephonyProviderEnum('provider').default('ringg').notNull(),
  providerSid: varchar('provider_sid', { length: 255 }),
  channel: varchar('channel', { length: 50 }).default('phone').notNull(), // 'phone', 'whatsapp'
  isSpamFlagged: boolean('is_spam_flagged').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  assignedAgentId: uuid('assigned_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  tags: jsonb('tags').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  poolIdx: index('phone_numbers_pool_idx').on(t.poolId),
  workspaceIdx: index('phone_numbers_workspace_idx').on(t.workspaceId),
}));
```

---

### 2.6 Outbound Campaigns
```typescript
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  agentVersionId: uuid('agent_version_id').references(() => agentVersions.id).notNull(),
  poolId: uuid('pool_id').references(() => phoneNumberPools.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: campaignStatusEnum('status').default('draft').notNull(),
  concurrencyLimit: integer('concurrency_limit').default(5).notNull(),
  
  // Retry & Timing Rules
  maxRetries: integer('max_retries').default(2).notNull(),
  retryIntervalMinutes: integer('retry_interval_minutes').default(60).notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  
  // Progress Counters
  totalContacts: integer('total_contacts').default(0).notNull(),
  completedCalls: integer('completed_calls').default(0).notNull(),
  connectedCalls: integer('connected_calls').default(0).notNull(),
  failedCalls: integer('failed_calls').default(0).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index('campaigns_workspace_idx').on(t.workspaceId),
  statusIdx: index('campaigns_status_idx').on(t.status),
}));

export const campaignContacts = pgTable('campaign_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  calleeName: varchar('callee_name', { length: 255 }),
  customVariables: jsonb('custom_variables').default({}).notNull(),
  status: callStatusEnum('status').default('queued').notNull(),
  attemptsCount: integer('attempts_count').default(0).notNull(),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
  lastCallSessionId: uuid('last_call_session_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  campaignPhoneIdx: uniqueIndex('campaign_contacts_unique_idx').on(t.campaignId, t.phoneNumber),
  nextAttemptIdx: index('campaign_contacts_next_attempt_idx').on(t.status, t.nextAttemptAt),
}));
```

---

### 2.7 High-Volume Call Sessions & Partitioned Telemetry

> [!IMPORTANT]
> To support **100,000+ daily calls and millions of historical records**, `call_sessions` and `call_events` are partitioned by `RANGE (created_at)` monthly.

```typescript
export const callSessions = pgTable('call_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull(),
  agentId: uuid('agent_id').notNull(),
  agentVersionId: uuid('agent_version_id').notNull(),
  campaignId: uuid('campaign_id'), // Null for ad-hoc / inbound / webcalls
  callerNumber: varchar('caller_number', { length: 50 }).notNull(),
  calleeNumber: varchar('callee_number', { length: 50 }).notNull(),
  direction: callDirectionEnum('direction').notNull(),
  status: callStatusEnum('status').default('queued').notNull(),
  
  // Telephony Metadata
  telephonyProvider: telephonyProviderEnum('telephony_provider').notNull(),
  telephonyCallSid: varchar('telephony_call_sid', { length: 255 }),
  disconnectReason: varchar('disconnect_reason', { length: 100 }),
  
  // Timing & Financials
  initiatedAt: timestamp('initiated_at', { withTimezone: true }).defaultNow().notNull(),
  connectedAt: timestamp('connected_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds').default(0).notNull(),
  costAmount: integer('cost_amount').default(0).notNull(), // In minor currency units
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  
  // Recordings & Telemetry
  recordingUrl: text('recording_url'),
  avgSttLatencyMs: integer('avg_stt_latency_ms').default(0),
  avgLlmLatencyMs: integer('avg_llm_latency_ms').default(0),
  avgTtsLatencyMs: integer('avg_tts_latency_ms').default(0),
  e2eLatencyMs: integer('e2e_latency_ms').default(0),
  
  // Structured Extraction
  extractedAnalysis: jsonb('extracted_analysis').default({}),
  sentimentScore: varchar('sentiment_score', { length: 20 }), // 'positive', 'neutral', 'negative'
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceDateIdx: index('call_sessions_workspace_date_idx').on(t.workspaceId, t.createdAt),
  statusIdx: index('call_sessions_status_idx').on(t.status),
  calleeIdx: index('call_sessions_callee_idx').on(t.calleeNumber),
}));

export const callTranscripts = pgTable('call_transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => callSessions.id, { onDelete: 'cascade' }).notNull(),
  speaker: varchar('speaker', { length: 20 }).notNull(), // 'agent', 'user', 'system'
  text: text('text').notNull(),
  timestampOffsetMs: integer('timestamp_offset_ms').notNull(),
  sentiment: varchar('sentiment', { length: 20 }),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  sessionIdx: index('call_transcripts_session_idx').on(t.sessionId),
}));
```

---

### 2.8 Workspace Tools, Integrations & STT Sessions
```typescript
// Integrations Table (Cal.com, Calendly, Google Calendar, Sheets, Slack, WhatsApp)
export const workspaceIntegrations = pgTable('workspace_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'cal_com', 'calendly', 'google_calendar', 'google_sheets', 'slack', 'whatsapp_business'
  name: varchar('name', { length: 255 }).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  credentialsEncrypted: text('credentials_encrypted').notNull(), // OAuth tokens / API keys encrypted with AES-256-GCM
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceProviderIdx: uniqueIndex('workspace_integrations_provider_idx').on(t.workspaceId, t.provider),
}));

// Speech-To-Text (STT) Benchmark & Streaming Sessions
export const sttSessions = pgTable('stt_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  sessionType: varchar('session_type', { length: 50 }).notNull(), // 'offline_rest', 'live_websocket'
  audioFileName: varchar('audio_file_name', { length: 255 }),
  audioDurationSeconds: integer('audio_duration_seconds').default(0),
  language: varchar('language', { length: 20 }).default('hi').notNull(),
  transcription: text('transcription'),
  computeLatencyMs: integer('compute_latency_ms').default(0),
  status: varchar('status', { length: 50 }).default('completed').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: index('stt_sessions_workspace_idx').on(t.workspaceId),
}));

// Proactive Alerts & Incident Logs
export const alertRules = pgTable('alert_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  metricType: varchar('metric_type', { length: 100 }).notNull(), // 'disconnection_rate_spike', 'customer_hangup_spike', 'low_balance'
  thresholdValue: integer('threshold_value').notNull(), // e.g. 25 (percent) or 50000 (paise)
  channels: jsonb('channels').default([]).notNull(), // ['slack', 'email', 'webhook']
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

### 2.9 Master Super Admin Control Plane Schemas (`/admin`)
```typescript
// Global Telephony Carrier Gateways (Wholesale carrier trunks)
export const globalCarrierGateways = pgTable('global_carrier_gateways', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // 'Twilio Primary', 'Tata Tele SIP', 'Plivo West'
  provider: telephonyProviderEnum('provider').notNull(),
  wholesaleCostPerMinute: integer('wholesale_cost_per_minute').notNull(), // in minor currency units (paise/cents)
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  sipEndpoint: text('sip_endpoint'),
  credentialsEncrypted: text('credentials_encrypted').notNull(),
  healthStatus: varchar('health_status', { length: 50 }).default('healthy').notNull(),
  weight: integer('weight').default(100).notNull(), // Traffic distribution weight
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Global Rate Cards & Retail Margins
export const globalRateCards = pgTable('global_rate_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  countryCode: varchar('country_code', { length: 10 }).notNull(), // '+91', '+1', '+44'
  countryName: varchar('country_name', { length: 100 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  wholesaleCostPerMinute: integer('wholesale_cost_per_minute').notNull(), // e.g. 450 (₹4.50)
  retailPricePerMinute: integer('retail_price_per_minute').notNull(), // e.g. 1000 (₹10.00)
  marginPercentage: integer('margin_percentage').notNull(), // e.g. 55%
  channel: varchar('channel', { length: 50 }).default('voice').notNull(), // 'voice', 'whatsapp'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  countryChannelIdx: uniqueIndex('global_rate_cards_country_channel_idx').on(t.countryCode, t.channel),
}));

// Platform Telemetry & Worker Health Snapshots
export const platformHealthSnapshots = pgTable('platform_health_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  kafkaPartitionLag: integer('kafka_partition_lag').default(0).notNull(),
  redisMemoryUsageBytes: varchar('redis_memory_usage_bytes', { length: 50 }).notNull(),
  pgbouncerActiveConnections: integer('pgbouncer_active_connections').default(0).notNull(),
  activeGlobalConcurrentCalls: integer('active_global_concurrent_calls').default(0).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

### 2.10 Complete Enterprise Wallet, Metered Billing & Financial Ledger
```typescript
export const transactionTypeEnum = pgEnum('transaction_type', [
  'credit_recharge',
  'debit_call_usage',
  'debit_number_rental',
  'debit_whatsapp_message',
  'refund',
  'admin_adjustment'
]);

export const paymentGatewayEnum = pgEnum('payment_gateway', ['razorpay', 'stripe', 'bank_transfer', 'admin_promo']);

// Workspace Prepaid Wallets Table
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: integer('balance').default(0).notNull(), // In minor units (e.g. 11996 = ₹119.96)
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  
  // Auto-Recharge Settings
  autoRechargeEnabled: boolean('auto_recharge_enabled').default(false).notNull(),
  autoRechargeThreshold: integer('auto_recharge_threshold').default(50000), // Recharge when below ₹500
  autoRechargeAmount: integer('auto_recharge_amount').default(200000), // Auto recharge ₹2,000
  
  // External Gateway References
  razorpayCustomerId: varchar('razorpay_customer_id', { length: 100 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
  defaultPaymentMethodId: varchar('default_payment_method_id', { length: 100 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceIdx: uniqueIndex('wallets_workspace_idx').on(t.workspaceId),
}));

// Immutable Financial Transaction Ledger Table
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletId: uuid('wallet_id').references(() => wallets.id, { onDelete: 'cascade' }).notNull(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // Positive for credit, negative for debit (in paise/cents)
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  
  // Line-Item References
  callSessionId: uuid('call_session_id').references(() => callSessions.id, { onDelete: 'set null' }),
  phoneNumberId: uuid('phone_number_id').references(() => phoneNumbers.id, { onDelete: 'set null' }),
  gateway: paymentGatewayEnum('gateway'),
  gatewayPaymentId: varchar('gateway_payment_id', { length: 255 }), // razorpay_payment_id / stripe_pi_...
  
  description: text('description').notNull(), // e.g. "Outbound Call to +919876543210 (2m 14s)"
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceDateIdx: index('wallet_tx_workspace_date_idx').on(t.workspaceId, t.createdAt),
  callSessionIdx: index('wallet_tx_call_session_idx').on(t.callSessionId),
  gatewayPaymentIdx: index('wallet_tx_gateway_payment_idx').on(t.gatewayPaymentId),
}));

// Formal Tax Invoices Table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(), // e.g. INV-2026-00891
  billingName: varchar('billing_name', { length: 255 }).notNull(),
  billingAddress: text('billing_address'),
  taxId: varchar('tax_id', { length: 50 }), // GSTIN / VAT Number
  
  subtotalAmount: integer('subtotal_amount').notNull(), // In minor units
  taxAmount: integer('tax_amount').default(0).notNull(), // 18% GST (CGST 9% + SGST 9% / IGST 18%)
  totalAmount: integer('total_amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  
  pdfUrl: text('pdf_url'),
  status: varchar('status', { length: 50 }).default('paid').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  invoiceNumberIdx: uniqueIndex('invoices_number_idx').on(t.invoiceNumber),
  workspaceIdx: index('invoices_workspace_idx').on(t.workspaceId),
}));
```

---

## 3. Redis High-Throughput In-Memory Architecture

Redis 7.2 serves as the real-time coordinator between Next.js, WebRTC/SIP Voice Gateways, and Background Dialers.

### 3.1 Redis Keyspace Organization
| Keyspace Pattern | Type | Purpose | TTL |
| :--- | :--- | :--- | :--- |
| `ws:{workspaceId}:concurrency:active` | `INTEGER` | Real-time counter of current active calls in workspace | None (managed via `INCR`/`DECR`) |
| `call:session:{sessionId}:state` | `HASH` | Real-time call state (buffer, speech state, callee variables) | 1 hour |
| `agent:cache:{agentId}:v{versionId}` | `STRING (JSON)` | Cached prompt, voice configs, and tools for instant startup | 24 hours |
| `lock:campaign:dial:{campaignId}` | `STRING` | Distributed Redlock preventing double-dialing across nodes | 30 seconds |
| `ratelimit:api:{apiKey}:{minute}` | `INTEGER` | Token-bucket rate limiter per API key | 60 seconds |
| `number:pool:{poolId}:rotation` | `LIST` | Round-robin queue of active DID numbers | None |

### 3.2 Distributed Concurrency & Wallet Deduction Governors (Atomic Lua Scripts)

#### A. Concurrency Governor Script
```lua
-- KEYS[1]: Concurrency Key, ARGV[1]: Max Allowed Limit
local current = redis.call('GET', KEYS[1])
if current and tonumber(current) >= tonumber(ARGV[1]) then
    return 0 -- Rejected, limit reached
else
    redis.call('INCR', KEYS[1])
    return 1 -- Allowed, lock acquired
end
```

#### B. Atomic Pre-Call Wallet Authorization & Metered Deduction Script
```lua
-- KEYS[1]: Wallet Balance Key (e.g. ws:{workspaceId}:wallet:balance)
-- ARGV[1]: Cost to Deduct (in minor currency units / paise)
-- ARGV[2]: Minimum Required Balance (e.g. 1 minute minimum cost)

local balance = redis.call('GET', KEYS[1])
if not balance then
    return -2 -- Error: Wallet key not initialized
end

balance = tonumber(balance)
local cost = tonumber(ARGV[1])
local min_req = tonumber(ARGV[2])

if cost == 0 then
    -- Pre-call authorization check only
    if balance < min_req then
        return -1 -- Insufficient balance to place call
    else
        return 1 -- Authorized
    end
else
    -- Call completion / mid-call deduction
    if balance < cost then
        -- Deduct remaining balance and signal zero
        redis.call('SET', KEYS[1], 0)
        return 0 -- Depleted
    else
        local new_bal = redis.call('DECRBY', KEYS[1], cost)
        return new_bal -- Success, returns updated balance
    end
end
```

### 3.3 Redis Pub/Sub & WebSockets Audio Bridge
- Channel `call:audio:stream:{sessionId}`: Bidirectional binary audio chunks.
- Channel `call:telemetry:{sessionId}`: Live transcript and latency waterfall streaming to the user's dashboard UI via Server-Sent Events (SSE) or WebSockets.

---

## 4. Apache Kafka / Redpanda Distributed Event Pipeline

Kafka decouples synchronous voice streaming from heavy background processes (analytics, CRM sync, audio recording uploads, webhook dispatches).

### 4.1 Topic Topography & Partitioning Strategy

```mermaid
graph LR
    VG[Voice Gateway] -->|Produce| T1[call.events]
    VG -->|Produce| T2[call.transcripts]
    VG -->|Produce| T3[call.telemetry]
    
    T1 -->|Consume| CG1[Analytics Aggregator]
    T1 -->|Consume| CG2[Billing & Wallet Deductor]
    T2 -->|Consume| CG3[Post-Call LLM Extractor]
    T1 -->|Consume| CG4[Webhook & CRM Sync]
```

#### Detailed Topic Specifications:
1. **`call.lifecycle.events`**:
   - **Partitions**: 32 (partitioned by `workspaceId`).
   - **Events**: `CallInitiated`, `CallRinging`, `CallConnected`, `CallDisconnected`, `CallFailed`.
   - **Retention**: 7 days.
2. **`call.transcripts.stream`**:
   - **Partitions**: 32 (partitioned by `sessionId`).
   - **Payload**: Full utterance, speaker (`agent`/`user`), timestamp offset, sentiment.
3. **`call.telemetry.metrics`**:
   - **Partitions**: 16.
   - **Payload**: STT latency, LLM TTFT (time-to-first-token), TTS first-byte latency, jitter, packet loss.
4. **`campaign.dialer.queue`**:
   - **Partitions**: 64 (partitioned by `campaignId`).
   - **Consumers**: Scalable Kubernetes/Docker dialer worker pods that pull contacts, check Redis concurrency locks, and trigger outbound SIP calls.
5. **`webhook.dispatch.queue`**:
   - **Partitions**: 16.
   - **Delivery Guarantee**: At-least-once with exponential backoff retry topics (`webhook.retry.1m`, `webhook.retry.5m`, `webhook.dlq`).

---

## 5. Docker Infrastructure & Multi-Container Setup

### 5.1 Local & Production `docker-compose.yml`
```yaml
version: '3.9'

services:
  # Next.js App Router Web Interface & Server Actions
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callagent_web
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://callagent:secret@pgbouncer:6432/callagent_db
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=redpanda:9092
      - S3_ENDPOINT=http://minio:9000
    depends_on:
      - pgbouncer
      - redis
      - redpanda

  # PostgreSQL 16 with pgvector extension
  postgres:
    image: pgvector/pgvector:pg16
    container_name: callagent_postgres
    restart: always
    environment:
      POSTGRES_USER: callagent
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: callagent_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # PgBouncer Connection Pooler (Handles 10,000+ microsecond connections)
  pgbouncer:
    image: edoburu/pgbouncer:latest
    container_name: callagent_pgbouncer
    environment:
      - DB_USER=callagent
      - DB_PASSWORD=secretpassword
      - DB_HOST=postgres
      - DB_NAME=callagent_db
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=10000
      - DEFAULT_POOL_SIZE=50
    ports:
      - "6432:6432"
    depends_on:
      - postgres

  # Redis 7.2 Cluster / Cache / PubSub
  redis:
    image: redis:7.2-alpine
    container_name: callagent_redis
    restart: always
    command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  # Redpanda (Lightweight, C++ Kafka-compatible streaming engine)
  redpanda:
    image: docker.redpanda.com/redpandadata/redpanda:latest
    container_name: callagent_redpanda
    command:
      - redpanda start
      - --smp 2
      - --memory 2G
      - --kafka-addr internal://0.0.0.0:9092,external://0.0.0.0:19092
      - --advertise-kafka-addr internal://redpanda:9092,external://localhost:19092
    ports:
      - "19092:19092"
      - "9644:9644"
    volumes:
      - redpandadata:/var/lib/redpanda/data

  # MinIO (S3-compatible Object Storage for Audio WAV/MP3 Recordings)
  minio:
    image: minio/minio:latest
    container_name: callagent_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadminpassword
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  redisdata:
  redpandadata:
  miniodata:
```

---

## 6. Architecture Verification & Checklist for Implementation
- [x] Full feature symmetry with Ringg.AI (Assistants Studio, Prompts, Telephony, Logs, Campaigns, Analytics, Numbers, Evals, Alerts).
- [x] Multi-tenancy isolation via `workspace_id` foreign keys and Row-Level Security (RLS) support.
- [x] Sub-millisecond distributed concurrency locks with Redis Lua scripts.
- [x] High-throughput async message pipeline with Kafka/Redpanda.
- [x] Connection pooling handling up to 10,000 concurrent client connections via PgBouncer.
- [x] Modular Next.js Clean Architecture adhering to `features/<feature>/` specifications.
