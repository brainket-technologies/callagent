/**
 * ==============================================================================
 * CENTRALIZED THEME SYSTEM — HACKERRANK EMERALD GREEN (#11E97F) & CLEAN WHITE
 * ==============================================================================
 * Clean crisp white background (#FFFFFF) with HackerRank vibrant emerald green (#11E97F)
 * accents, dark charcoal typography (#0F172A), and clean hairline borders.
 * Single source of truth for the entire application.
 */

export const THEME_CONFIG = {
  // Light Mode Canvas & Backgrounds
  mode: process.env.NEXT_PUBLIC_THEME_MODE || "light",
  bg: process.env.NEXT_PUBLIC_THEME_BG || "#FFFFFF",
  canvas: process.env.NEXT_PUBLIC_THEME_CANVAS || "#F8FAFC",
  border: process.env.NEXT_PUBLIC_THEME_BORDER || "#E2E8F0",
  borderSubtle: "#F1F5F9",

  // HackerRank Vibrant Green Accent (#11E97F)
  primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || "#11E97F",
  primaryHover: process.env.NEXT_PUBLIC_THEME_PRIMARY_HOVER || "#0ED071",
  primaryText: process.env.NEXT_PUBLIC_THEME_PRIMARY_TEXT || "#0A0E1A",
  primaryLight: "#ECFDF5", // Emerald 50
  accentEmerald: "#11E97F",

  // Typography Colors (Light Mode)
  textPrimary: "#0F172A", // Slate 900
  textSecondary: "#475569", // Slate 600
  textMuted: "#94A3B8", // Slate 400

  // Gradients & Accents
  primaryGradient: "bg-gradient-to-r from-[#11E97F] to-[#0ED071]",
  primaryGradientHover: "hover:from-[#0ED071] hover:to-[#0BC468]",
  avatarGradient: "bg-[#11E97F] text-[#0A0E1A] font-extrabold",
  glowBorder: "ring-2 ring-[#11E97F]/50 shadow-lg shadow-[#11E97F]/20",

  // Common UI helper class strings for consistent reuse
  classes: {
    sidebarBg: "bg-white",
    sidebarBorder: "border-slate-200/80",
    sidebarBottomBg: "bg-slate-50/70",
    activeNavPill: "bg-emerald-50 text-emerald-950 border-l-[3px] border-[#11E97F] font-bold shadow-2xs",
    
    // HackerRank-style Green Primary Button
    btnPrimary: "bg-[#11E97F] hover:bg-[#0ED071] text-[#0A0E1A] font-extrabold shadow-sm hover:shadow-md hover:shadow-[#11E97F]/30 active:scale-95 transition-all cursor-pointer",
    
    // Clean White Secondary Button
    btnSecondary: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold shadow-2xs transition cursor-pointer",

    // Light Card Surface
    lightCard: "bg-white border border-slate-200/80 text-slate-900 shadow-2xs hover:shadow-sm hover:border-[#11E97F] transition",
    
    // Code Box
    codeBox: "bg-slate-950 border border-slate-800 text-[#11E97F] font-mono",
  },
} as const;

export default THEME_CONFIG;
