"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  PhoneCall,
  Receipt,
  Headphones,
  Settings,
  LogOut,
  Loader2,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Mail,
  Flame,
  Wrench,
  Hash,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Lock,
  CheckCircle2,
  Mic,
  Languages,
  Sparkles,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { THEME_CONFIG } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on admin login page, bypass admin chrome shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState("admin");
  const [collapsed, setCollapsed] = useState(false);

  // Profile Dropdown & Password Modal states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 3) {
      setPassError("New password must be at least 3 characters");
      return;
    }

    try {
      setIsUpdatingPass(true);
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminUser, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setPassSuccess("Password successfully changed!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setChangePasswordModalOpen(false);
          setPassSuccess(null);
        }, 1500);
      } else {
        setPassError(data.error || "Failed to update password");
      }
    } catch (err) {
      setPassError("Network error while updating password");
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const getBreadcrumbTitle = (path: string) => {
    if (path === "/admin") return "Dashboard Overview";
    if (path === "/admin/users") return "User List & Workspaces";
    if (path === "/admin/calls") return "Call / Msg Logs";
    if (path === "/admin/transactions") return "Transactions";
    if (path === "/admin/support") return "Support Desk";
    if (path.startsWith("/admin/settings/payment")) return "Settings / Payment Gateway";
    if (path.startsWith("/admin/settings/mail")) return "Settings / Mail";
    if (path.startsWith("/admin/settings/firebase")) return "Settings / Firebase";
    if (path.startsWith("/admin/settings/tools")) return "Settings / Tools";
    if (path.startsWith("/admin/settings/numbers")) return "Settings / Numbers Provider";
    if (path.startsWith("/admin/settings/voices")) return "Settings / Voice Library";
    if (path.startsWith("/admin/settings/languages")) return "Settings / Languages";
    if (path.startsWith("/admin/settings/tones")) return "Settings / Voice Tones";
    if (path.startsWith("/admin/settings")) return "Settings / Payment Gateway";
    return path.replace("/admin/", "").replace(/-/g, " ");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("voxera_admin_authenticated");
      const user = localStorage.getItem("voxera_admin_user");
      if (auth === "true") {
        setIsAdminAuth(true);
        if (user) setAdminUser(user);
        setCheckingAuth(false);
      } else {
        window.location.replace("/admin/login");
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("voxera_admin_authenticated");
      localStorage.removeItem("voxera_admin_user");
      localStorage.removeItem("voxera_admin_login_time");
      document.cookie = "voxera_admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.replace("/admin/login");
    }
  };

  const navSections = [
    {
      title: "PLATFORM MANAGEMENT",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "User List", href: "/admin/users", icon: Users },
        { label: "Call / Msg Logs", href: "/admin/calls", icon: PhoneCall },
        { label: "Transactions", href: "/admin/transactions", icon: Receipt },
        { label: "Support Desk", href: "/admin/support", icon: Headphones },
      ],
    },
    {
      title: "SETTINGS",
      items: [
        { label: "Payment Gateway", href: "/admin/settings/payment", icon: CreditCard },
        { label: "Mail (SMTP)", href: "/admin/settings/mail", icon: Mail },
        { label: "Firebase (FCM)", href: "/admin/settings/firebase", icon: Flame },
        { label: "Tools", href: "/admin/settings/tools", icon: Wrench },
        { label: "Numbers Provider", href: "/admin/settings/numbers", icon: Hash },
        { label: "Voice Library", href: "/admin/settings/voices", icon: Mic },
        { label: "Languages", href: "/admin/settings/languages", icon: Languages },
        { label: "Voice Tones", href: "/admin/settings/tones", icon: Sparkles },
      ],
    },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">Authenticating Super Admin Plane...</p>
      </div>
    );
  }

  if (!isAdminAuth) {
    return null;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex antialiased">
      {/* =========================================================================
          ADMIN DEDICATED SIDEBAR (Exact user dashboard design & architecture)
          ========================================================================= */}
      <aside
        className={cn(
          "flex flex-col border-r border-slate-200/90 bg-white text-slate-700 transition-all duration-300 select-none z-20 shadow-xs h-full shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top Brand Logo Header matching User Dashboard */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 bg-white">
          {!collapsed ? (
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black text-sm shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-emerald-700 transition">
                    {BRAND_CONFIG.name}
                  </span>
                  <span className="h-2 w-2 rounded-xs bg-[#11E97F]" title="Green Tag" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Admin Control Plane
                </span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#11E97F] text-[#0A0E1A] font-black shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav List with user dashboard styled sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {sec.title && !collapsed && (
                <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                  {sec.title}
                </p>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href === "/admin/settings/payment" && pathname === "/admin/settings");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150",
                      isActive
                        ? THEME_CONFIG.classes.activeNavPill
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 font-medium"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}

                    {isActive && !collapsed && (
                      <div className="ml-auto h-2 w-2 rounded-xs bg-[#11E97F] shadow-2xs" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section matching User Dashboard */}
        <div className="border-t border-slate-200/80 p-3 space-y-1 bg-slate-50/60">
          {!collapsed ? (
            <div className="pt-1 px-3 pb-1 flex items-center justify-between">
              <div className="truncate">
                <p className="text-[10px] text-slate-400">Master Superadmin</p>
                <p className="text-[11px] font-semibold text-slate-700 truncate">{adminUser}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-emerald-200" title="Telemetry Active" />
                <button
                  onClick={handleLogout}
                  title="Logout from Admin Plane"
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Logout from Admin Plane"
              className="mx-auto flex p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN ADMIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Admin Top Header */}
        <header className="relative z-30 h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Admin</span>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-800">
                {getBreadcrumbTitle(pathname)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                id="admin-profile-menu-button"
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-1 pr-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label="Admin Profile Menu"
              >
                <div className="relative h-8 w-8 rounded-full bg-slate-100 ring-2 ring-emerald-500/30 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                  <span className="text-[11px] font-black text-slate-700">AD</span>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                    alt="Admin Profile"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#11E97F] ring-2 ring-white z-10" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">Admin</span>
              </button>

              {/* Dropdown Menu - Simple & Sleek */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    {/* Change Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setPassError(null);
                        setPassSuccess(null);
                        setChangePasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition cursor-pointer text-left"
                    >
                      <KeyRound className="h-4 w-4 text-slate-500" />
                      <span>Change Password</span>
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {/* Log Out */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Change Password Modal */}
        {changePasswordModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                    <p className="text-[11px] text-slate-500">Update master admin credentials in PostgreSQL</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {passError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                {/* Current Password */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showCurrentPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password"
                      className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showNewPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full h-10 px-3 pr-10 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setChangePasswordModalOpen(false)}
                    className="px-4 h-9 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPass}
                    className="px-5 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
                  >
                    {isUpdatingPass ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
