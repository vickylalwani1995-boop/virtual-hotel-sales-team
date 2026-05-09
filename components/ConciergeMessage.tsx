"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ConciergeBell, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { EmailQueueModal } from "@/components/EmailQueueModal";
import { hasEmailContent } from "@/lib/email-parser";

export function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex justify-end"
    >
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-mhsp-navy text-white px-4 py-2.5 text-[14px] leading-relaxed shadow-[0_2px_8px_-2px_rgba(15,76,129,0.25)]">
        {content}
      </div>
    </motion.div>
  );
}

export function AssistantMessage({
  content,
  streaming = false,
}: {
  content: string;
  streaming?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-start gap-2.5"
    >
      <div className="shrink-0 w-7 h-7 rounded-full bg-mhsp-gold flex items-center justify-center shadow-sm">
        <ConciergeBell className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-white border border-mhsp-line text-mhsp-text px-4 py-3 text-[14px] leading-relaxed shadow-[0_2px_8px_-2px_rgba(15,76,129,0.08)]">
        <div className="concierge-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...rest }) => {
                const url = href ?? "";
                if (url.startsWith("/agent/") || url.startsWith("/agents")) {
                  return (
                    <Link
                      href={url}
                      className="inline-flex items-center gap-1 mt-2 mr-1 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft px-3 py-1.5 text-[14px] font-semibold text-white no-underline transition-colors"
                    >
                      {children}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  );
                }
                return (
                  <a
                    href={url}
                    {...rest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mhsp-teal underline underline-offset-2"
                  >
                    {children}
                  </a>
                );
              },
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-mhsp-navy">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="bg-mhsp-cream-warm rounded px-1 py-0.5 text-[14px] font-mono text-mhsp-navy">
                  {children}
                </code>
              ),
              h1: ({ children }) => (
                <h3 className="font-display text-base font-semibold text-mhsp-navy mt-2 mb-1">
                  {children}
                </h3>
              ),
              h2: ({ children }) => (
                <h3 className="font-display text-base font-semibold text-mhsp-navy mt-2 mb-1">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="font-display text-sm font-semibold text-mhsp-navy mt-2 mb-1">
                  {children}
                </h4>
              ),
              table: ({ children }) => (
                <div className="my-2 overflow-x-auto rounded-lg border border-mhsp-line">
                  <table className="w-full border-collapse text-[14px]">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-mhsp-navy text-white">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="text-left font-semibold text-[14px] uppercase tracking-wider px-2 py-1.5">
                  {children}
                </th>
              ),
              tr: ({ children }) => (
                <tr className="even:bg-mhsp-cream-warm/30">{children}</tr>
              ),
              td: ({ children }) => (
                <td className="px-2 py-1.5 align-top">{children}</td>
              ),
            }}
          >
            {content || ""}
          </ReactMarkdown>
        </div>
        {streaming && (
          <span className="inline-block w-1 h-3.5 align-middle bg-mhsp-gold animate-pulse rounded-sm ml-0.5" />
        )}
        {!streaming && hasEmailContent(content) && (
          <div className="mt-3 pt-3 border-t border-mhsp-line/60">
            <EmailQueueModal agentId="concierge" output={content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-full bg-mhsp-gold flex items-center justify-center shadow-sm">
        <ConciergeBell className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white border border-mhsp-line px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce [animation-delay:-0.3s]" />
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce [animation-delay:-0.15s]" />
          <span className="block w-1.5 h-1.5 rounded-full bg-mhsp-gold animate-bounce" />
        </div>
      </div>
    </div>
  );
}
