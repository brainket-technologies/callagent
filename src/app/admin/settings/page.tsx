"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/settings/payment");
  }, [router]);

  return (
    <div className="p-8 text-xs font-semibold text-slate-500 flex items-center gap-2">
      <div className="h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span>Loading Settings...</span>
    </div>
  );
}
