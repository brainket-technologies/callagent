"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, Mail, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function WorkspaceMembersPage() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadMembers() {
    try {
      setLoading(true);
      const res = await fetch("/api/workspace/members");
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    try {
      setInviting(true);
      setErrorMessage("");
      const res = await fetch("/api/workspace/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || `Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        await loadMembers();
        setTimeout(() => {
          setInviteModalOpen(false);
          setSuccessMessage("");
        }, 1200);
      } else {
        setErrorMessage(data.error || "Failed to invite member");
      }
    } catch (err: any) {
      setErrorMessage("Network error while inviting member");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return;

    try {
      const res = await fetch(`/api/workspace/members?id=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } else {
        alert(data.error || "Failed to remove member");
      }
    } catch (err) {
      alert("Network error while removing member");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Members</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage all your workspace members here</p>
        </div>

        <Button
          onClick={() => {
            setErrorMessage("");
            setSuccessMessage("");
            setInviteModalOpen(true);
          }}
          className="text-xs rounded-xl"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3]" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#11E97F]" />
            <span>Loading members from database...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-xs text-neutral-500">
            <Users className="h-8 w-8 text-neutral-300 mb-2" />
            <p className="font-semibold text-neutral-700">No members found</p>
            <p className="text-neutral-400 mt-0.5">Invite teammates to collaborate on this workspace</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-neutral-900 flex items-center gap-2">
                    <span>{member.name || "User"}</span>
                    {member.role === "owner" && (
                      <Badge variant="default" className="text-[10px]">Owner</Badge>
                    )}
                    {member.role === "admin" && (
                      <Badge variant="default" className="text-[10px] bg-emerald-600 text-white">Admin</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-600">{member.email}</td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-700 capitalize">
                    {member.role === "owner" ? "Workspace Owner" : member.role}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {member.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                        className="text-neutral-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Member to Workspace"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-700">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-[#11E97F] focus:ring-1 focus:ring-[#11E97F]"
            >
              <option value="admin">Admin (Manage agents, view logs, launch campaigns)</option>
              <option value="member">Member (View reports, listen to recordings)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)} disabled={inviting}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Inviting...
                </span>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
