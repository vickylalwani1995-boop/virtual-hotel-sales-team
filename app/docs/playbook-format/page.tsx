"use client";

import Link from "next/link";
import { ArrowLeft, Download, BookOpen } from "lucide-react";

const STARTER_TEMPLATE = `---
agentId: my_agent_v1
realName: Your Agent Name
designation: Your Agent's Job Title
funnel: custom
photo: ""
voice: warm_professional
status: draft
version: "1.0"
createdBy: your@email.com
createdAt: "${new Date().toISOString().split("T")[0]}"
isCustom: true
isCaptain: false
capabilities:
  - capability_one
  - capability_two
  - capability_three
---

# Your Agent Name — Your Agent's Job Title

## 1. The Problem I Solve
[Describe the user pain this agent fixes in 2-3 sentences]

## 2. My Capabilities
- [Capability 1]
- [Capability 2]
- [Capability 3]

## 3. My Specialized Knowledge
[What domain expertise does this agent bring? Industry knowledge, frameworks, methodologies]

## 4. How I Work with the Team
[Which teammates does this agent collaborate with? When does it hand off?]

## 5. My Response Format
[How should this agent structure outputs? Tables, lists, prose? Templates?]

## 6. My Tone & Voice
[Personality description — confident, warm, direct, etc.]

## 7. Sample Conversations
**User:** [Example question]
**Agent:** [Example response showing the agent's style and capabilities]

## 8. Hard Rules
NEVER:
- [Thing this agent must never do]

ALWAYS:
- [Thing this agent must always do]
`;

