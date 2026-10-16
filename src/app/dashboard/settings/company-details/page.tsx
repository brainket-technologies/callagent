"use client";

import React, { useState } from "react";
import { Building, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompanyDetailsPage() {
  const [isBusiness, setIsBusiness] = useState(true);
  const [companyName, setCompanyName] = useState("Firoz Mohammad's Workspace");
  const [pan, setPan] = useState("ABCDE1234F");
  const [address, setAddress] = useState("MG Road, Indiranagar");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("560038");

  const [firstName, setFirstName] = useState("Firoz");
  const [lastName, setLastName] = useState("Mohammad");
  const [email, setEmail] = useState("firozm613@gmail.com");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Basic Info</p>

          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <p className="text-xs font-semibold text-neutral-800">Are you a business?</p>
              <p className="text-[11px] text-neutral-400">Adds GST and entity type details for business invoicing</p>
            </div>
            <input
              type="checkbox"
              checked={isBusiness}
              onChange={(e) => setIsBusiness(e.target.checked)}
              className="h-4 w-4 rounded text-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700">PAN Card Number</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs text-neutral-900 focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Billing Address</p>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Pincode *</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Point of Contact */}
        <div className="space-y-4 border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Point of Contact</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Changes saved
            </span>
          )}
          <Button onClick={handleSave} className="bg-neutral-900 text-white ml-auto">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
