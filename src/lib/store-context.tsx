"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Workspace,
  Assistant,
  CallSession,
  Campaign,
  WalletTransaction,
  PhoneNumber,
  NumberPool,
  ToolIntegration,
  SuperAdminTenant,
  WholesaleCarrierTrunk,
} from "@/types";
import {
  initialWorkspace,
  initialAssistants,
  initialCallSessions,
  initialCampaigns,
  initialTransactions,
  initialPhoneNumbers,
  initialNumberPools,
  initialIntegrations,
  initialAdminTenants,
  initialCarrierTrunks,
} from "./mock-data";
import { DEFAULT_STUDIO_PROMPT } from "./constants";

interface StoreContextType {
  workspace: Workspace;
  assistants: Assistant[];
  calls: CallSession[];
  campaigns: Campaign[];
  transactions: WalletTransaction[];
  phoneNumbers: PhoneNumber[];
  numberPools: NumberPool[];
  integrations: ToolIntegration[];
  adminTenants: SuperAdminTenant[];
  carrierTrunks: WholesaleCarrierTrunk[];
  activeCall: {
    inProgress: boolean;
    assistant?: Assistant;
    durationSec: number;
    costPaise: number;
    calleeNumber?: string;
  } | null;
  rechargeModalOpen: boolean;
  setRechargeModalOpen: (open: boolean) => void;
  testCallDrawerOpen: boolean;
  setTestCallDrawerOpen: (open: boolean) => void;
  selectedAssistantForTest: Assistant | null;
  setSelectedAssistantForTest: (assistant: Assistant | null) => void;
  // Actions
  rechargeWallet: (amountPaise: number, gateway: "razorpay" | "stripe") => void;
  deductCallUsage: (durationSec: number, assistant: Assistant, calleeNumber: string) => { success: boolean; reason?: string };
  startWebCall: (assistant: Assistant, calleeNumber?: string) => { success: boolean; error?: string };
  endWebCall: () => void;
  createAssistant: (newAssistant: Partial<Assistant>) => Assistant;
  updateAssistant: (id: string, updates: Partial<Assistant>) => void;
  deleteAssistant: (id: string) => void;
  createCampaign: (campaign: Partial<Campaign>) => Campaign;
  toggleIntegration: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [assistants, setAssistants] = useState<Assistant[]>(initialAssistants);
  const [calls, setCalls] = useState<CallSession[]>(initialCallSessions);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(initialPhoneNumbers);
  const [numberPools, setNumberPools] = useState<NumberPool[]>(initialNumberPools);
  const [integrations, setIntegrations] = useState<ToolIntegration[]>(initialIntegrations);
  const [adminTenants, setAdminTenants] = useState<SuperAdminTenant[]>(initialAdminTenants);
  const [carrierTrunks, setCarrierTrunks] = useState<WholesaleCarrierTrunk[]>(initialCarrierTrunks);

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [testCallDrawerOpen, setTestCallDrawerOpen] = useState(false);
  const [selectedAssistantForTest, setSelectedAssistantForTest] = useState<Assistant | null>(initialAssistants[0]);

  const [activeCall, setActiveCall] = useState<{
    inProgress: boolean;
    assistant?: Assistant;
    durationSec: number;
    costPaise: number;
    calleeNumber?: string;
  } | null>(null);

