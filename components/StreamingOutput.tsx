"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const TICK_MS = 14;
const CHARS_PER_TICK = 10;

const PROSE_CLASSES = [
  "prose max-w-none",
  // Body
  "prose-p:text-mhsp-text prose-p:leading-relaxed prose-p:text-[15px] prose-p:my-4",
  "prose-li:text-mhsp-text prose-li:leading-relaxed prose-li:text-[15px] prose-li:my-1.5",
  "prose-ul:my-4 prose-ol:my-4",
  // Headings
  "prose-headings:font-display prose-headings:text-mhsp-navy prose-headings:tracking-tight",
  "prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-2 prose-h1:font-bold",
  "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-semibold prose-h2:pb-2 prose-h2:border-b prose-h2:border-mhsp-line",
  "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold prose-h3:text-mhsp-navy",
  "prose-h4:text-base prose-h4:mt-5 prose-h4:mb-2 prose-h4:font-semibold prose-h4:text-mhsp-navy",
  // Strong
  "prose-strong:text-mhsp-navy prose-strong:font-semibold",
  // Links
  "prose-a:text-mhsp-teal prose-a:underline-offset-2 hover:prose-a:text-mhsp-navy",
  // Code
  "prose-code:text-mhsp-navy prose-code:bg-mhsp-cream-warm prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[14px] prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']",
  "prose-pre:bg-mhsp-cream-warm prose-pre:text-mhsp-text prose-pre:rounded-xl prose-pre:p-4 prose-pre:text-[14px]",
  // Blockquote
  "prose-blockquote:border-l-4 prose-blockquote:border-mhsp-gold prose-blockquote:bg-mhsp-cream-warm/40 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-mhsp-navy",
  // HR
  "prose-hr:border-mhsp-line prose-hr:my-8",
].join(" ");

export function StreamingOutput({
  output,
  animate = true,
}: {
  output: string;
  animate?: boolean;
}) {
  const [shown, setShown] = useState(animate ? "" : output);

  useEffect(() => {
    if (!animate) {
      setShown(output);
      return;
    }
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + CHARS_PER_TICK, output.length);
      setShown(output.slice(0, i));
      if (i >= output.length) clearInterval(id);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [output, animate]);

  return (
    <div className={PROSE_CLASSES}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-6 -mx-1 overflow-x-auto rounded-xl border border-mhsp-line shadow-[0_2px_10px_-4px_rgba(15,76,129,0.08)]">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-mhsp-navy text-white">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left font-semibold text-[14px] tracking-[0.12em] uppercase px-4 py-3 border-b border-mhsp-navy/20">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-mhsp-line">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="bg-white even:bg-mhsp-cream-warm/30 hover:bg-mhsp-gold/5 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-mhsp-text leading-relaxed">
              {children}
            </td>
          ),
        }}
      >
        {shown}
      </ReactMarkdown>
      {animate && shown.length < output.length && (
        <span className="inline-block w-1.5 h-4 align-middle bg-mhsp-gold animate-pulse rounded-sm ml-0.5" />
      )}
    </div>
  );
}
