# Feedback Board — AI Training Lab (Intentionally Flawed Starter)

> ⚠️ **For instructional and demonstrative purposes only.**
> This application is **deliberately insecure and poorly engineered**. It exists solely as the starting point for a hands-on training exercise — *"Vibe Coding vs Production Engineering."* **Do not deploy it, and do not use any part of it as a reference for real code.**
>
> © CodeClouds. This repository is the property of **CodeClouds** and is provided for demonstration and training only.

---

## What this is

A tiny **Next.js (App Router) + React** "Feedback Board" that an AI assistant produced in minutes. It runs. It looks fine. It is full of production-grade traps. Your job in the lab is to take it from a *vibe-coded draft* to a *production-ready* application.

Storage is a plain JSON file (`data/feedback.json`) — no database, no native modules — so it runs fully offline.

---

## 1. Fork this repo

You will make changes, so work on **your own copy**:

1. Click **Fork** (top-right of this page on GitHub) → this creates `https://github.com/<your-username>/feedback-board-lab`.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/feedback-board-lab.git
   cd feedback-board-lab
   ```
3. (Optional) Keep a link to the original to pull updates:
   ```bash
   git remote add upstream https://github.com/GautamRoyCodeClouds/feedback-board-lab.git
   ```
4. Create a working branch:
   ```bash
   git checkout -b production-hardening
   ```

> Prefer the CLI? `gh repo fork GautamRoyCodeClouds/feedback-board-lab --clone`

---

## 2. Run it

Requires **Node.js >= 18**.

```bash
npm install
npm run dev
```

Visit **http://localhost:3000**.

- Submit feedback with the form (name + text).
- Bob's seeded entry contains `<b>bold improvements</b>` and **renders as actual bold text** — that is the stored XSS flaw, visible immediately.
- The **Delete** button shows for everyone (`isAdmin = true` lives in the browser) and removes entries with no real authentication.

---

## 3. The lab: make it production-ready

The app ships with **7 planted flaws**. Harden each one. This maps directly to the session slides and the *Definition of Done for AI-generated code*.

| # | Flaw (where) | Production fix |
|---|--------------|----------------|
| 1 | **Hardcoded secret** — `const ADMIN_KEY = "sk-admin-12345"` in `app/api/feedback/route.js` | Read it from `process.env.ADMIN_KEY` (add `.env.local`, never commit it; document with `.env.example`). Throw if it's missing rather than failing silently. |
| 2 | **No input validation** — POST writes `name`/`text` straight to storage | Validate with **zod** (`name` <= 100 chars, `text` <= 2000), reject invalid requests with **400**, and store only validated data. |
| 3 | **Stored XSS** — `dangerouslySetInnerHTML` in `app/page.jsx` | Render feedback as **plain text** (drop `dangerouslySetInnerHTML`). Never interpret user content as HTML. |
| 4 | **Client-only authorization** — `isAdmin = true` in the browser; DELETE trusts `body.isAdmin` | Enforce auth **server-side**: the DELETE handler checks an `Authorization` header against `process.env.ADMIN_KEY` and returns **403** if missing/wrong. Remove the client-side guard. |
| 5 | **Silent failures** — empty `catch (e) {}` around writes | Log the error and return a proper **500** response. The API must never report success when data wasn't saved. |
| 6 | **Hallucination artifact** — `formatRelativeTime()` is called but never exists | Either implement a small `lib/dateUtils.js` helper, or remove `displayTime` entirely. **Do not add a new dependency** for it. |
| 7 | **No tests** | Add **Vitest** tests covering the API route (e.g. invalid input -> 400, missing auth -> 403, valid submit -> 201). |

**Only two new dependencies are permitted for the lab:** `zod` (validation) and `vitest` (tests).

### Definition of Done (before you'd merge this)

- [ ] No secrets in source or committed env files
- [ ] All input validated server-side; 400 on violation
- [ ] No `dangerouslySetInnerHTML` on user content
- [ ] Authorization enforced server-side (403 without valid credentials)
- [ ] Errors handled and surfaced — no silent `catch {}`
- [ ] Every dependency is real and reviewed (no hallucinated/typo'd packages)
- [ ] Tests added and passing (`npm test`)
- [ ] You read the diff line-by-line and can roll it back

---

## Tooling used in the lab

The session drives these changes with **Cursor** (using a project-level `.cursorrules` guardrail file, included here) and, as an open-source parallel track, **Roo Code** in VS Code. See the `.cursorrules` file in this repo for the standing guardrails.

---

## Disclaimer & ownership

This repository is published **strictly for instructional and demonstrative purposes**. The code intentionally contains security vulnerabilities and anti-patterns and **must not be deployed or reused** in any production or real-world context.

**© CodeClouds — all rights reserved.** This repository and its contents are the property of CodeClouds and are made available for training and demonstration only.
