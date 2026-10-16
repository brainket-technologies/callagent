"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ShieldCheck, Zap, CreditCard, QrCode, CheckCircle2 } from "lucide-react";

export function RechargeModal() {
  const { workspace, rechargeModalOpen, setRechargeModalOpen, rechargeWallet } = useStore();

  const presets = [
    { label: "₹500", paise: 50000, callsEst: "~50 mins" },
    { label: "₹1,000", paise: 100000, popular: true, callsEst: "~100 mins" },
    { label: "₹2,500", paise: 250000, callsEst: "~250 mins" },
    { label: "₹5,000", paise: 500000, callsEst: "~500 mins" },
    { label: "₹10,000", paise: 1000000, callsEst: "~1,000 mins" },
  ];

  const [selectedPaise, setSelectedPaise] = useState<number>(100000);
  const [gateway, setGateway] = useState<"razorpay" | "stripe">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const subtotal = selectedPaise / 100;
  const gst = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + gst;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      rechargeWallet(selectedPaise, gateway);
      setIsProcessing(false);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setRechargeModalOpen(false);
      }, 1500);
    }, 1200);
  };

  return (
    <Modal
      isOpen={rechargeModalOpen}
      onClose={() => setRechargeModalOpen(false)}
      title="Recharge Wallet & Telephony Credits"
      description="Prepaid balance is metered per-second based on active call duration (₹10.00 / minute)."
      maxWidth="lg"
    >
      {successNotice ? (
        <div className="py-8 text-center animate-in zoom-in-95">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h4 className="text-xl font-bold text-neutral-900">Recharge Successful!</h4>
          <p className="mt-2 text-sm text-neutral-600">
            {formatCurrency(selectedPaise)} has been credited to your workspace wallet.
          </p>
          <p className="text-xs text-neutral-400 mt-1">Invoice INV-{Date.now().toString().slice(-6)} has been generated.</p>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Current Balance Card */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 border border-neutral-200/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Current Balance</p>
                <p className="text-xl font-bold text-neutral-900">
                  {formatCurrency(workspace.walletBalancePaise)}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <Zap className="h-3.5 w-3.5" /> Rate: ₹10/min
              </span>
              <p>Per-second metered</p>
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Select Recharge Amount
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
              {presets.map((preset) => (
                <button
                  key={preset.paise}
                  type="button"
                  onClick={() => setSelectedPaise(preset.paise)}
                  className={`relative flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all cursor-pointer ${
                    selectedPaise === preset.paise
                      ? "border-[#11E97F] bg-emerald-50/80 text-emerald-950 font-bold shadow-xs ring-2 ring-[#11E97F]"
                      : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {preset.popular && (
                    <span className="absolute -top-2 rounded-full bg-[#11E97F] px-2 py-0.5 text-[9px] font-black text-[#0A0E1A] uppercase tracking-tight shadow-xs">
                      Popular
                    </span>
                  )}
                  <span className="text-sm font-bold">{preset.label}</span>
                  <span
                    className={`mt-1 text-[11px] ${
                      selectedPaise === preset.paise ? "text-emerald-800 font-semibold" : "text-neutral-500"
                    }`}
                  >
                    {preset.callsEst}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gateway Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Payment Method
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway("razorpay")}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  gateway === "razorpay"
                    ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 text-neutral-900"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="mt-0.5 rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">UPI & NetBanking (India)</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Google Pay, PhonePe, Paytm, Cards</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGateway("stripe")}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  gateway === "stripe"
                    ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900 text-neutral-900"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700"
                }`}
              >
                <div className="mt-0.5 rounded-lg bg-neutral-200 p-2 text-neutral-800">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">International Cards</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Visa, Mastercard, Amex via Stripe</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tax Invoice Summary */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 text-xs text-neutral-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Calling Credits (Pre-tax)</span>
              <span className="font-medium text-neutral-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18% - B2B Input Tax Credit Eligible)</span>
              <span className="font-medium text-neutral-800">₹{gst.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-1.5 flex justify-between font-bold text-sm text-neutral-900">
              <span>Total Payable</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>256-bit Encrypted Checkout</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRechargeModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handlePay}
                disabled={isProcessing}
                className="px-6 font-bold"
              >
                {isProcessing ? "Processing Payment..." : `Pay ₹${grandTotal.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
