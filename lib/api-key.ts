import { promises as fs } from "fs";
import path from "path";

// Resolve the Anthropic API key. Prefers process.env (production / Vercel),
// falls back to reading .env.local from disk for the dev case where the
// parent shell may inject an empty ANTHROPIC_API_KEY that prevents Next from
// overriding it.
export async function resolveApiKey(): Promise<string | null> {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv && fromEnv !== "your-key-here") return fromEnv;
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), ".env.local"),
      "utf-8"
    );
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) {
        const v = m[1].replace(/^['"]|['"]$/g, "");
        if (v && v !== "your-key-here") return v;
      }
    }
  } catch {
    // ignore
  }
  return null;
}
