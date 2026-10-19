"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  RotateCw,
  Plus,
  Copy,
  CheckCircle2,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BRAND_CONFIG } from "@/lib/brand-config";

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [maskedKey, setMaskedKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch active API key on mount
  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workspace/api-key");
      const data = await res.json();
      if (data.success && data.hasKey && data.apiKey) {
        setApiKey(data.apiKey);
        setMaskedKey(data.maskedKey || computeMaskedKey(data.apiKey));
      } else {
        setApiKey("");
        setMaskedKey("");
      }
    } catch (err) {
      console.error("Failed to fetch API key:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeMaskedKey = (key: string) => {
    if (!key) return "";
    const prefixMatch = key.match(/^([a-z]+_[a-z]+_)/i);
    const prefix = prefixMatch ? prefixMatch[1] : "sk_live_";
    const last4 = key.slice(-4);
    return `${prefix}••••••••••••••••••••••••••••••••${last4}`;
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // First time generation (direct, no break warning needed)
  const handleGenerateFirstTime = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/workspace/api-key", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.apiKey) {
        setApiKey(data.apiKey);
        setMaskedKey(data.maskedKey || computeMaskedKey(data.apiKey));
        setNotification("Secret API key generated successfully! Save it securely.");
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.error || "Failed to generate API key");
      }
    } catch (err) {
      console.error("Error generating API key:", err);
      alert("Failed to generate API key. Please check your network connection.");
    } finally {
      setActionLoading(false);
    }
  };

  // Subsequent regeneration (requires confirmation)
  const handleRegenerate = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/workspace/api-key", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.apiKey) {
        setApiKey(data.apiKey);
        setMaskedKey(data.maskedKey || computeMaskedKey(data.apiKey));
        setShowConfirmModal(false);
        setNotification("Secret API key has been regenerated successfully. Make sure to update your integrations.");
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.error || "Failed to regenerate API key");
      }
    } catch (err) {
      console.error("Error regenerating API key:", err);
      alert("Failed to regenerate API key. Please check your network connection.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">API Key</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Use this key to authenticate API requests for your workspace. For security, never expose your secret key in client-side applications.
          </p>
        </div>

        <div>
          {apiKey ? (
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || actionLoading}
              className="text-xs h-9 font-semibold"
            >
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              Regenerate API Key
            </Button>
          ) : (
            <Button
              onClick={handleGenerateFirstTime}
              disabled={loading || actionLoading}
              className="text-xs h-9 font-semibold"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3]" />
                  Generate API Key
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {notification && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-medium">{notification}</p>
        </div>
      )}

      {/* Active Secret Key Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-700">Active Secret API Key</label>
          {apiKey && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active in Production
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
            Loading active key...
          </div>
        ) : apiKey ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={showKey ? apiKey : maskedKey}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 font-mono text-xs text-neutral-900 tracking-wide select-all focus:outline-none focus:border-[#11E97F] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? "Hide secret key" : "Show secret key"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition cursor-pointer"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="text-xs h-10 px-3.5 flex items-center gap-1.5 border-neutral-200 hover:bg-neutral-50 font-medium"
              title="Copy secret key"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-neutral-600" />
                  <span className="text-neutral-700 text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">No API Key Generated Yet</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 max-w-sm">
                Generate your workspace secret key to authenticate REST API calls and webhooks securely.
              </p>
            </div>
            <Button
              onClick={handleGenerateFirstTime}
              disabled={actionLoading}
              className="text-xs h-8 px-4 font-semibold"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3]" />
                  Generate API Key
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-[11px] text-neutral-400">
          Never share this secret key in client-side code or public GitHub repositories.
        </p>
      </div>

      {/* Quick Start Guide Card */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-neutral-900">Need an overview?</h4>
        <p className="text-xs text-neutral-500">Visit our official documentation to get started.</p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 text-emerald-700 p-2 border border-emerald-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">API: Quick start guide</p>
              <p className="text-[11px] text-neutral-500">
                Make a test {BRAND_CONFIG.name} call to understand the production flow.
              </p>
            </div>
          </div>
          <a
            href="#docs"
            onClick={(e) => {
              e.preventDefault();
              alert("Navigating to API Quick start documentation.");
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>Docs</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Confirmation Modal for Key Regeneration */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !actionLoading && setShowConfirmModal(false)}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Regenerate Secret API Key?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 space-y-1.5 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              Existing integrations will break
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your current active key ({maskedKey || "..."}) will be immediately revoked. Any external apps, background workers, or backend webhooks using this key will immediately fail authentication until you update them with the new key.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              disabled={actionLoading}
              onClick={() => setShowConfirmModal(false)}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={actionLoading}
              onClick={handleRegenerate}
              className="text-xs h-9 px-4 font-semibold shadow-sm flex items-center gap-1.5"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  Yes, Regenerate Key
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
