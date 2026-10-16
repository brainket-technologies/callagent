/**
 * ==============================================================================
 * CENTRALIZED BRAND & PLATFORM CONFIGURATION (ENV-DRIVEN)
 * ==============================================================================
 * All brand names, titles, taglines, support emails, and rate cards are
 * sourced dynamically from environment variables.
 * To rebrand the platform, simply edit .env:
 *   NEXT_PUBLIC_APP_NAME="YourBrand AI"
 */

export const BRAND_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Voxera AI",
  shortName: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "Voxera",
  tagline:
    process.env.NEXT_PUBLIC_APP_TAGLINE ||
    "Autonomous Enterprise Voice AI & Telephony Cloud",
  companyName:
    process.env.NEXT_PUBLIC_COMPANY_NAME || "Voxera Technologies Inc.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@voxera.ai",
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@voxera.ai",

  currencySymbol: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "₹",
  currencyCode: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY_CODE || "INR",

  ratePerMinutePaise: Math.round(
    parseFloat(process.env.NEXT_PUBLIC_RATE_PER_MINUTE || "10.00") * 100
  ),
  minCallBalancePaise: Math.round(
    parseFloat(process.env.NEXT_PUBLIC_MIN_CALL_BALANCE || "10.00") * 100
  ),

  sdkPackage: process.env.NEXT_PUBLIC_SDK_PACKAGE || "@voxera/voice-sdk",
  sdkCdnUrl:
    process.env.NEXT_PUBLIC_SDK_CDN_URL ||
    "https://cdn.voxera.ai/sdk/v1/widget.js",
  pythonSdk: process.env.NEXT_PUBLIC_PYTHON_SDK || "voxera-stt",
} as const;

export default BRAND_CONFIG;