export default function PlaybookFormatDocsPage() {
  function downloadStarter() {
    const blob = new Blob([STARTER_TEMPLATE], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "starter-playbook.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/playbooks"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7B8F] hover:text-[#0F4C81] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Playbook Studio
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-6 w-6 text-[#1B6EB7]" />
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#1B6EB7]">
              Developer Docs
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2547] mb-3">
            Build Your Own Agent — The Playbook Format
          </h1>
          <p className="text-[#6B7B8F] text-base leading-relaxed max-w-2xl">
            Every agent on this platform is powered by a Playbook — a structured
            Markdown file with YAML metadata and 8 content sections. Create your
            own agent in minutes by following this format.
          </p>
        </div>

        {/* Download CTA */}
        <div className="rounded-xl bg-gradient-to-r from-[#0F4C81]/5 to-[#1B6EB7]/10 border border-[#1B6EB7]/20 p-5 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#0F4C81] mb-1">
              Get the Starter Template
            </p>
            <p className="text-xs text-[#6B7B8F]">
              Download a blank .md file with all 8 sections ready to fill in.
            </p>
          </div>
          <button
            onClick={downloadStarter}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C81] hover:bg-[#1B6EB7] text-white px-5 py-2.5 text-sm font-bold transition-all shrink-0"
          >
            <Download className="h-4 w-4" /> Download .md
          </button>
        </div>

        {/* Structure Overview */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            File Structure
          </h2>
          <p className="text-sm text-[#6B7B8F] mb-4">
            A playbook file has two parts: YAML frontmatter (metadata) and
            Markdown content (8 numbered sections).
          </p>
          <div className="rounded-xl bg-[#1E293B] p-5 overflow-x-auto">
            <pre className="text-xs text-emerald-300 font-mono leading-relaxed">
{`---
agentId: priya_sharma_v1       # Unique identifier (lowercase, underscores)
realName: Priya Sharma          # Display name
designation: Group & RFP Lead   # Job title shown in UI
funnel: calculated              # calculated | hustle | custom
photo: /agents/priya.png       # Photo URL (optional)
voice: warm_professional        # Voice preset (see list below)
status: active                  # active | draft | archived
version: "1.0"                  # Semantic version
createdBy: vicky@softqube.com  # Author email
createdAt: "2026-05-12"        # ISO date
isCustom: true                  # true for user-created agents
isCaptain: false                # true if this is the team captain
capabilities:                   # Machine-readable capability tags
  - rfp_parsing
  - proposal_writing
  - group_block_building
---

# Priya Sharma — Group & RFP Lead

## 1. The Problem I Solve
[2-3 sentences describing the user pain this agent solves]

## 2. My Capabilities
- [Human-readable capability descriptions]

## 3. My Specialized Knowledge
[Domain expertise, industry knowledge, frameworks]

## 4. How I Work with the Team
[Collaboration patterns, handoffs, dependencies]

## 5. My Response Format
[Output structure — tables, emails, reports, etc.]

## 6. My Tone & Voice
[Personality, communication style]

## 7. Sample Conversations
[2-3 worked examples of User → Agent exchanges]

## 8. Hard Rules
[NEVER do X, ALWAYS do Y]`}
            </pre>
          </div>
        </section>

        {/* YAML Frontmatter Spec */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            YAML Frontmatter Spec
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[#E2E8F0] rounded-lg overflow-hidden">
              <thead className="bg-[#F0F5FB]">
                <tr>
                  <th className="text-left p-3 font-bold text-[#0F2547]">Field</th>
                  <th className="text-left p-3 font-bold text-[#0F2547]">Type</th>
                  <th className="text-left p-3 font-bold text-[#0F2547]">Required</th>
                  <th className="text-left p-3 font-bold text-[#0F2547]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {[
                  ["agentId", "string", "Yes", "Unique ID (lowercase, underscores, no spaces)"],
                  ["realName", "string", "Yes", "Agent's display name"],
                  ["designation", "string", "Yes", "Job title shown on cards"],
                  ["funnel", "enum", "Yes", "calculated | hustle | custom"],
                  ["photo", "string", "No", "URL to agent avatar image"],
                  ["voice", "string", "No", "Voice preset identifier"],
                  ["status", "enum", "Yes", "active | draft | archived"],
                  ["version", "string", "No", "Semantic version (default: 1.0)"],
                  ["createdBy", "string", "No", "Author email or 'system'"],
                  ["createdAt", "string", "No", "ISO date string"],
                  ["isCustom", "boolean", "No", "true for user-created agents"],
                  ["isCaptain", "boolean", "No", "true for the team captain agent"],
                  ["capabilities", "string[]", "No", "Machine-readable capability tags"],
                ].map(([field, type, req, desc]) => (
                  <tr key={field}>
                    <td className="p-3 font-mono text-xs text-[#1B6EB7]">{field}</td>
                    <td className="p-3 text-[#6B7B8F]">{type}</td>
                    <td className="p-3">{req === "Yes" ? "✓" : ""}</td>
                    <td className="p-3 text-[#374151]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Voice Presets */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            Voice Presets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["warm_authoritative_female", "Warm Authoritative Female", "Confident, 20-year veteran. Direct but never harsh."],
              ["confident_professional_male", "Confident Professional Male", "Street-smart, energetic. Always knows where opportunities hide."],
              ["friendly_conversational_female", "Friendly Conversational Female", "Direct, fearless, warm. No-Fear Selling approach."],
              ["direct_executive_male", "Direct Executive Male", "Data-driven, concise, leads with the number."],
              ["warm_professional", "Warm Professional", "Professional, precise, polished. Detail-oriented."],
              ["energetic_motivational", "Energetic & Motivational", "Genuine, personal, caring. Makes everyone feel valued."],
            ].map(([id, name, desc]) => (
              <div
                key={id}
                className="rounded-lg border border-[#E2E8F0] p-3"
              >
                <p className="text-xs font-mono text-[#1B6EB7] mb-1">{id}</p>
                <p className="text-sm font-semibold text-[#0F2547]">{name}</p>
                <p className="text-xs text-[#6B7B8F] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Capability Registry */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            Capability Registry
          </h2>
          <p className="text-sm text-[#6B7B8F] mb-4">
            Use these standardized capability tags in your frontmatter. You can also add custom ones.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "email_writing", "cold_outreach", "rfp_parsing", "lead_scoring",
              "voice_calls", "sequence_building", "report_generation",
              "document_analysis", "pricing_calculator", "weekly_plan_generation",
              "team_briefing", "leadership_report", "prospect_list_building",
              "local_market_research", "segment_discovery", "call_scripts",
              "linkedin_outreach", "follow_up_cadences", "group_block_building",
              "proposal_writing", "concession_strategy", "post_stay_sequences",
              "review_generation", "win_back_campaigns", "loyalty_offers",
              "pipeline_dashboards", "kpi_tracking", "revenue_forecasting",
              "segment_analysis",
            ].map((cap) => (
              <span
                key={cap}
                className="text-xs font-medium bg-[#F0F5FB] text-[#0F4C81]/70 rounded-full px-3 py-1.5 border border-[#E2E8F0]"
              >
                {cap}
              </span>
            ))}
          </div>
        </section>

        {/* 8 Sections Guide */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            The 8 Sections
          </h2>
          <div className="space-y-4">
            {[
              ["1. The Problem I Solve", "2-3 sentences describing the specific user pain this agent addresses. Be concrete — 'Hotels lose group leads because RFPs go unanswered for days.'"],
              ["2. My Capabilities", "Bulleted list of what this agent CAN do. These drive UI features and help the system route tasks correctly."],
              ["3. My Specialized Knowledge", "Industry expertise, frameworks, methodologies, and domain knowledge this agent brings. This is your moat — what makes this agent better than ChatGPT."],
              ["4. How I Work with the Team", "Which teammates this agent collaborates with, when it hands off, and how it uses shared workspace data."],
              ["5. My Response Format", "How the agent structures outputs — tables, email drafts, reports, plans. Include templates if relevant."],
              ["6. My Tone & Voice", "Personality description. Be specific: 'Like a 20-year hospitality veteran who's seen everything. Direct but never harsh.'"],
              ["7. Sample Conversations", "2-3 worked examples showing real User → Agent exchanges. These are the strongest training signal for the AI."],
              ["8. Hard Rules", "NEVER do / ALWAYS do constraints. These are safety rails that prevent the agent from going off-script."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-lg border border-[#E2E8F0] p-4"
              >
                <h3 className="text-sm font-bold text-[#0F2547] mb-1">
                  {title}
                </h3>
                <p className="text-xs text-[#6B7B8F] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold text-[#0F2547] mb-4">
            How to Create & Import
          </h2>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-[#374151]">
            <li>Download the starter template above (or copy from any existing playbook)</li>
            <li>Fill in the YAML frontmatter with your agent&apos;s metadata</li>
            <li>Complete all 8 sections with your agent&apos;s specific content</li>
            <li>Save as a <code className="text-xs bg-[#F0F5FB] px-1.5 py-0.5 rounded">.md</code> file</li>
            <li>Go to <Link href="/playbooks" className="text-[#1B6EB7] font-semibold hover:underline">Playbook Studio</Link> → click &quot;Import Playbook&quot;</li>
            <li>Upload your file — validation will check for missing sections</li>
            <li>Review and publish — your agent appears on the workspace immediately</li>
          </ol>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 pb-4 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#6B7B8F]">
            Powered by My Hospitality Sales Pro — Agent Builder Platform
          </p>
        </div>
      </div>
  );
}
