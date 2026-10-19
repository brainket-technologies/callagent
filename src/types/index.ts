export type Role = "owner" | "admin" | "member";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  walletBalance?: number | string;
  walletBalancePaise: number;
  currency: string;
  autoRechargeEnabled: boolean;
  autoRechargeThresholdPaise: number;
  autoRechargeAmountPaise: number;
  concurrencyLimit: number;
  dailyBudgetLimitPaise: number;
  createdAt: string;
}

export interface Assistant {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  direction: "outbound" | "inbound" | "both";
  voiceProvider: "cartesia" | "elevenlabs" | "azure" | "google" | "sarvam";
  voiceId: string;
  voiceName: string;
  selectedVoices?: string[];
  language: string;
  secondaryLanguage?: string;
  languages?: string[];
  tone?: string;
  firstMessage: string;
  interruptible: boolean;
  prompt: string;
  status: "active" | "draft" | "archived";
  assignedPhone?: string;
  totalCallsCount: number;
  averageHandleTimeSec: number;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallSession {
  id: string;
  workspaceId: string;
  assistantId: string;
  assistantName: string;
  campaignId?: string;
  direction: "inbound" | "outbound" | "webcall";
  calleeNumber: string;
  callerNumber: string;
  status: "completed" | "failed" | "busy" | "no_answer" | "in_progress" | "ringing";
  durationSeconds: number;
  billedDurationSeconds: number;
  costPaise: number;
  audioUrl?: string;
  endReason: "user_hangup" | "agent_hangup" | "transferred" | "zero_balance" | "max_duration" | "error";
  sttLatencyMs: number;
  ttftMs: number;
  ttsLatencyMs: number;
  sentiment: "positive" | "neutral" | "negative";
  structuredData?: Record<string, unknown>;
  createdAt: string;
}

export interface CallTranscriptLine {
  id: string;
  speaker: "agent" | "user" | "system";
  text: string;
  timestampSec: number;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface Campaign {
  id: string;
  workspaceId: string;
  assistantId: string;
  assistantName: string;
  name: string;
  type: "outbound_call" | "whatsapp" | "hybrid";
  status: "draft" | "scheduled" | "running" | "paused" | "completed";
  totalContacts: number;
  connectedCalls: number;
  connectivityRate: number;
  concurrencyLimit: number;
  retryAttempts: number;
  numberPoolId?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  workspaceId: string;
  type: "credit_recharge" | "debit_call_usage" | "debit_number_rental" | "debit_whatsapp" | "refund";
  amountPaise: number; // positive for credit, negative for debit
  balanceAfterPaise: number;
  currency: string;
  description: string;
  callSessionId?: string;
  paymentGateway?: "razorpay" | "stripe" | "manual";
  gatewayPaymentId?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface PhoneNumber {
  id: string;
  workspaceId: string;
  number: string;
  countryCode: string;
  provider: "voxera" | "ringg" | "twilio" | "plivo" | "exotel" | "tatatele";
  poolId?: string;
  poolName?: string;
  status: "active" | "quarantined" | "cooling_off";
  spamReputationScore: number; // 0 to 100
  assignedAssistantId?: string;
  assignedAssistantName?: string;
  monthlyRentalPaise: number;
  addedAt: string;
}

export interface NumberPool {
  id: string;
  workspaceId: string;
  name: string;
  strategy: "round_robin" | "least_utilized" | "sticky_caller_id";
  numbersCount: number;
  quarantinedCount: number;
  createdAt: string;
}

export interface ToolIntegration {
  id: string;
  workspaceId: string;
  slug: "cal_com" | "calendly" | "google_calendar" | "google_sheets" | "slack" | "whatsapp_business";
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  config?: Record<string, string>;
  lastSyncedAt?: string;
}

export interface SuperAdminTenant {
  id: string;
  workspaceName: string;
  ownerEmail: string;
  walletBalancePaise: number;
  totalCallsMonth: number;
  totalMinutesMonth: number;
  totalSpentPaiseMonth: number;
  status: "active" | "suspended" | "trial";
  activeTrunk: string;
  customRatePaise: number;
  createdAt: string;
}

export interface WholesaleCarrierTrunk {
  id: string;
  name: string;
  provider: "twilio" | "plivo" | "exotel" | "tata_tele";
  carrierCostPaisePerMin: number;
  retailPricePaisePerMin: number;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  successRate: number;
  activeChannels: number;
  maxChannels: number;
  priorityOrder: number;
}
