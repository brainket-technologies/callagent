"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  X,
  Loader2,
  Filter,
} from "lucide-react";

export const INDUSTRY_CATEGORIES = [
  "All",
  "Logistics",
  "Healthcare",
  "Financial",
  "Education",
  "HR & Recruitment",
  "eCommerce",
] as const;

interface ToneItem {
  id: string;
  key: string;
  name: string;
  industry: string;
  description: string;
  promptInstruction: string;
  sampleText?: string;
  sampleTextEn?: string;
  icon: string;
  audioRate: string;
  audioPitch: string;
  isDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export default function AdminTonesSettingsPage() {
  const [tones, setTones] = useState<ToneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    key: "",
    name: "",
    industry: "Logistics",
    description: "",
    promptInstruction: "",
    sampleText: "",
    sampleTextEn: "",
    icon: "📦",
    audioRate: "1.00",
    audioPitch: "1.00",
    isDefault: false,
    isEnabled: true,
    sortOrder: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tones");
      const data = await res.json();
      if (data.success && Array.isArray(data.tones)) {
        setTones(data.tones);
      } else {
        throw new Error(data.error || "Failed to load tones");
      }
    } catch (err: any) {
      console.error("Error loading tones:", err);
      showToast(err?.message || "Failed to load tones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTones();
  }, []);

