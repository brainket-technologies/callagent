import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(paise: number, currency = "INR"): string {
  const amount = paise / 100;
  const curr = (currency || "INR").toUpperCase();
  try {
    const localeMap: Record<string, string> = {
      INR: "en-IN",
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      AED: "en-AE",
    };
    const locale = localeMap[curr] || "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${curr} ${amount.toFixed(2)}`;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
