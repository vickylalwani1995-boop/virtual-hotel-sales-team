export type ParsedEmail = {
  to: string;
  subject: string;
  body: string;
};

const DEFAULT_SUBJECT = "Hotel Partnership Opportunity";
const DEFAULT_TO = "client@example.com";

export function parseEmailFromMarkdown(text: string): ParsedEmail {
  const subjectMatch = text.match(
    /(?:^|\n)\s*(?:\*\*)?Subject(?:\*\*)?\s*:\s*(.+)/i,
  );
  const rawSubject = subjectMatch?.[1]?.trim() ?? "";
  const subject = rawSubject.replace(/^["*]+|["*]+$/g, "") || DEFAULT_SUBJECT;

  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  const to = emailMatch?.[0] ?? DEFAULT_TO;

  let body = text;
  if (subjectMatch) {
    const idx = text.indexOf(subjectMatch[0]);
    body = text.substring(idx + subjectMatch[0].length).trim();
  }

  return { to, subject, body };
}

export function hasEmailContent(text: string): boolean {
  return /(?:^|\n)\s*(?:\*\*)?Subject(?:\*\*)?\s*:/i.test(text);
}
