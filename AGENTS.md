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

