# my Sales TEAM AI

AI-powered virtual sales department for hotels. Built on the MHSP
(My Hospitality Sales Pro) method.

## About

Built solo by **Vicky Lalwani** (Digital Marketing Director,
Softqube Technologies) for Softqube Heckathon 2026.

The play: when a hotel manager describes their property, an
AI sales team of 11 specialists generates real outputs -
leads, emails, follow-ups, proposals, retention plans - in
real time.

## Live demo

🔗 [virtual-hotel-sales-team.vercel.app](https://virtual-hotel-sales-team.vercel.app/)

Demo credentials on the login page: `test` / `test` (any
username/password works).

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Anthropic Claude API (Sonnet 4.6)
- Vercel hosting (auto-deploys from `main`)
- framer-motion (animations)
- react-markdown + remark-gfm (output rendering)
- xlsx (Excel exports)

## The 11 agents

1. **Director of Sales** - strategy + weekly plan
2. **Lead Generation Agent** - finds prospects
3. **Outbound Sales Agent** - cold emails + scripts
4. **Account Relationship Manager** - warm accounts
5. **RFP Closing Agent** - proposals
6. **LNR Closing Agent** - negotiated rates
7. **Group Sales Agent** - room blocks
8. **Meeting & Catering Agent** - events
9. **After-Sales Service Agent** - post-stay
10. **Customer Revenue & Retention Agent** - repeat business
11. **Revenue & Leadership Agent** - reports

Plus a sticky **myConcierge** AI assistant on every page -
a hotel-sales co-pilot that answers questions, explains the
app, and routes you to the right agent.

## Setup

```bash
git clone https://github.com/vickylalwani/virtual-hotel-sales-team.git
cd virtual-hotel-sales-team
npm install
# create .env.local with your ANTHROPIC_API_KEY (ask Vicky)
npm run dev
```

Open <http://localhost:3000>.

`.env.local` requires:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Architecture

```
/app
  /api
    /run-agent          POST - runs a single agent
    /concierge          POST - myConcierge streaming chat
    /sample-output      GET - Demo Mode cached outputs
    /queue-email        POST - fake email queue
  /agent/[id]           Agent detail page
  /agents               Agent grid
  /activity             Activity timeline + KPIs
  /login                Auth gate
  page.tsx              Hero + hotel input
/skills                 11 markdown system prompts
/sample-data            11 cached demo outputs (Dallas-flavored)
/components             UI components (Nav, Footer, Concierge, ...)
/lib                    Hooks + helpers (auth, demo-mode, agents, ...)
```

## Demo Mode

Toggle in nav. When ON, agent runs hit `/api/sample-output`
instead of Claude - instant cached responses ideal for stage
demos and offline backups.

## Collaboration

See [COLLABORATION.md](./COLLABORATION.md) for branch strategy
and team workflow.

## Built by

**Vicky Lalwani** - Digital Marketing Director, Softqube
Technologies.

For My Hospitality Sales Pro & Inntelligent CRM × Softqube
Heckathon 2026.
