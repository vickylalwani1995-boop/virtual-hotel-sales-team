import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";
import { resolveApiKey } from "@/lib/api-key";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, content, base64 } = body as {
      fileName: string;
      fileType: string;
      content?: string;
      base64?: string;
    };

    const apiKey = await resolveApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API key not set" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });
    let textContent: string | undefined = content;

    // XLSX: parse server-side with xlsx
    if (
      base64 &&
      (fileType.includes("spreadsheet") || fileName.endsWith(".xlsx"))
    ) {
      const buffer = Buffer.from(base64, "base64");
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      textContent = XLSX.utils.sheet_to_csv(sheet);
    }

    const EXTRACTION_PROMPT = `You are processing a file uploaded to a hotel sales workspace.
File name: "${fileName}"

Extract the following:
1. A 2-sentence summary of what this file contains.
2. File category — one of: leads | rfp | rate-sheet | str-report | contract | other
3. If the file contains leads (names + companies + contact info), extract up to 25 as a JSON array with these fields: name, title, company, email, phone (optional), industry (optional).
4. If it's an STR report or rate sheet, extract key metrics as an object.

Respond ONLY as valid JSON:
{
  "summary": "...",
  "category": "leads|rfp|rate-sheet|str-report|contract|other",
  "leads": [...] or null,
  "keyMetrics": {...} or null
}`;

    let messages: Anthropic.MessageParam[];

    if (base64 && fileType === "application/pdf") {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            } as Anthropic.DocumentBlockParam,
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ];
    } else if (base64 && fileType.startsWith("image/")) {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: fileType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ];
    } else if (textContent) {
      messages = [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\nFile content:\n\`\`\`\n${textContent.slice(0, 8000)}\n\`\`\``,
        },
      ];
    } else {
      return NextResponse.json({ error: "No processable content" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages,
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: {
      summary?: string;
      category?: string;
      leads?: unknown[];
      keyMetrics?: unknown;
    };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    } catch {
      parsed = {};
    }

    return NextResponse.json({
      success: true,
      summary: parsed.summary ?? "File added to workspace.",
      category: parsed.category ?? "other",
      leads: parsed.leads ?? null,
      keyMetrics: parsed.keyMetrics ?? null,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
