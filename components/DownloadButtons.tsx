"use client";

import { Download } from "lucide-react";
import { downloadCsv, downloadExcel, downloadMarkdown } from "@/lib/download";

const BTN =
  "inline-flex items-center gap-1.5 rounded-lg border border-mhsp-line bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-cream-warm/40 px-3 py-1.5 text-xs font-semibold text-mhsp-navy transition-all";

export function DownloadButtons({
  output,
  basename,
  showExcel = false,
}: {
  output: string;
  basename: string;
  showExcel?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => downloadMarkdown(output, basename)} className={BTN}>
        <Download className="h-3.5 w-3.5" /> Markdown
      </button>
      <button onClick={() => downloadCsv(output, basename)} className={BTN}>
        <Download className="h-3.5 w-3.5" /> CSV
      </button>
      {showExcel && (
        <button onClick={() => downloadExcel(output, basename)} className={BTN}>
          <Download className="h-3.5 w-3.5" /> Excel
        </button>
      )}
    </div>
  );
}
