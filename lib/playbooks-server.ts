import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Playbook, PlaybookMetadata, PlaybookSections } from "./playbooks";

// ─── Server-side Playbook Loader ─────────────────────────────────────────────

const PLAYBOOKS_DIR = path.join(process.cwd(), "playbooks");

function extractSection(content: string, sectionNum: number): string {
  const regex = new RegExp(
    `## ${sectionNum}\\.\\s+[^\\n]+\\n([\\s\\S]*?)(?=## \\d+\\.|$)`
  );
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

function extractCapabilitiesFromSection(text: string): string[] {
  return text
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export async function loadPlaybook(agentId: string): Promise<Playbook | null> {
  try {
    const filePath = path.join(PLAYBOOKS_DIR, `${agentId}.md`);
    const raw = await fs.readFile(filePath, "utf-8");
    return parseServerPlaybook(raw);
  } catch {
    return null;
  }
}

export async function loadAllPlaybooks(): Promise<Playbook[]> {
  try {
    const files = await fs.readdir(PLAYBOOKS_DIR);
    const mdFiles = files.filter(
      (f) => f.endsWith(".md") && !f.startsWith("_")
    );
    const playbooks: Playbook[] = [];

    for (const file of mdFiles) {
      const raw = await fs.readFile(path.join(PLAYBOOKS_DIR, file), "utf-8");
      const pb = parseServerPlaybook(raw);
      if (pb) playbooks.push(pb);
    }

    return playbooks;
  } catch {
    return [];
  }
}

export async function loadPlaybookRaw(agentId: string): Promise<string | null> {
  try {
    const filePath = path.join(PLAYBOOKS_DIR, `${agentId}.md`);
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

function parseServerPlaybook(raw: string): Playbook | null {
  try {
    const { data, content } = matter(raw);
    const metadata: PlaybookMetadata = {
      agentId: data.agentId || "",
      realName: data.realName || "",
      designation: data.designation || "",
      funnel: data.funnel || "custom",
      photo: data.photo || "",
      voice: data.voice || "warm_professional",
      status: data.status || "active",
      version: data.version || "1.0",
      createdBy: data.createdBy || "system",
      createdAt: data.createdAt || "",
      isCustom: data.isCustom ?? false,
      isCaptain: data.isCaptain ?? false,
      capabilities: data.capabilities || [],
    };

    const sections: PlaybookSections = {
      problem: extractSection(content, 1),
      capabilities: extractCapabilitiesFromSection(
        extractSection(content, 2)
      ),
      knowledge: extractSection(content, 3),
      teamWork: extractSection(content, 4),
      responseFormat: extractSection(content, 5),
      toneVoice: extractSection(content, 6),
      sampleConversations: extractSection(content, 7),
      hardRules: extractSection(content, 8),
    };

    return { metadata, content: raw, sections };
  } catch {
    return null;
  }
}
