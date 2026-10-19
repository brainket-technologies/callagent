<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WORKSPACE RULES & SECURITY STANDARDS

## 1. Password Security & Cryptographic Hashing Rule (MANDATORY)
- **Plain-text passwords strictly prohibited:** Passwords must ALWAYS be cryptographically hashed (using `bcrypt` with salt, min 10 rounds) before storing in PostgreSQL, Redis, or any database.
- **Never compare plain-text:** Always verify passwords using `verifyPassword` (`bcrypt.compare`). Never use direct equality (`===`).
- **Seed & test scripts:** All seed scripts (`seed.ts`), mock data, and test fixtures must use `hashPassword` from `src/lib/auth-password.ts`.

## 2. Workspace Audit Logging Standard (MANDATORY)
- **Har workspace action ka log hona zaroori hai:** Whenever any user or administrative action occurs within a workspace, it MUST record an audit activity log entry in the PostgreSQL `workspace_logs` table.
- **Auto-Logging Helper:** Use `logWorkspaceActivity()` from `src/lib/workspace-logs.ts` (for server/API operations) or `sendWorkspaceLog` / `POST /api/workspace/logs` (for client-initiated actions).
- **Mandatory Log Fields:**
  - `workspaceId`: Target workspace UUID.
  - `userId` & `userEmail`: The authenticated actor performing the action.
  - `operation`: Human-readable action name (e.g., `Edited workspace`, `Created agent`, `Edited agent`, `Deleted agent`, `Invited member`, `Removed member`, `Recharged wallet`, `Created campaign`).
  - `resource`: Name of the modified entity (e.g. agent name, workspace name, member email).
  - `resourceId`: UUID / ID of the modified entity.
  - `resourceType`: `workspace` | `agent` | `member` | `wallet` | `campaign` | `general`.
  - `details`: Optional JSON payload/diff.
- **No Mock / Static Logs:** `src/app/dashboard/settings/workspace-logs/page.tsx` must always fetch and render real-time logs directly from `/api/workspace/logs`. Never hardcode static activity rows.

