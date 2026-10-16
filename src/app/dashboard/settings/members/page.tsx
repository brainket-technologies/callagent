"use client";

import React, { useState } from "react";
import { Users, Plus, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function WorkspaceMembersPage() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Members</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage all your workspace members here</p>
        </div>

        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            <tr>
              <td className="py-3.5 px-4 font-bold text-neutral-900 flex items-center gap-2">
                <span>Firoz Mohammad</span>
                <Badge variant="default" className="text-[10px]">Owner</Badge>
              </td>
              <td className="py-3.5 px-4 font-mono text-neutral-600">firozm613@gmail.com</td>
              <td className="py-3.5 px-4 font-semibold text-neutral-700">Workspace Owner</td>
              <td className="py-3.5 px-4">
                <Badge variant="success">Active</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Member to Workspace"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Email Address *</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
            >
              <option value="admin">Admin (Manage agents, view logs, launch campaigns)</option>
              <option value="member">Member (View reports, listen to recordings)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                alert(`Invitation sent to ${inviteEmail}!`);
                setInviteModalOpen(false);
              }}
              className="bg-neutral-900 text-white"
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
