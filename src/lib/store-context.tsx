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
  updateWorkspace: (updates: Partial<Workspace>) => void;
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

  // Hydrate user's active workspace from PostgreSQL database session
  useEffect(() => {
    async function hydrateSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.success && data.authenticated && data.workspace) {
          const rawBal = data.workspace.walletBalance ?? (data.workspace.walletBalancePaise ? data.workspace.walletBalancePaise / 100 : 200);
          const numBal = Number(rawBal);
          setWorkspace((prev) => ({
            ...prev,
            id: data.workspace.id,
            name: data.workspace.name,
            walletBalance: numBal,
            walletBalancePaise: Math.round(numBal * 100),
            currency: data.workspace.currency ?? prev.currency,
          }));

          // Hydrate transactions from DB
          const txRes = await fetch("/api/transactions").catch(() => null);
          if (txRes) {
            const txData = await txRes.json().catch(() => null);
            if (txData?.success && Array.isArray(txData.transactions) && txData.transactions.length > 0) {
              setTransactions(
                txData.transactions.map((t: any) => ({
                  id: t.txnNumber || t.id,
                  workspaceId: t.workspaceId,
                  type: t.type,
                  amountPaise: t.amountPaise ?? Math.round(Number(t.amount || 0) * 100),
                  balanceAfterPaise: t.balanceAfterPaise ?? Math.round(Number(t.balanceAfter || 0) * 100),
                  currency: t.currency || "INR",
                  description: t.serviceName,
                  createdAt: t.createdAt,
                }))
              );
            }
          }
        }
      } catch (err) {
        // Fallback to local
      }
    }
    hydrateSession();
  }, []);

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

  const sendWorkspaceLog = (logData: {
    operation: string;
    resource: string;
    resourceId?: string;
    resourceType?: string;
    details?: any;
  }) => {
    try {
      fetch("/api/workspace/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      }).catch(() => {});
    } catch {}
  };

  const rechargeWallet = (amountPaise: number, gateway: "razorpay" | "stripe") => {
    const newBalance = workspace.walletBalancePaise + amountPaise;
    const finalAmount = (amountPaise / 100).toFixed(2);
    const finalBalance = (newBalance / 100).toFixed(2);
    const txnNum = "TXN-" + Math.floor(100000 + Math.random() * 900000);

    setWorkspace((prev) => ({
      ...prev,
      walletBalance: Number(finalBalance),
      walletBalancePaise: newBalance,
    }));

    const newTx: WalletTransaction = {
      id: txnNum,
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

    // Persist to PostgreSQL database
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspace.id,
        type: "credit_recharge",
        serviceName: `Wallet top-up via ${gateway === "razorpay" ? "Razorpay UPI" : "Stripe Card"}`,
        amount: finalAmount,
        balanceAfter: finalBalance,
        billingUnit: "Wallet Recharge",
        currency: workspace.currency || "INR",
        gateway: gateway === "razorpay" ? "Razorpay UPI" : "Stripe",
        status: "success",
      }),
    }).catch(() => {});

    sendWorkspaceLog({
      operation: "Recharged wallet",
      resource: `Wallet +₹${finalAmount}`,
      resourceType: "wallet",
    });
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

    sendWorkspaceLog({
      operation: "Created agent",
      resource: newAsst.name,
      resourceId: newAsst.id,
      resourceType: "agent",
    });

    return newAsst;
  };

  const updateAssistant = (id: string, updates: Partial<Assistant>) => {
    const target = assistants.find((item) => item.id === id);
    const agentName = updates.name || target?.name || "Agent";

    setAssistants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );

    sendWorkspaceLog({
      operation: "Edited agent",
      resource: agentName,
      resourceId: id,
      resourceType: "agent",
    });
  };

  const deleteAssistant = (id: string) => {
    const target = assistants.find((item) => item.id === id);
    setAssistants((prev) => prev.filter((item) => item.id !== id));

    sendWorkspaceLog({
      operation: "Deleted agent",
      resource: target?.name || "Agent",
      resourceId: id,
      resourceType: "agent",
    });
  };

  const createCampaign = (data: Partial<Campaign>): Campaign => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      workspaceId: workspace.id,
      assistantId: data.assistantId || assistants[0]?.id || "",
      assistantName: data.assistantName || assistants[0]?.name || "Assistant",
      name: data.name || "Outbound Dialing Campaign",
      type: data.type || "outbound_call",
      status: data.status || "running",
      totalContacts: data.totalContacts || 500,
      connectedCalls: 0,
      connectivityRate: 0,
      concurrencyLimit: data.concurrencyLimit || 10,
      retryAttempts: data.retryAttempts || 2,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);

    sendWorkspaceLog({
      operation: "Created campaign",
      resource: newCamp.name,
      resourceId: newCamp.id,
      resourceType: "campaign",
    });

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

  const updateWorkspace = (updates: Partial<Workspace>) => {
    setWorkspace((prev) => ({ ...prev, ...updates }));
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
        updateWorkspace,
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
