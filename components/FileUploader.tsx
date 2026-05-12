"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2, CheckCircle2 } from "lucide-react";
import { addFile, logWorkspaceActivity, addLeads, type WorkspaceLead } from "@/lib/workspace";

interface ProcessedFile {
  name: string;
  summary: string;
  category: string;
  leadCount?: number;
}

interface FileUploaderProps {
  agentId: string;
  agentName: string;
  disabled?: boolean;
}

export function FileUploader({ agentId, agentName, disabled }: FileUploaderProps) {
  const [status, setStatus] = useState<"idle" | "reading" | "processing" | "done" | "error">("idle");
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("reading");
    setErrorMsg("");

    try {
      const payload = await readFile(file);
      setStatus("processing");

      const res = await fetch("/api/file-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || guessType(file.name),
          ...payload,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Processing failed");
      }

      const data = await res.json();

      // Save file to workspace
      addFile({
        name: file.name,
        type: file.type,
        size: file.size,
        content: payload.content ?? "",
        uploadedInAgent: agentId,
        description: data.summary,
      });

      // If leads were extracted, add them
      let leadCount = 0;
      if (Array.isArray(data.leads) && data.leads.length > 0) {
        const leads = (data.leads as Partial<WorkspaceLead>[]).map((l) => ({
          name: l.name ?? "Unknown",
          title: l.title ?? "",
          company: l.company ?? "",
          email: l.email ?? "",
          phone: l.phone,
          industry: l.industry,
          source: "uploaded" as const,
          addedBy: agentName,
          funnel: "hustle" as const,
          status: "new" as const,
          notes: `Extracted from ${file.name}`,
        }));
        addLeads(leads, agentName);
        leadCount = leads.length;
      }

      logWorkspaceActivity(
        agentId,
        agentName,
        `uploaded "${file.name}"${leadCount > 0 ? ` — extracted ${leadCount} leads` : ""} — ${data.summary}`
      );

      setProcessedFile({ name: file.name, summary: data.summary, category: data.category, leadCount: leadCount || undefined });
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed");
      setStatus("error");
    }
  }

  async function readFile(file: File): Promise<{ content?: string; base64?: string }> {
    const isText =
      file.type === "text/csv" ||
      file.type === "text/plain" ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".txt");

    if (isText) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ content: reader.result as string });
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    // Binary files: send as base64 (XLSX, PDF, images)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({ base64: result.split(",")[1] ?? result });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function guessType(name: string): string {
    if (name.endsWith(".pdf")) return "application/pdf";
    if (name.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (name.endsWith(".csv")) return "text/csv";
    if (name.endsWith(".txt")) return "text/plain";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".png")) return "image/png";
    return "application/octet-stream";
  }

  function clear() {
    setStatus("idle");
    setProcessedFile(null);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (status === "done" && processedFile) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold max-w-[200px]">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {processedFile.name}
            {processedFile.leadCount ? ` · ${processedFile.leadCount} leads` : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-mhsp-muted hover:text-mhsp-navy transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (status === "reading" || status === "processing") {
    return (
      <button type="button" disabled className="shrink-0 p-2 text-mhsp-muted opacity-60" title={status === "reading" ? "Reading file…" : "Processing with AI…"}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv,.txt,.xlsx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        title="Upload file to team workspace (PDF, CSV, XLSX, TXT, image)"
        className="shrink-0 p-2 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-mhsp-cream-warm/50 disabled:opacity-40 transition-colors"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      {errorMsg && (
        <span className="text-[11px] text-red-500 truncate max-w-[120px]">
          {errorMsg}
        </span>
      )}
    </>
  );
}
