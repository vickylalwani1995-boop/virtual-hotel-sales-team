import * as XLSX from "xlsx";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  triggerBlobDownload(blob, filename.endsWith(".md") ? filename : `${filename}.md`);
}

// Parse the first GFM-style markdown table found in the content into rows.
export function extractMarkdownTable(md: string): string[][] | null {
  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      const sep = lines[i + 1]?.trim() ?? "";
      if (/^\|?\s*:?-{2,}.*\|/.test(sep)) {
        const rows: string[][] = [];
        const headerCells = splitRow(line);
        rows.push(headerCells);
        let j = i + 2;
        while (
          j < lines.length &&
          lines[j].trim().startsWith("|") &&
          lines[j].trim().endsWith("|")
        ) {
          rows.push(splitRow(lines[j].trim()));
          j++;
        }
        return rows;
      }
    }
    i++;
  }
  return null;
}

function splitRow(line: string): string[] {
  const trimmed = line.replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

function rowsToCsv(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          if (/[",\n]/.test(cell)) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    )
    .join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const table = extractMarkdownTable(content);
  let csv: string;
  if (table) {
    csv = rowsToCsv(table);
  } else {
    csv = rowsToCsv([["content"], [content]]);
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerBlobDownload(
    blob,
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
}

export function downloadExcel(content: string, filename: string) {
  const table = extractMarkdownTable(content);
  const wb = XLSX.utils.book_new();
  let ws: XLSX.WorkSheet;
  if (table) {
    ws = XLSX.utils.aoa_to_sheet(table);
  } else {
    ws = XLSX.utils.aoa_to_sheet([["content"], [content]]);
  }
  XLSX.utils.book_append_sheet(wb, ws, "Output");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(
    blob,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
  );
}
