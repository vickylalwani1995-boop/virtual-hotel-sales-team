import type { Lead, LeadEmailStatus } from "@/lib/leads";

/**
 * Parse the first markdown table in `text` into Partial<Lead>[].
 * Best-effort: tolerant header matching, empty cells fine, no throws.
 * Returns [] if no usable table is found.
 */
export function parseLeadsFromMarkdown(text: string): Partial<Lead>[] {
  const table = extractFirstTable(text);
  if (!table) return [];

  const { headers, rows } = table;
  if (rows.length === 0) return [];

  // Build a header-index → Lead-field-handler map
  const mappers = headers.map((h) => matchHeader(h));

  const out: Partial<Lead>[] = [];
  for (const row of rows) {
    const lead: Partial<Lead> = {};
    for (let i = 0; i < headers.length; i++) {
      const handler = mappers[i];
      const cell = (row[i] ?? "").trim();
      if (!cell || !handler) continue;
      handler(lead, cell);
    }
    // Reject rows with no usable identifying info
    if (
      lead.prospectFullName ||
      lead.prospectFirstName ||
      lead.prospectLastName ||
      lead.contactProfessionalEmail ||
      lead.prospectCompanyName
    ) {
      out.push(lead);
    }
  }
  return out;
}

/** Detect a markdown table is present (used by AgentChat to decide
 *  whether to show the "Save these leads" button). */
export function hasLeadTable(text: string): boolean {
  const t = extractFirstTable(text);
  if (!t) return false;
  // Require ≥ 3 lead-flavored headers to count as a "leads" table
  const matches = t.headers.filter((h) => isLeadHeader(h)).length;
  return matches >= 3 && t.rows.length > 0;
}

/* ----------------- internals ----------------- */

function extractFirstTable(
  text: string,
): { headers: string[]; rows: string[][] } | null {
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    // Find a header row + separator pair
    const line = lines[i];
    if (isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      return { headers, rows };
    }
    i++;
  }
  return null;
}

function isTableRow(line: string | undefined): boolean {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  // Must have at least 2 pipes (so at least 1 cell)
  return (trimmed.match(/\|/g)?.length ?? 0) >= 2;
}

