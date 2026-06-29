# Git Cheat-Sheet — Fork → Fix → Pull Request

A one-page reference for submitting your lab work. Five steps.

> Replace `<your-username>` with your GitHub username.

## Before the session (do this ahead of time)

```bash
# 1. Fork (GitHub UI: click "Fork" top-right), then clone YOUR fork:
git clone https://github.com/<your-username>/feedback-board-lab.git
cd feedback-board-lab

# 2. Install and confirm it runs:
npm install
npm run dev          # open http://localhost:3000, then Ctrl+C

# 3. Make a working branch:
git checkout -b production-hardening
```

GitHub CLI shortcut for steps 1–2: `gh repo fork GautamRoyCodeClouds/feedback-board-lab --clone`

## During the lab

Fix the code on the `production-hardening` branch. Save often.

## End of lab — submit (≈ 2 minutes)

```bash
# 4. Commit and push your branch to your fork:
git add -A
git commit -m "Production hardening"
git push -u origin production-hardening

# 5. Open a Pull Request to the original repo:
gh pr create \
  --repo GautamRoyCodeClouds/feedback-board-lab \
  --fill \
  --title "[Your Name] Production hardening"
```

No GitHub CLI? After `git push`, open your fork on GitHub — a green
**"Compare & pull request"** button appears. Click it, set the base repo to
`GautamRoyCodeClouds/feedback-board-lab` (base: `main`), title it
`[Your Name] Production hardening`, and submit.

## After you open the PR

- **CI runs automatically.** Aim for all checks **green** — they verify the
  secret is gone, XSS is fixed, authz is server-side, and your tests pass.
- Pushing more commits to the same branch updates the PR automatically.

---

## Common hiccups

| Problem | Fix |
|---------|-----|
| `Permission denied` on push | You cloned the original, not your fork. Re-clone from `https://github.com/<your-username>/...` |
| PR targets your own fork | On the PR page, set **base repository** to `GautamRoyCodeClouds/feedback-board-lab` |
| `npm test` fails in CI | You haven't added Vitest tests yet (Activity 2) — add them |
| Nothing to commit | You're on the wrong branch — `git checkout production-hardening` |

_For instructional purposes only · © CodeClouds._
