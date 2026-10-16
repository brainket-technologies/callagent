"use client";

import React, { useState, useEffect } from "react";
import {
  Languages,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  X,
  Globe,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";

interface LanguageItem {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  isPrimary: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export default function AdminLanguagesSettingsPage() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "primary">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    code: "",
    name: "",
    nativeName: "",
    flagEmoji: "🇮🇳",
    isPrimary: false,
    isEnabled: true,
    sortOrder: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/languages");
      const data = await res.json();
      if (data.success && Array.isArray(data.languages)) {
        setLanguages(data.languages);
      } else {
        throw new Error(data.error || "Failed to load languages");
      }
    } catch (err: any) {
      console.error("Error loading languages:", err);
      showToast(err?.message || "Failed to load languages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  // Toggle Language Status
  const handleToggleLanguage = async (lang: LanguageItem) => {
    try {
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          code: lang.code,
          isEnabled: !lang.isEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLanguages((prev) =>
          prev.map((l) => (l.code === lang.code ? { ...l, isEnabled: data.isEnabled } : l))
        );
        showToast(data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update language status");
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      code: "",
      name: "",
      nativeName: "",
      flagEmoji: "🇮🇳",
      isPrimary: false,
      isEnabled: true,
      sortOrder: languages.length + 1,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lang: LanguageItem) => {
    setIsEditing(true);
    setFormData({
      id: lang.id,
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flagEmoji: lang.flagEmoji,
      isPrimary: lang.isPrimary,
      isEnabled: lang.isEnabled,
      sortOrder: lang.sortOrder,
    });
    setShowModal(true);
  };

  // Save Language (Add or Update)
  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast("Language name and locale code are required");
      return;
    }

    try {
      setIsSaving(true);
      const action = isEditing ? "update" : "add";
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || (isEditing ? "Language updated!" : "Language added!"));
        setShowModal(false);
        loadLanguages();
      } else {
        throw new Error(data.error || "Failed to save language");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save language");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Language
  const handleDeleteLanguage = async (lang: LanguageItem) => {
    if (!confirm(`Are you sure you want to remove language "${lang.name}" (${lang.code})?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          code: lang.code,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLanguages((prev) => prev.filter((l) => l.code !== lang.code));
        showToast(data.message || "Language deleted successfully");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete language");
    }
  };

  // Filter Languages
  const filteredLanguages = languages.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "active") return matchesSearch && l.isEnabled;
    if (filterType === "primary") return matchesSearch && l.isPrimary;
    return matchesSearch;
  });

  const totalCount = languages.length;
  const activeCount = languages.filter((l) => l.isEnabled).length;
  const primaryCount = languages.filter((l) => l.isPrimary).length;

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
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Supported Languages & Locales</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add and manage conversational languages (Hindi, English, Marathi, Gujarati, etc.) available for voice agents.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Language</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Configured</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount} Languages</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">{activeCount} active for agent builder</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Default Primary</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{primaryCount} Locales</p>
          <p className="text-[11px] text-slate-400 mt-1">Hindi (hi-IN) & English (en-IN)</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Regional Vernaculars</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">10+ Indic Scripts</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Marathi, Gujarati, Bengali, Tamil, etc.</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterType("active")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "active"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterType("primary")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "primary"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Primary Default ({primaryCount})
          </button>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search language, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Languages Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Loading language catalogue...</p>
        </div>
      ) : filteredLanguages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 text-center px-4">
          <Languages className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No languages found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search query or add a new language.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Language</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.code}
              className={`group flex flex-col justify-between p-5 rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                lang.isEnabled ? "border-slate-200/90" : "border-slate-200/50 bg-slate-50/60 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none" role="img" aria-label={lang.name}>
                    {lang.flagEmoji || "🌐"}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{lang.name}</h3>
                      {lang.isPrimary && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200/60">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600 font-medium">{lang.nativeName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                        {lang.code}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(lang)}
                    title="Edit language"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLanguage(lang)}
                    title="Delete language"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {lang.isEnabled ? "Available for agents" : "Disabled"}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleLanguage(lang)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    lang.isEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      lang.isEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Language Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isEditing ? "Edit Language" : "Add New Language"}
                  </h3>
                  <p className="text-xs text-slate-500">Add regional or global language for AI voice agents.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLanguage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Language Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marathi, Gujarati, Spanish"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Native Script / Native Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. मराठी, ગુજરાતી, Español"
                  value={formData.nativeName}
                  onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Locale Code *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. mr-IN, gu-IN"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Flag Emoji</label>
                  <input
                    type="text"
                    placeholder="🇮🇳"
                    value={formData.flagEmoji}
                    onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center text-base"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimaryLang"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isPrimaryLang" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Set as default primary language
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEnabledLang"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isEnabledLang" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Enable this language for assistant creation
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
                  <span>{isSaving ? "Saving..." : isEditing ? "Update Language" : "Add Language"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