  // Per-second real-time deduction ticker while call is active
  useEffect(() => {
    if (!activeCall || !activeCall.inProgress) return;

    const interval = setInterval(() => {
      setActiveCall((prev) => {
        if (!prev || !prev.inProgress) return null;
        const newDuration = prev.durationSec + 1;
        // ₹10.00 / 60s = ~16.67 paise per second
        const ratePerSecPaise = 1000 / 60;
        const currentCost = Math.round(newDuration * ratePerSecPaise);

        // Check mid-call zero balance guard!
        if (workspace.walletBalancePaise <= 0) {
          // Zero balance reached mid-call: trigger automatic hangup!
          clearInterval(interval);
          setTimeout(() => {
            endWebCall();
            alert("Call disconnected: Wallet balance exhausted to ₹0.00. Please recharge your account.");
          }, 100);
          return { ...prev, inProgress: false };
        }

        // Incrementally deduct 1 second from wallet
        setWorkspace((ws) => ({
          ...ws,
          walletBalancePaise: Math.max(0, ws.walletBalancePaise - Math.round(ratePerSecPaise)),
        }));

        return {
          ...prev,
          durationSec: newDuration,
          costPaise: currentCost,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall?.inProgress, workspace.walletBalancePaise]);

  const rechargeWallet = (amountPaise: number, gateway: "razorpay" | "stripe") => {
    const newBalance = workspace.walletBalancePaise + amountPaise;
    setWorkspace((prev) => ({
      ...prev,
      walletBalancePaise: newBalance,
    }));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      workspaceId: workspace.id,
      type: "credit_recharge",
      amountPaise,
      balanceAfterPaise: newBalance,
      currency: "INR",
      description: `Wallet top-up via ${gateway === "razorpay" ? "Razorpay UPI" : "Stripe Card"}`,
      paymentGateway: gateway,
      gatewayPaymentId: `${gateway}_${Date.now().toString(36)}`,
      invoiceUrl: `/invoices/INV-${Date.now()}.pdf`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setRechargeModalOpen(false);
  };

  const deductCallUsage = (durationSec: number, assistant: Assistant, calleeNumber: string) => {
    const costPaise = Math.round((durationSec / 60) * 1000); // ₹10/min
    if (workspace.walletBalancePaise < costPaise) {
      return { success: false, reason: "insufficient_balance" };
    }

    const newBalance = workspace.walletBalancePaise - costPaise;
    setWorkspace((prev) => ({
      ...prev,
      walletBalancePaise: newBalance,
    }));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      workspaceId: workspace.id,
      type: "debit_call_usage",
      amountPaise: -costPaise,
      balanceAfterPaise: newBalance,
      currency: "INR",
      description: `Call with ${calleeNumber} (${durationSec}s @ ₹10.00/min)`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true };
  };

  const startWebCall = (assistant: Assistant, calleeNumber = "+91 98765 00000") => {
    // 1. Pre-call authorization check: Requires at least 1-minute rate (₹10 = 1000 paise)
    if (workspace.walletBalancePaise < 1000) {
      setRechargeModalOpen(true);
      return {
        success: false,
        error: "Insufficient wallet balance (minimum ₹10.00 required). Please recharge to test or place calls.",
      };
    }

    setActiveCall({
      inProgress: true,
      assistant,
      durationSec: 0,
      costPaise: 0,
      calleeNumber,
    });

    return { success: true };
  };

  const endWebCall = () => {
    if (!activeCall) return;

    const finishedDuration = activeCall.durationSec;
    const finishedCost = activeCall.costPaise;
    const asst = activeCall.assistant || assistants[0];

    // Log the completed call in Call Sessions
    if (finishedDuration > 0) {
      const newCall: CallSession = {
        id: `call-${Date.now()}`,
        workspaceId: workspace.id,
        assistantId: asst.id,
        assistantName: asst.name,
        direction: "webcall",
        calleeNumber: activeCall.calleeNumber || "+91 98765 00000",
        callerNumber: asst.assignedPhone || "+91 80 4736 8291",
        status: "completed",
        durationSeconds: finishedDuration,
        billedDurationSeconds: finishedDuration,
        costPaise: finishedCost,
        endReason: "user_hangup",
        sttLatencyMs: 98,
        ttftMs: 205,
        ttsLatencyMs: 135,
        sentiment: "positive",
        createdAt: new Date().toISOString(),
      };

      setCalls((prev) => [newCall, ...prev]);

      // Record final ledger transaction
      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        workspaceId: workspace.id,
        type: "debit_call_usage",
        amountPaise: -finishedCost,
        balanceAfterPaise: workspace.walletBalancePaise,
        currency: "INR",
        description: `WebCall test with ${asst.name} (${finishedDuration}s @ ₹10.00/min)`,
        callSessionId: newCall.id,
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);
    }

    setActiveCall(null);
  };

  const createAssistant = (data: Partial<Assistant>): Assistant => {
    const newAsst: Assistant = {
      id: `asst-${Date.now()}`,
      workspaceId: workspace.id,
      name: data.name || "New Voice Assistant",
      description: data.description || "Outbound conversational agent",
      direction: data.direction || "outbound",
      voiceProvider: data.voiceProvider || "cartesia",
      voiceId: data.voiceId || "sonic-en-in-female-1",
      voiceName: data.voiceName || "Cartesia Sonic (Indian Female)",
      language: data.language || "en-IN",
      secondaryLanguage: data.secondaryLanguage,
      firstMessage: data.firstMessage || `Hi, this is ${data.name || "Assistant"} calling from ${data.description || "our company"}. Am I speaking with {{Callee Name}}?`,
      interruptible: data.interruptible ?? true,
      prompt: data.prompt || DEFAULT_STUDIO_PROMPT.replace(/\{\{agent_name\}\}/g, data.name || "Assistant"),
      status: "active",
      assignedPhone: "+91 80 4736 8294",
      totalCallsCount: 0,
      averageHandleTimeSec: 0,
      version: "v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAssistants((prev) => [newAsst, ...prev]);
    return newAsst;
  };

  const updateAssistant = (id: string, updates: Partial<Assistant>) => {
    setAssistants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );
  };

  const deleteAssistant = (id: string) => {
    setAssistants((prev) => prev.filter((item) => item.id !== id));
  };

  const createCampaign = (data: Partial<Campaign>): Campaign => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      workspaceId: workspace.id,
      assistantId: data.assistantId || assistants[0].id,
      assistantName: data.assistantName || assistants[0].name,
      name: data.name || "Outbound Dialing Campaign",
      type: data.type || "outbound_call",
      status: "running",
      totalContacts: data.totalContacts || 500,
      connectedCalls: 0,
      connectivityRate: 0,
      concurrencyLimit: data.concurrencyLimit || 10,
      retryAttempts: data.retryAttempts || 2,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    return newCamp;
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isConnected: !item.isConnected,
              lastSyncedAt: !item.isConnected ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  };

  return (
    <StoreContext.Provider
      value={{
        workspace,
        assistants,
        calls,
        campaigns,
        transactions,
        phoneNumbers,
        numberPools,
        integrations,
        adminTenants,
        carrierTrunks,
        activeCall,
        rechargeModalOpen,
        setRechargeModalOpen,
        testCallDrawerOpen,
        setTestCallDrawerOpen,
        selectedAssistantForTest,
        setSelectedAssistantForTest,
        rechargeWallet,
        deductCallUsage,
        startWebCall,
        endWebCall,
        createAssistant,
        updateAssistant,
        deleteAssistant,
        createCampaign,
        toggleIntegration,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
