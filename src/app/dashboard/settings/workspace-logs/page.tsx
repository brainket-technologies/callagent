"use client";

import React, { useState, useEffect } from "react";
import { Download, Copy, Check, Loader2, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceLog {
  id: string;
  workspaceId: string;
  userId: string | null;
  userEmail: string | null;
  operation: string;
  resource: string;
  resourceId: string | null;
  resourceType: string | null;
  details: Record<string, any> | null;
  createdAt: string;
}

export default function WorkspaceLogsPage() {
  const [logs, setLogs] = useState<WorkspaceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await fetch("/api/workspace/logs");
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error("Failed to load workspace activity logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  const handleExport = () => {
    if (logs.length === 0) {
      alert("No logs available to export.");
      return;
    }

    const csvContent = [
      ["Log ID", "Operation", "Resource Name", "Resource ID", "User Email", "User ID", "Timestamp"],
      ...logs.map((l) => [
        l.id,
        l.operation,
        l.resource,
        l.resourceId || "",
        l.userEmail || "",
        l.userId || "",
        new Date(l.createdAt).toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `workspace-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLogDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { datePart: "—", timePart: "" };

    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timePart = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return { datePart, timePart };
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Workspace Logs</h1>
          <p className="text-xs text-neutral-500 mt-0.5">View and download your workspace activity logs</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="text-xs h-9 rounded-xl border-neutral-200 hover:bg-neutral-50"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#11E97F]" />
            <span>Loading workspace activity logs from database...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-xs text-neutral-500">
            <Clock className="h-8 w-8 text-neutral-300 mb-2" />
            <p className="font-semibold text-neutral-700">No logs recorded yet</p>
            <p className="text-neutral-400 mt-0.5">Actions performed in this workspace will automatically appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/70 text-neutral-500 border-b border-neutral-200/80 font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-6">Operation</th>
                  <th className="py-3 px-6">Resource</th>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((log) => {
                  const { datePart, timePart } = formatLogDate(log.createdAt);
                  const isIdCopied = copiedKey === `id-${log.id}`;
                  const isResCopied = copiedKey === `res-${log.id}`;
                  const isUserCopied = copiedKey === `user-${log.id}`;

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/60 transition group">
                      {/* ID with copy icon */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(log.id, `id-${log.id}`)}
                          className="inline-flex items-center justify-center p-1.5 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition cursor-pointer"
                          title="Copy Log ID"
                        >
                          {isIdCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Operation */}
                      <td className="py-4 px-6 align-top">
                        <span className="font-medium text-neutral-900 border-b border-dashed border-neutral-400 pb-0.5 cursor-default hover:text-black transition">
                          {log.operation}
                        </span>
                      </td>

                      {/* Resource */}
                      <td className="py-4 px-6 align-top">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-neutral-900 text-xs">
                            {log.resource}
                          </p>
                          {log.resourceId && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                              <span>{log.resourceId.length > 20 ? `${log.resourceId.slice(0, 18)}...` : log.resourceId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(log.resourceId || "", `res-${log.id}`)}
                                className="opacity-0 group-hover:opacity-100 transition p-0.5 hover:text-neutral-700 cursor-pointer"
                                title="Copy Resource ID"
                              >
                                {isResCopied ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-6 align-top">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-neutral-900 text-xs">
                            {log.userEmail || "System"}
                          </p>
                          {log.userId && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                              <span>{log.userId.length > 20 ? `${log.userId.slice(0, 18)}...` : log.userId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(log.userId || "", `user-${log.id}`)}
                                className="opacity-0 group-hover:opacity-100 transition p-0.5 hover:text-neutral-700 cursor-pointer"
                                title="Copy User ID"
                              >
                                {isUserCopied ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-6 align-top">
                        <div className="space-y-0.5">
                          <p className="font-normal text-neutral-700 text-xs">
                            {datePart}
                          </p>
                          <p className="font-normal text-neutral-400 text-[11px]">
                            {timePart}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
