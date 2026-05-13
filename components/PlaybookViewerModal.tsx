"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  X,
  Copy,
  Download,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Crown,
  Check,
} from "lucide-react";
import type { Playbook } from "@/lib/playbooks";
import { PLAYBOOK_TO_AGENT } from "@/lib/playbooks";

type ViewTab = "markdown" | "rendered" | "sections";

const SECTION_TITLES = [
  "The Problem I Solve",
  "My Capabilities",
  "My Specialized Knowledge",
  "How I Work with the Team",
  "My Response Format",
  "My Tone & Voice",
  "Sample Conversations",
  "Hard Rules",
];

interface Props {
  playbook: Playbook;
  open: boolean;
  onClose: () => void;
}

export function PlaybookViewerModal({ playbook, open, onClose }: Props) {
  const router = useRouter();
  const [viewTab, setViewTab] = useState<ViewTab>("rendered");
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  if (!open) return null;

  const { metadata, content, sections } = playbook;
  const agentId = PLAYBOOK_TO_AGENT[metadata.agentId] || metadata.agentId;

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.agentId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleTestInChat() {
    onClose();
    router.push(`/agent/${agentId}`);
  }

  function toggleSection(idx: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const sectionContents = [
    sections.problem,
    Array.isArray(sections.capabilities) ? sections.capabilities.join("\n- ") : sections.capabilities,
    sections.knowledge,
    sections.teamWork,
    sections.responseFormat,
    sections.toneVoice,
    sections.sampleConversations,
    sections.hardRules,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F0F5FB] flex items-center justify-center">
                {metadata.isCaptain ? (
                  <Crown className="h-5 w-5 text-[#D4A853]" />
                ) : (
                  <span className="text-lg font-bold text-[#1B6EB7]">
                    {metadata.realName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-[#0F2547]">
                  {metadata.realName}
                </h2>
                <p className="text-sm text-[#6B7B8F]">
                  {metadata.designation}
                  <span className="ml-2 text-xs bg-[#0F4C81]/10 text-[#0F4C81] rounded-full px-2 py-0.5 font-medium">
                    {metadata.isCustom ? "Custom" : "Official"} · v{metadata.version}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-[#F4F6FA] flex items-center justify-center text-[#6B7B8F] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab switcher + Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 bg-[#F4F6FA] rounded-lg p-1">
              {(["rendered", "markdown", "sections"] as ViewTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setViewTab(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                    viewTab === t
                      ? "bg-white text-[#0F4C81] shadow-sm"
                      : "text-[#6B7B8F] hover:text-[#0F4C81]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] text-[#6B7B8F] hover:text-[#0F4C81] hover:border-[#1B6EB7]/30 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] text-[#6B7B8F] hover:text-[#0F4C81] hover:border-[#1B6EB7]/30 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Export .md
              </button>
              <button
                onClick={handleTestInChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0F4C81] text-white hover:bg-[#1B6EB7] transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Test in Chat
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Markdown (raw) Tab */}
          {viewTab === "markdown" && (
            <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
              <SyntaxHighlighter
                language="markdown"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  padding: "1.25rem",
                  fontSize: "0.8125rem",
                  lineHeight: "1.7",
                  background: "#FAFCFE",
                }}
                wrapLongLines
              >
                {content}
              </SyntaxHighlighter>
            </div>
          )}

          {/* Rendered Tab */}
          {viewTab === "rendered" && (
            <div className="prose prose-sm max-w-none prose-headings:text-[#0F2547] prose-headings:font-heading prose-p:text-[#3D4F5F] prose-li:text-[#3D4F5F] prose-strong:text-[#0F2547] prose-code:bg-[#F0F5FB] prose-code:text-[#0F4C81] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.replace(/^---[\s\S]*?---\n*/m, "")}
              </ReactMarkdown>
            </div>
          )}

          {/* Sections Tab */}
          {viewTab === "sections" && (
            <div className="space-y-2">
              {SECTION_TITLES.map((title, idx) => {
                const isExpanded = expandedSections.has(idx);
                const sectionContent = sectionContents[idx];
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E2E8F0] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#1B6EB7] shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#6B7B8F] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#1B6EB7] bg-[#F0F5FB] rounded-full px-2 py-0.5 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#0F2547]">
                        {title}
                      </span>
                    </button>
                    {isExpanded && sectionContent && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#E2E8F0]">
                        <div className="prose prose-sm max-w-none prose-p:text-[#3D4F5F] prose-li:text-[#3D4F5F]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {typeof sectionContent === "string" && sectionContent.startsWith("- ")
                              ? sectionContent
                              : sectionContent || "_No content_"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#E2E8F0] px-6 py-3 flex items-center justify-between bg-[#F8FAFC]">
          <button
            onClick={handleTestInChat}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B6EB7] hover:text-[#0F4C81] transition-colors"
          >
            <MessageSquare className="h-4 w-4" /> Test in Chat
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
          >
            <Download className="h-4 w-4" /> Download .md
          </button>
        </div>
      </div>
    </div>
  );
}
