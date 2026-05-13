"use client";

// ─── Playbook Schema + Loader ────────────────────────────────────────────────

export interface PlaybookMetadata {
  agentId: string;
  realName: string;
  designation: string;
  funnel: "calculated" | "hustle" | "custom";
  photo: string;
  voice: string;
  status: "active" | "draft" | "archived";
  version: string;
  createdBy: string;
  createdAt: string;
  isCustom?: boolean;
  isCaptain?: boolean;
  capabilities?: string[];
}

export interface PlaybookSections {
  problem: string;
  capabilities: string[];
  knowledge: string;
  teamWork: string;
  responseFormat: string;
  toneVoice: string;
  sampleConversations: string;
  hardRules: string;
}

export interface Playbook {
  metadata: PlaybookMetadata;
  content: string;
  sections: PlaybookSections;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const CUSTOM_PLAYBOOKS_KEY = "vhst-custom-playbooks";

// ─── Default Playbook Data (embedded at build time for client use) ────────────

const DEFAULT_AGENT_IDS = [
  "01_donna_marie",
  "02_marcus_reed",
  "03_sarah_chen",
  "04_priya_sharma",
  "05_liam_chen",
  "06_maya_reddy",
] as const;

// ─── Section Parser ──────────────────────────────────────────────────────────

function extractSection(content: string, sectionNum: number): string {
  const regex = new RegExp(
    `## ${sectionNum}\\.\\s+[^\\n]+\\n([\\s\\S]*?)(?=## \\d+\\.|$)`
  );
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function extractCapabilitiesFromSection(text: string): string[] {
  const lines = text.split("\n");
  return lines
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export function parsePlaybook(markdown: string): Playbook {
  // Parse YAML frontmatter manually (client-side compatible)
  let metadata: PlaybookMetadata;
  let bodyContent: string;

  if (markdown.startsWith("---")) {
    const endIdx = markdown.indexOf("---", 3);
    if (endIdx !== -1) {
      const yamlBlock = markdown.slice(3, endIdx).trim();
      metadata = parseYamlFrontmatter(yamlBlock);
      bodyContent = markdown.slice(endIdx + 3).trim();
    } else {
      metadata = emptyMetadata();
      bodyContent = markdown;
    }
  } else {
    metadata = emptyMetadata();
    bodyContent = markdown;
  }

  const sections: PlaybookSections = {
    problem: extractSection(bodyContent, 1),
    capabilities: extractCapabilitiesFromSection(extractSection(bodyContent, 2)),
    knowledge: extractSection(bodyContent, 3),
    teamWork: extractSection(bodyContent, 4),
    responseFormat: extractSection(bodyContent, 5),
    toneVoice: extractSection(bodyContent, 6),
    sampleConversations: extractSection(bodyContent, 7),
    hardRules: extractSection(bodyContent, 8),
  };

  return { metadata, content: markdown, sections };
}

function parseYamlFrontmatter(yaml: string): PlaybookMetadata {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");
  let currentKey = "";
  let inArray = false;
  const arrayBuffer: string[] = [];

  for (const line of lines) {
    if (inArray) {
      if (line.trim().startsWith("-")) {
        arrayBuffer.push(line.trim().slice(2).trim());
        continue;
      } else {
        result[currentKey] = [...arrayBuffer];
        arrayBuffer.length = 0;
        inArray = false;
      }
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();

    if (val === "" || val === undefined) {
      // Could be start of array
      currentKey = key;
      inArray = true;
      continue;
    }

    // Parse booleans
    if (val === "true") result[key] = true;
    else if (val === "false") result[key] = false;
    else result[key] = val;
  }

  if (inArray && arrayBuffer.length > 0) {
    result[currentKey] = [...arrayBuffer];
  }

  return {
    agentId: (result.agentId as string) || "",
    realName: (result.realName as string) || "",
    designation: (result.designation as string) || "",
    funnel: (result.funnel as "calculated" | "hustle" | "custom") || "custom",
    photo: (result.photo as string) || "",
    voice: (result.voice as string) || "warm_professional",
    status: (result.status as "active" | "draft" | "archived") || "draft",
    version: (result.version as string) || "1.0",
    createdBy: (result.createdBy as string) || "",
    createdAt: (result.createdAt as string) || "",
    isCustom: (result.isCustom as boolean) ?? true,
    isCaptain: (result.isCaptain as boolean) ?? false,
    capabilities: (result.capabilities as string[]) || [],
  };
}

function emptyMetadata(): PlaybookMetadata {
  return {
    agentId: "",
    realName: "",
    designation: "",
    funnel: "custom",
    photo: "",
    voice: "warm_professional",
    status: "draft",
    version: "1.0",
    createdBy: "",
    createdAt: new Date().toISOString().split("T")[0],
    isCustom: true,
    isCaptain: false,
    capabilities: [],
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validatePlaybook(playbook: Playbook): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const { metadata, sections } = playbook;

  if (!metadata.agentId) errors.push("Missing agentId");
  if (!metadata.realName) errors.push("Missing realName");
  if (!metadata.designation) errors.push("Missing designation");
  if (!metadata.funnel) errors.push("Missing funnel");
  if (!sections.problem) errors.push("Section 1 (Problem) is empty");
  if (sections.capabilities.length === 0)
    errors.push("Section 2 (Capabilities) is empty");
  if (!sections.toneVoice) errors.push("Section 6 (Tone & Voice) is empty");
  if (!sections.hardRules) errors.push("Section 8 (Hard Rules) is empty");

  return { valid: errors.length === 0, errors };
}

// ─── Custom Playbook CRUD (localStorage) ─────────────────────────────────────

export function getCustomPlaybooks(): Playbook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYBOOKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Playbook[];
  } catch {
    return [];
  }
}

export function saveCustomPlaybook(playbook: Playbook): void {
  const all = getCustomPlaybooks();
  const idx = all.findIndex(
    (p) => p.metadata.agentId === playbook.metadata.agentId
  );
  if (idx >= 0) {
    all[idx] = playbook;
  } else {
    all.push(playbook);
  }
  localStorage.setItem(CUSTOM_PLAYBOOKS_KEY, JSON.stringify(all));
}

export function deleteCustomPlaybook(agentId: string): void {
  const all = getCustomPlaybooks().filter(
    (p) => p.metadata.agentId !== agentId
  );
  localStorage.setItem(CUSTOM_PLAYBOOKS_KEY, JSON.stringify(all));
}

export function duplicatePlaybook(
  sourcePlaybook: Playbook,
  newName: string
): Playbook {
  const newId = newName.toLowerCase().replace(/\s+/g, "_") + "_v1";
  const newPlaybook: Playbook = {
    ...sourcePlaybook,
    metadata: {
      ...sourcePlaybook.metadata,
      agentId: newId,
      realName: newName,
      isCustom: true,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "user",
    },
    content: sourcePlaybook.content
      .replace(sourcePlaybook.metadata.realName, newName)
      .replace(sourcePlaybook.metadata.agentId, newId),
  };
  saveCustomPlaybook(newPlaybook);
  return newPlaybook;
}

// ─── Export / Import ─────────────────────────────────────────────────────────

export function exportPlaybook(playbook: Playbook): string {
  return generatePlaybookMarkdown(playbook);
}

export function importPlaybook(markdown: string): {
  success: boolean;
  playbook?: Playbook;
  errors?: string[];
} {
  try {
    const playbook = parsePlaybook(markdown);
    const validation = validatePlaybook(playbook);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    playbook.metadata.isCustom = true;
    return { success: true, playbook };
  } catch (e) {
    return {
      success: false,
      errors: [(e as Error).message || "Failed to parse playbook"],
    };
  }
}

// ─── Generate Markdown ───────────────────────────────────────────────────────

export function generatePlaybookMarkdown(playbook: Playbook): string {
  const { metadata: m, sections: s } = playbook;
  const caps = m.capabilities?.map((c) => `  - ${c}`).join("\n") || "";

  return `---
agentId: ${m.agentId}
realName: ${m.realName}
designation: ${m.designation}
funnel: ${m.funnel}
photo: ${m.photo}
voice: ${m.voice}
status: ${m.status}
version: ${m.version}
createdBy: ${m.createdBy}
createdAt: ${m.createdAt}
isCustom: ${m.isCustom ?? true}
isCaptain: ${m.isCaptain ?? false}
capabilities:
${caps}
---

# ${m.realName} — ${m.designation}

## 1. The Problem I Solve
${s.problem}

## 2. My Capabilities
${s.capabilities.map((c) => `- ${c}`).join("\n")}

## 3. My Specialized Knowledge
${s.knowledge}

## 4. How I Work with the Team
${s.teamWork}

## 5. My Response Format
${s.responseFormat}

## 6. My Tone & Voice
${s.toneVoice}

## 7. Sample Conversations
${s.sampleConversations}

## 8. Hard Rules
${s.hardRules}
`;
}

// ─── Default Agent ID Mapping (old → new playbook IDs) ──────────────────────

export const AGENT_TO_PLAYBOOK: Record<string, string> = {
  "01_director": "01_donna_marie",
  "02_lead_gen": "02_marcus_reed",
  "03_outbound": "03_sarah_chen",
  "04_rfp_group": "04_priya_sharma",
  "05_retention": "05_liam_chen",
  "06_revenue": "06_maya_reddy",
};

export const PLAYBOOK_TO_AGENT: Record<string, string> = Object.fromEntries(
  Object.entries(AGENT_TO_PLAYBOOK).map(([k, v]) => [v, k])
);

export function isDefaultPlaybook(agentId: string): boolean {
  return (DEFAULT_AGENT_IDS as readonly string[]).includes(agentId);
}

// ─── Voice Presets ───────────────────────────────────────────────────────────

export const VOICE_PRESETS = [
  { value: "warm_authoritative_female", label: "Warm Authoritative Female" },
  { value: "confident_professional_male", label: "Confident Professional Male" },
  { value: "friendly_conversational_female", label: "Friendly Conversational Female" },
  { value: "direct_executive_male", label: "Direct Executive Male" },
  { value: "warm_professional", label: "Warm Professional" },
  { value: "energetic_motivational", label: "Energetic & Motivational" },
] as const;

// ─── Capability Registry ─────────────────────────────────────────────────────

export const CAPABILITY_REGISTRY = [
  "email_writing",
  "cold_outreach",
  "rfp_parsing",
  "lead_scoring",
  "voice_calls",
  "sequence_building",
  "report_generation",
  "document_analysis",
  "pricing_calculator",
  "weekly_plan_generation",
  "team_briefing",
  "leadership_report",
  "prospect_list_building",
  "local_market_research",
  "segment_discovery",
  "call_scripts",
  "linkedin_outreach",
  "follow_up_cadences",
  "group_block_building",
  "proposal_writing",
  "concession_strategy",
  "post_stay_sequences",
  "review_generation",
  "win_back_campaigns",
  "loyalty_offers",
  "pipeline_dashboards",
  "kpi_tracking",
  "revenue_forecasting",
  "segment_analysis",
] as const;

// ─── Blank Playbook (for Builder) ────────────────────────────────────────────

export function createBlankPlaybook(): Playbook {
  const id = `custom_${Date.now()}`;
  return {
    metadata: {
      agentId: id,
      realName: "",
      designation: "",
      funnel: "custom",
      photo: "",
      voice: "warm_professional",
      status: "draft",
      version: "1.0",
      createdBy: "user",
      createdAt: new Date().toISOString().split("T")[0],
      isCustom: true,
      isCaptain: false,
      capabilities: [],
    },
    content: "",
    sections: {
      problem: "",
      capabilities: [],
      knowledge: "",
      teamWork: "",
      responseFormat: "",
      toneVoice: "",
      sampleConversations: "",
      hardRules: "",
    },
  };
}