function isSeparatorRow(line: string | undefined): boolean {
  if (!line) return false;
  // Cells of only dashes / colons / spaces between pipes
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

/* ---- header recognition ---- */

const HEADER_KEYWORDS = [
  "name",
  "full name",
  "first",
  "last",
  "title",
  "role",
  "position",
  "company",
  "organization",
  "org",
  "email",
  "e-mail",
  "phone",
  "mobile",
  "cell",
  "linkedin",
  "location",
  "city",
  "state",
  "region",
  "country",
  "department",
  "seniority",
  "level",
  "website",
];

function isLeadHeader(h: string): boolean {
  const lo = h.toLowerCase();
  return HEADER_KEYWORDS.some((kw) => lo.includes(kw));
}

type Handler = (lead: Partial<Lead>, value: string) => void;

function matchHeader(headerRaw: string): Handler | null {
  const h = headerRaw.toLowerCase().trim();

  // Email
  if (/(^|[^a-z])e-?mail([^a-z]|$)/.test(h)) {
    if (h.includes("status")) {
      return (l, v) => {
        l.contactProfessionalEmailStatus = normalizeEmailStatus(v);
      };
    }
    return (l, v) => {
      l.contactProfessionalEmail = v;
      l.contactProfessionalEmailStatus =
        l.contactProfessionalEmailStatus ?? guessEmailStatus(v);
    };
  }

  // Phone / mobile
  if (/\bmobile\b/.test(h) || /\bcell\b/.test(h)) {
    return (l, v) => {
      l.contactMobilePhone = v;
    };
  }
  if (/\bphone\b/.test(h)) {
    return (l, v) => {
      l.contactMobilePhone = l.contactMobilePhone || v;
      l.contactPhoneNumbers = [...(l.contactPhoneNumbers ?? []), v];
    };
  }

  // LinkedIn (prospect vs company)
  if (/linkedin/.test(h)) {
    if (h.includes("company") || h.includes("org")) {
      return (l, v) => {
        l.prospectCompanyLinkedin = v;
      };
    }
    return (l, v) => {
      l.prospectLinkedin = v;
    };
  }

  // Name variants
  if (/\bfull\s*name\b/.test(h) || (h === "name")) {
    return (l, v) => {
      l.prospectFullName = v;
      if (!l.prospectFirstName || !l.prospectLastName) {
        const parts = v.split(/\s+/);
        l.prospectFirstName = l.prospectFirstName ?? parts[0] ?? "";
        l.prospectLastName =
          l.prospectLastName ?? parts.slice(1).join(" ") ?? "";
      }
    };
  }
  if (/\bfirst\b/.test(h)) {
    return (l, v) => {
      l.prospectFirstName = v;
    };
  }
  if (/\blast\b/.test(h)) {
    return (l, v) => {
      l.prospectLastName = v;
    };
  }

  // Title / role / seniority / department
  if (/\bseniority\b|\blevel\b/.test(h)) {
    return (l, v) => {
      l.prospectJobSeniorityLevel = v;
    };
  }
  if (/\bdepartment\b|\bdept\b/.test(h)) {
    return (l, v) => {
      l.prospectJobDepartment = v;
    };
  }
  if (/\b(title|role|position)\b/.test(h)) {
    return (l, v) => {
      l.prospectJobTitle = v;
    };
  }

  // Company / website
  if (/\bwebsite\b|\bdomain\b|\burl\b/.test(h)) {
    return (l, v) => {
      l.prospectCompanyWebsite = v;
    };
  }
  if (/\b(company|organization|org|employer)\b/.test(h)) {
    return (l, v) => {
      l.prospectCompanyName = v;
    };
  }

  // Location
  if (/\bcity\b/.test(h)) {
    return (l, v) => {
      l.prospectCity = v;
    };
  }
  if (/\b(state|region|province)\b/.test(h)) {
    return (l, v) => {
      l.prospectRegionName = v;
    };
  }
  if (/\bcountry\b/.test(h)) {
    return (l, v) => {
      l.prospectCountryName = v;
    };
  }
  if (/\blocation\b/.test(h)) {
    // Try to split "City, State, Country" or "City, State"
    return (l, v) => {
      const parts = v.split(/\s*,\s*/);
      if (parts.length >= 3) {
        l.prospectCity = l.prospectCity || parts[0];
        l.prospectRegionName = l.prospectRegionName || parts[1];
        l.prospectCountryName = l.prospectCountryName || parts.slice(2).join(", ");
      } else if (parts.length === 2) {
        l.prospectCity = l.prospectCity || parts[0];
        l.prospectRegionName = l.prospectRegionName || parts[1];
      } else {
        l.prospectCity = l.prospectCity || v;
      }
    };
  }

  // Skills / interests / experience / notes
  if (/\bskills?\b/.test(h)) {
    return (l, v) => {
      l.prospectSkills = v.split(/\s*[,;]\s*/).filter(Boolean);
    };
  }
  if (/\binterests?\b/.test(h)) {
    return (l, v) => {
      l.prospectInterests = v.split(/\s*[,;]\s*/).filter(Boolean);
    };
  }
  if (/\bexperience\b/.test(h)) {
    return (l, v) => {
      l.prospectExperience = v;
    };
  }
  if (/\bnotes?\b|\breason\b|\bwhy\b/.test(h)) {
    return (l, v) => {
      l.notes = v;
    };
  }

  return null;
}

function normalizeEmailStatus(v: string): LeadEmailStatus {
  const lo = v.toLowerCase();
  if (lo.includes("verified") || lo.includes("valid")) return "verified";
  if (lo.includes("guess") || lo.includes("inferred") || lo.includes("likely"))
    return "guessed";
  return "unverified";
}

function guessEmailStatus(email: string): LeadEmailStatus {
  return /@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email.trim()) ? "guessed" : "unverified";
}
