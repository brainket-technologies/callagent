import React, { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RechargeModal } from "@/components/wallet/recharge-modal";
import { TestCallDrawer } from "@/components/telephony/test-call-drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50/50">
      {/* Sidebar with Suspense boundary */}
      <Suspense fallback={<div className="w-60 border-r border-neutral-200 bg-white" />}>
        <DashboardSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-14 border-b border-neutral-200 bg-white" />}>
          <DashboardHeader />
        </Suspense>
        <main className="flex-1 overflow-y-auto bg-[#FBFBFB]">
          {children}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <RechargeModal />
      <TestCallDrawer />
    </div>
  );
}
