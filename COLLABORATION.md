# Collaboration Workflow

## Team

- **Vicky Lalwani** ([@vickylalwani](https://github.com/vickylalwani)) —
  Captain, founder, pitch lead. Working in Claude Code.
- **Nirav Bhadani** (nirav.bhadani@softqubes.com) — Polish
  + remaining features. Working in Antigravity.

## Branches

- `main` — production (auto-deploys to Vercel)
- `dev` — active development
- `feature/*` — individual feature branches

Never push directly to `main`. Always go through a feature
branch and a PR.

## Daily workflow

```bash
# Start of session
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes
git add .
git commit -m "feat: short description of what changed"

# Push your branch
git push origin feature/your-feature-name

# Open Pull Request on GitHub:
# https://github.com/vickylalwani/virtual-hotel-sales-team/compare
# Target: main · Source: feature/your-feature-name

# After review + merge, clean up locally
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

## Communication rules

- **Pull before starting work** — `git pull origin main`
- **Push at end of session** — even if work isn't done, push
  a WIP commit on your branch so the other person can see it
- **Ping in Slack/Teams before editing the same file** to
  avoid merge conflicts
- **Commit messages** — short, prefix with `feat:`, `fix:`,
  `docs:`, `style:`, `refactor:`, `chore:`
- **Never commit secrets** — `.env.local` is gitignored.
  Verify before pushing: `git check-ignore -v .env.local`

## API Keys

Each developer keeps their own `.env.local` with:

```
ANTHROPIC_API_KEY=<get from Vicky privately, do not share>
```

Get it from Vicky over Slack/Signal. **Never paste it in
chat, GitHub issues, commit messages, or screenshots.**

## Live preview

Production: <https://virtual-hotel-sales-team.vercel.app>

Auto-deploys on every push to `main`. Preview deployments
auto-generate for every PR — Vercel posts the preview URL
in the PR comments within ~30 seconds of opening it.

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npx tsc --noEmit     # type check (run before opening a PR)
```

## Repository

<https://github.com/vickylalwani/virtual-hotel-sales-team>

## Contact

- Vicky: vickylalwani1995@gmail.com
- Nirav: nirav.bhadani@softqubes.com
