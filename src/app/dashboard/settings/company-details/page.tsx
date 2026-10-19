"use client";

import React, { useState, useEffect } from "react";
import { Building, CheckCircle2, ChevronDown, Loader2, ShieldCheck, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";

export default function CompanyDetailsPage() {
  const { workspace } = useStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Business & KYC fields (stored in workspace_company_details table)
  const [isBusiness, setIsBusiness] = useState(false);
  const [gstin, setGstin] = useState("");
  const [entityType, setEntityType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");

  // Point of Contact fields (sourced from logged-in user's profile)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCompanyDetails() {
      try {
        setLoading(true);
        const res = await fetch("/api/workspace/company-details");
        const data = await res.json();

        if (mounted && data.success && data.details) {
          const d = data.details;
          setIsBusiness(Boolean(d.isBusiness));
          setGstin(d.gstin || "");
          setEntityType(d.entityType || "");
          setCompanyName(d.companyName || "");
          setPan(d.pan || "");
          setAddress(d.address || "");
          setCity(d.city || "");
          setState(d.state || "");
          setCountry(d.country || "");
          setPincode(d.pincode || "");
          setName(d.name || [d.firstName, d.lastName].filter(Boolean).join(" ") || "");
          setEmail(d.email || "");
        }
      } catch (err) {
        console.error("Error loading company KYC details:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCompanyDetails();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/workspace/company-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          isBusiness,
          gstin,
          entityType,
          companyName,
          pan,
          address,
          city,
          state,
          country,
          pincode,
          name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(data.error || "Failed to save company details");
      }
    } catch (err) {
      console.error("Failed to save company details:", err);
      alert("Network error while saving details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#11E97F]" />
          <span>Loading KYC & Company details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">KYC</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Your registered company details, used for billing and invoices
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Basic Info
          </p>

          <div className="flex items-start gap-3 border-b border-neutral-100 pb-3">
            <input
              type="checkbox"
              id="isBusinessCheckbox"
              checked={isBusiness}
              onChange={(e) => setIsBusiness(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-[#11E97F] text-[#11E97F] focus:ring-[#11E97F] cursor-pointer"
            />
            <label htmlFor="isBusinessCheckbox" className="cursor-pointer select-none">
              <p className="text-xs font-bold text-neutral-900">Are you a business?</p>
              <p className="text-[11px] text-neutral-400">
                Adds GST and entity type details for business invoicing
              </p>
            </label>
          </div>

          {/* Conditional Business Invoicing Fields: GSTIN & Entity Type */}
          {isBusiness && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
              <div>
                <label className="text-xs font-semibold text-neutral-700">
                  GST Identification Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setGstin(val);
                    if (val.length >= 12 && (!pan || pan.length < 10)) {
                      setPan(val.substring(2, 12));
                    }
                  }}
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F] uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Entity Type</label>
                <div className="relative mt-1">
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2 pr-9 text-xs text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F] cursor-pointer"
                  >
                    <option value="">Select entity type</option>
                    <option value="pvt_ltd">Private Limited Company</option>
                    <option value="public_ltd">Public Limited Company</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership Firm</option>
                    <option value="opc">One Person Company (OPC)</option>
                    <option value="trust">Trust / Society</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation Pvt Ltd"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">PAN Card Number</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F] uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Billing Address
          </p>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Building, street, landmark..."
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country name"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560038"
                maxLength={10}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>
          </div>
        </div>

        {/* Point of Contact (Logged-In User's Details) */}
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Point of Contact
            </p>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-medium">
              <ShieldCheck className="h-3 w-3" /> Logged-In User Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                title="Primary account email is verified and linked to your login session"
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-600 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Changes saved to workspace & database!
            </span>
          ) : (
            <div />
          )}

          <Button onClick={handleSave} disabled={saving} className="ml-auto min-w-[100px]">
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
