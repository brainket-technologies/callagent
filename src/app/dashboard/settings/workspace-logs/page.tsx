"use client";

import React from "react";
import { FileText, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceLogsPage() {
  const auditLogs = [
    {
      id: "log-001",
      operation: "Edited agent",
      resource: "dd",
      user: "firozm613@gmail.com",
      time: "15 Oct, 2026 11:49:21 PM",
    },
    {
      id: "log-002",
      operation: "Created agent",
      resource: "dd",
      user: "firozm613@gmail.com",
      time: "15 Oct, 2026 11:44:06 PM",
    },
    {
      id: "log-003",
      operation: "Recharged wallet",
      resource: "Wallet +₹500",
      user: "firozm613@gmail.com",
      time: "15 Oct, 2026 10:00:12 AM",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Workspace Logs</h1>
          <p className="text-xs text-neutral-500 mt-0.5">View and download your workspace activity logs</p>
        </div>
        <Button
          variant="outline"
          onClick={() => alert("Exported workspace audit logs.")}
          className="text-xs h-9"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Operation</th>
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50/80">
                <td className="py-3.5 px-4 text-neutral-400 font-sans">{log.id}</td>
                <td className="py-3.5 px-4 font-bold text-neutral-900 font-sans">{log.operation}</td>
                <td className="py-3.5 px-4 text-neutral-700 font-sans">{log.resource}</td>
                <td className="py-3.5 px-4 text-neutral-600">{log.user}</td>
                <td className="py-3.5 px-4 text-neutral-500 font-sans">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