  // Toggle Status
  const handleToggleTone = async (tone: ToneItem) => {
    try {
      const res = await fetch("/api/admin/tones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          key: tone.key,
          isEnabled: !tone.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTones((prev) =>
          prev.map((t) => (t.key === tone.key ? { ...t, isEnabled: data.isEnabled } : t))
        );
        showToast(data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update tone status");
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      key: "",
      name: "",
      industry: selectedIndustry !== "All" ? selectedIndustry : "Logistics",
      description: "",
      promptInstruction: "",
      sampleText: "",
      sampleTextEn: "",
      icon: "📦",
      audioRate: "1.00",
      audioPitch: "1.00",
      isDefault: false,
      isEnabled: true,
      sortOrder: tones.length + 1,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tone: ToneItem) => {
    setIsEditing(true);
    setFormData({
      id: tone.id,
      key: tone.key,
      name: tone.name,
      industry: tone.industry || "Logistics",
      description: tone.description,
      promptInstruction: tone.promptInstruction,
      sampleText: tone.sampleText || "",
      sampleTextEn: tone.sampleTextEn || "",
      icon: tone.icon,
      audioRate: tone.audioRate || "1.00",
      audioPitch: tone.audioPitch || "1.00",
      isDefault: tone.isDefault,
      isEnabled: tone.isEnabled,
      sortOrder: tone.sortOrder,
    });
    setShowModal(true);
  };

  // Save Tone
  const handleSaveTone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Tone name is required");
      return;
    }

    try {
      setIsSaving(true);
      const action = isEditing ? "update" : "add";
      const res = await fetch("/api/admin/tones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEditing ? "Tone updated!" : "Tone added!"));
        setShowModal(false);
        loadTones();
      } else {
        throw new Error(data.error || "Failed to save tone");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save tone");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Tone
  const handleDeleteTone = async (tone: ToneItem) => {
    if (!confirm(`Are you sure you want to remove tone "${tone.name}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/tones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          key: tone.key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTones((prev) => prev.filter((t) => t.key !== tone.key));
        showToast(data.message || "Tone deleted successfully");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete tone");
    }
  };

  const filteredTones = tones.filter((t) => {
    const matchesIndustry =
      selectedIndustry === "All" || (t.industry || "").toLowerCase() === selectedIndustry.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.industry || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const totalCount = tones.length;
  const activeCount = tones.filter((t) => t.isEnabled).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Industry Conversational Tones</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tones calibrated across the 6 Industry Templates (Logistics, Healthcare, Financial, Education, HR & Recruitment, eCommerce).
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Industry Tone</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tones</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount} Tones</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">{activeCount} active for agent studio</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categorization</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">6 Industries</p>
          <p className="text-[11px] text-slate-400 mt-1">Mapped to business blueprints</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Voice Resolution</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Dynamic Pitch & Rate</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Calibrated audio rate & pitch synthesis</p>
        </div>
      </div>

      {/* Industry Filter Pills & Search Bar */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" />
            Industry:
          </span>
          {INDUSTRY_CATEGORIES.map((cat) => {
            const isSelected = selectedIndustry === cat;
            const count =
              cat === "All"
                ? tones.length
                : tones.filter((t) => (t.industry || "").toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedIndustry(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tone by name, industry, key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tones Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading industry conversational tones...</p>
        </div>
      ) : filteredTones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 text-center px-4">
          <Sparkles className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No tones found</p>
          <p className="text-xs text-slate-400 mt-1">Try another search or select "All" industries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTones.map((tone) => (
            <div
              key={tone.key}
              className={`group flex flex-col justify-between p-5 rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                tone.isEnabled ? "border-slate-200/90" : "border-slate-200/50 bg-slate-50/60 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl select-none">{tone.icon || "💼"}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{tone.name}</h3>
                        {tone.isDefault && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200/60">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
                          {tone.industry}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                          {tone.audioRate}x speed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(tone)}
                      title="Edit tone"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTone(tone)}
                      title="Delete tone"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {tone.description && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {tone.description}
                  </p>
                )}

                {tone.promptInstruction && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Prompt Directive
                    </p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                      "{tone.promptInstruction}"
                    </p>
                  </div>
                )}

                {tone.sampleText && (
                  <div className="mt-2.5 rounded-xl bg-emerald-50/60 p-2.5 border border-emerald-100/80">
                    <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mb-0.5">
                      Sample Dialogue (DB)
                    </p>
                    <p className="text-[11px] text-slate-700 line-clamp-2">
                      "{tone.sampleText}"
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {tone.isEnabled ? "Active in Studio" : "Disabled"}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleTone(tone)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    tone.isEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      tone.isEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Tone Persona" : "Add Industry Tone"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTone} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compassionate Patient Care"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Logistics">Logistics</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Financial">Financial</option>
                    <option value="Education">Education</option>
                    <option value="HR & Recruitment">HR & Recruitment</option>
                    <option value="eCommerce">eCommerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Key Identifier *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. healthcare-clinic"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Emoji Icon</label>
                  <input
                    type="text"
                    placeholder="📦"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Audio Rate (Speed)</label>
                  <input
                    type="text"
                    placeholder="1.00"
                    value={formData.audioRate}
                    onChange={(e) => setFormData({ ...formData, audioRate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 text-center font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Audio Pitch</label>
                  <input
                    type="text"
                    placeholder="1.00"
                    value={formData.audioPitch}
                    onChange={(e) => setFormData({ ...formData, audioPitch: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 text-center font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fast, clear delivery coordination and driver verification."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Prompt Directive</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Speak with crisp, swift efficiency. Confirm customer addresses and delivery slots."
                  value={formData.promptInstruction}
                  onChange={(e) => setFormData({ ...formData, promptInstruction: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Injected into the system prompt when selected by an agent.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Sample Dialogue / Script (Hindi / Native Script)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. नमस्ते! मैं ${name} बोल रहा हूँ, लॉजिस्टिक्स डिस्पैच से। आपके पार्सल का लाइव डिस्पैच..."
                  value={formData.sampleText}
                  onChange={(e) => setFormData({ ...formData, sampleText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Used during voice previews in Voice Library. Use ${'{name}'} for dynamic replacement.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Sample Dialogue / Script (English)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hello! This is ${name} from Logistics Dispatch. I'm calling with a live update..."
                  value={formData.sampleTextEn}
                  onChange={(e) => setFormData({ ...formData, sampleTextEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultTone"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isDefaultTone" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Set as default persona
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEnabledTone"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isEnabledTone" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Enable this tone for assistant builder
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving..." : isEditing ? "Update Tone" : "Add Tone"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
