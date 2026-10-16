"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PhoneCall,
  Save,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Layers,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";

interface TelephonyProvider {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  description: string;
  authType: string;
  docsUrl: string;
  isEnabled: boolean;
  userCount?: number;
}

export default function AdminNumbersSettingsPage() {
  const [providers, setProviders] = useState<TelephonyProvider[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("tata_tele");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addModalFileInputRef = useRef<HTMLInputElement>(null);

  // Add Provider Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCarrier, setNewCarrier] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    docsUrl: "",
    isEnabled: true,
  });

  // Current selected provider edit form state
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    logoUrl: string;
    docsUrl: string;
    isEnabled: boolean;
  }>({
    name: "",
    description: "",
    logoUrl: "",
    docsUrl: "",
    isEnabled: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload logo image file to server
  const handleFileUpload = async (file: File, target: "edit" | "new") => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (target === "edit") {
          setEditForm((prev) => ({ ...prev, logoUrl: data.url }));
        } else {
          setNewCarrier((prev) => ({ ...prev, logoUrl: data.url }));
        }
        showToast("Logo file uploaded successfully!");
      } else {
        throw new Error(data.error || "Failed to upload image file");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(err?.message || "Failed to upload logo file");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Fetch providers from PostgreSQL
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/telephony-providers");
      const data = await res.json();
      if (data.success && Array.isArray(data.providers)) {
        setProviders(data.providers);
        // If current selected slug doesn't exist in fetched list, pick the first
        if (data.providers.length > 0) {
          const exists = data.providers.find((p: TelephonyProvider) => p.slug === selectedSlug);
          if (!exists) {
            setSelectedSlug(data.providers[0].slug);
            setEditForm({
              name: data.providers[0].name,
              description: data.providers[0].description,
              logoUrl: data.providers[0].logoUrl || "",
              docsUrl: data.providers[0].docsUrl,
              isEnabled: data.providers[0].isEnabled,
            });
          } else {
            setEditForm({
              name: exists.name,
              description: exists.description,
              logoUrl: exists.logoUrl || "",
              docsUrl: exists.docsUrl,
              isEnabled: exists.isEnabled,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load providers:", err);
      showToast("Error loading telephony carriers from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // When selection changes, update edit form
  const handleSelectProvider = (p: TelephonyProvider) => {
    setSelectedSlug(p.slug);
    setEditForm({
      name: p.name,
      description: p.description,
      logoUrl: p.logoUrl || "",
      docsUrl: p.docsUrl,
      isEnabled: p.isEnabled,
    });
  };

  // Live toggle carrier enabled/disabled
  const handleToggle = async (slugToToggle: string, currentVal: boolean) => {
    const newVal = !currentVal;
    // Optimistic UI update
    setProviders((prev) =>
      prev.map((p) => (p.slug === slugToToggle ? { ...p, isEnabled: newVal } : p))
    );
    if (selectedSlug === slugToToggle) {
      setEditForm((prev) => ({ ...prev, isEnabled: newVal }));
    }

    try {
      const res = await fetch("/api/admin/telephony-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          slug: slugToToggle,
          isEnabled: newVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Carrier ${newVal ? "enabled" : "disabled"} successfully!`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Toggle error:", err);
      showToast(err?.message || "Failed to toggle carrier status");
      // Revert on error
      setProviders((prev) =>
        prev.map((p) => (p.slug === slugToToggle ? { ...p, isEnabled: currentVal } : p))
      );
      if (selectedSlug === slugToToggle) {
        setEditForm((prev) => ({ ...prev, isEnabled: currentVal }));
      }
    }
  };

  // Save changes to current carrier
  const handleSaveCarrier = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/telephony-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          slug: selectedSlug,
          name: editForm.name,
          description: editForm.description,
          logoUrl: editForm.logoUrl,
          docsUrl: editForm.docsUrl,
          isEnabled: editForm.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Carrier '${editForm.name}' updated successfully in database!`);
        await fetchProviders();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Update carrier error:", err);
      showToast(err?.message || "Failed to update carrier");
    } finally {
      setSaving(false);
    }
  };

  // Add new carrier
  const handleCreateCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrier.name.trim()) {
      showToast("Please enter a carrier name");
      return;
    }

    try {
      const res = await fetch("/api/admin/telephony-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: newCarrier.name,
          slug: newCarrier.slug,
          logoUrl: newCarrier.logoUrl,
          description: newCarrier.description,
          docsUrl: newCarrier.docsUrl,
          isEnabled: newCarrier.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Carrier added successfully!");
        setShowAddModal(false);
        setNewCarrier({
          name: "",
          slug: "",
          logoUrl: "",
          description: "",
          docsUrl: "",
          isEnabled: true,
        });
        await fetchProviders();
        if (data.provider?.slug) {
          setSelectedSlug(data.provider.slug);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Create carrier error:", err);
      showToast(err?.message || "Failed to add carrier");
    }
  };

  // Delete carrier
  const handleDeleteCarrier = async (slugToDelete: string) => {
    if (!confirm(`Are you sure you want to remove carrier '${slugToDelete}' from the platform?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/telephony-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          slug: slugToDelete,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Carrier removed successfully!");
        await fetchProviders();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Delete carrier error:", err);
      showToast(err?.message || "Failed to remove carrier");
    }
  };

  const selectedCarrier = providers.find((p) => p.slug === selectedSlug);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="h-4 w-4 text-[#11E97F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <PhoneCall className="h-5 w-5 text-emerald-600" />
            <span>Telephony Providers & Carrier Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure supported telephony carriers on the platform. Admins add carriers and upload logos; end-users enter their own API credentials in the client portal to use their trunks.
          </p>
        </div>

        {/* Action Button: Add Carrier Provider */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4 text-[#11E97F]" />
          <span>Add Carrier Provider</span>
        </button>
      </div>

      {/* Main Carrier Management Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading telephony providers from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Left Column: Carriers List */}
            <div className="md:col-span-4 border-r border-slate-100 p-4 space-y-2 bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Supported Carriers</span>
                  <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {providers.filter((p) => p.isEnabled).length} / {providers.length} Active
                  </span>
                </div>

                <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                  {providers.map((p) => {
                    const isSelected = selectedSlug === p.slug;

                    return (
                      <div
                        key={p.slug}
                        onClick={() => handleSelectProvider(p)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Logo or Initial Avatar */}
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs bg-white border border-slate-200/80 overflow-hidden shrink-0 shadow-2xs ${
                              isSelected ? "ring-2 ring-slate-900/10" : ""
                            }`}
                          >
                            {p.logoUrl ? (
                              <img
                                src={p.logoUrl}
                                alt={p.name}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <span className={isSelected ? "text-slate-900 font-bold" : "text-slate-600"}>
                                {p.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="leading-tight">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal font-mono">
                              {p.slug}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Status Dot */}
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              p.isEnabled ? "bg-[#11E97F]" : "bg-slate-300"
                            }`}
                            title={p.isEnabled ? "Active & Enabled" : "Disabled"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Carrier Quick Link */}
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900 text-xs font-bold transition cursor-pointer bg-white"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" />
                <span>Add New Carrier</span>
              </button>
            </div>

            {/* Right Column: Carrier Configuration & Controls */}
            <div className="md:col-span-8 p-6 md:p-8 space-y-6 flex flex-col justify-between">
              {selectedCarrier ? (
                <div className="space-y-6">
                  {/* Carrier Controls Top Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Carrier Settings
                    </span>

                    {/* LIVE ON / OFF TOGGLE SWITCH */}
                    <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                      <span className="text-xs font-semibold text-slate-700">
                        {editForm.isEnabled ? "Enabled for Users" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={editForm.isEnabled}
                        onClick={() => handleToggle(selectedCarrier.slug, editForm.isEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          editForm.isEnabled ? "bg-[#11E97F]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            editForm.isEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Carrier Editable Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Provider Display Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                      />
                    </div>

                    {/* Carrier Logo: File Upload & URL Option */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span>Carrier Logo (Upload File or Enter URL)</span>
                        </label>
                        {editForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, logoUrl: "" })}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition cursor-pointer"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Thumbnail Preview */}
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {editForm.logoUrl ? (
                                <img
                                  src={editForm.logoUrl}
                                  alt="Logo Preview"
                                  className="h-full w-full object-contain p-1.5"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {editForm.logoUrl ? "Carrier Logo Attached" : "No Logo File Attached"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Supports PNG, SVG, WEBP, ICO, or JPG (max 5MB)
                              </p>
                            </div>
                          </div>

                          {/* Upload Button */}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "edit");
                              }}
                            />
                            <button
                              type="button"
                              disabled={uploadingLogo}
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {uploadingLogo ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                              ) : (
                                <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                              <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Image URL fallback */}
                        <div className="pt-2.5 border-t border-slate-200/80 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Or Image URL:</span>
                          <input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            value={editForm.logoUrl}
                            onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                            className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-normal text-slate-900 focus:outline-none focus:border-slate-900 transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Description & Scope
                      </label>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="e.g. Enterprise SIP trunking and cloud telephony..."
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Documentation / Portal Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={editForm.docsUrl}
                          onChange={(e) => setEditForm({ ...editForm, docsUrl: e.target.value })}
                          placeholder="https://..."
                          className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                        />
                        {editForm.docsUrl && (
                          <a
                            href={editForm.docsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                            title="Open Docs"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <Layers className="h-10 w-10 stroke-1 mb-2" />
                  <p className="text-xs">Select a carrier from the left to configure.</p>
                </div>
              )}

              {/* Bottom Actions */}
              {selectedCarrier && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteCarrier(selectedCarrier.slug)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition cursor-pointer px-3 py-2 rounded-xl hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Carrier</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveCarrier}
                    className="px-8 h-10 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>{saving ? "Saving..." : "Save Carrier Details"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =======================================================================
          MODAL: ADD NEW TELEPHONY PROVIDER
          ======================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Add Telephony Provider</h2>
                  <p className="text-xs text-slate-500">Enable a new carrier network for users</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCarrier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Twilio, Ringg, Airtel IQ"
                  value={newCarrier.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                    setNewCarrier({
                      ...newCarrier,
                      name,
                      slug: newCarrier.slug ? newCarrier.slug : autoSlug,
                    });
                  }}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slug / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. twilio"
                  value={newCarrier.slug}
                  onChange={(e) => setNewCarrier({ ...newCarrier, slug: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Logo Upload & URL in Modal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Carrier Logo</span>
                </label>
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {newCarrier.logoUrl ? (
                          <img
                            src={newCarrier.logoUrl}
                            alt="Preview"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {newCarrier.logoUrl ? "Logo file attached" : "Upload logo or enter URL"}
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={addModalFileInputRef}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "new");
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => addModalFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Upload Logo</span>
                    </button>
                  </div>

                  <input
                    type="url"
                    placeholder="Or paste https://example.com/logo.png"
                    value={newCarrier.logoUrl}
                    onChange={(e) => setNewCarrier({ ...newCarrier, logoUrl: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Programmable voice APIs and SIP trunks..."
                  value={newCarrier.description}
                  onChange={(e) => setNewCarrier({ ...newCarrier, description: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Developer Docs URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCarrier.docsUrl}
                  onChange={(e) => setNewCarrier({ ...newCarrier, docsUrl: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="text-xs font-bold text-slate-900">Enable Carrier Immediately</p>
                  <p className="text-[11px] text-slate-500">Allow users to select this provider right away</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCarrier({ ...newCarrier, isEnabled: !newCarrier.isEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    newCarrier.isEnabled ? "bg-[#11E97F]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ${
                      newCarrier.isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Create Carrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
