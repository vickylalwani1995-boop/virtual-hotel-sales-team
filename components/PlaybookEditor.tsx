"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Play,
  Download,
  Trash2,
  Eye,
  Code,
  MessageSquare,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import {
  type Playbook,
  type PlaybookMetadata,
  type PlaybookSections,
  validatePlaybook,
  generatePlaybookMarkdown,
  saveCustomPlaybook,
  deleteCustomPlaybook,
  isDefaultPlaybook,
  createBlankPlaybook,
  VOICE_PRESETS,
  CAPABILITY_REGISTRY,
} from "@/lib/playbooks";

type PreviewTab = "markdown" | "card";

interface Props {
  playbook: Playbook;
  isNew?: boolean;
}

export function PlaybookEditor({ playbook: initial, isNew }: Props) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<PlaybookMetadata>(initial.metadata);
  const [sections, setSections] = useState<PlaybookSections>(initial.sections);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("card");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const readOnly = isDefaultPlaybook(metadata.agentId) && !isNew;

  const playbook: Playbook = {
    metadata,
    sections,
    content: generatePlaybookMarkdown({ metadata, sections, content: "" }),
  };

  function updateMeta<K extends keyof PlaybookMetadata>(
    key: K,
    value: PlaybookMetadata[K]
  ) {
    setMetadata((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateSection<K extends keyof PlaybookSections>(
    key: K,
    value: PlaybookSections[K]
  ) {
    setSections((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave(status: "draft" | "active") {
    const pb: Playbook = {
      metadata: { ...metadata, status, isCustom: true },
      sections,
      content: generatePlaybookMarkdown({
        metadata: { ...metadata, status, isCustom: true },
        sections,
        content: "",
      }),
    };

    const validation = validatePlaybook(pb);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    saveCustomPlaybook(pb);
    setSaved(true);
    setErrors([]);
    if (status === "active") {
      router.push("/playbooks");
    }
  }

  function handleExport() {
    const md = generatePlaybookMarkdown(playbook);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.agentId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete() {
    if (!confirm("Delete this playbook permanently?")) return;
    deleteCustomPlaybook(metadata.agentId);
    router.push("/playbooks");
  }

  function toggleCapability(cap: string) {
    const current = metadata.capabilities || [];
    const next = current.includes(cap)
      ? current.filter((c) => c !== cap)
      : [...current, cap];
    updateMeta("capabilities", next);
  }

  function addCustomCapability() {
    const cap = prompt("Enter custom capability name:");
    if (cap) {
      const normalized = cap.toLowerCase().replace(/\s+/g, "_");
      const current = metadata.capabilities || [];
      if (!current.includes(normalized)) {
        updateMeta("capabilities", [...current, normalized]);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/playbooks")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Studio
          </button>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <>
                <button
                  onClick={() => handleSave("draft")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F4C81] hover:bg-[#F0F5FB] transition-colors"
                >
                  <Save className="h-3.5 w-3.5" /> Save Draft
                </button>
                <button
                  onClick={() => handleSave("active")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F4C81] hover:bg-[#1B6EB7] px-3 py-2 text-xs font-bold text-white transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Publish to Workspace
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#6B7B8F] hover:text-[#0F4C81] transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export .md
            </button>
            {!readOnly && !isNew && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-bold text-red-700 mb-1">Validation errors:</p>
            <ul className="list-disc pl-5 text-sm text-red-600">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {saved && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm font-medium text-emerald-700">
            Playbook saved successfully!
          </div>
        </div>
      )}

      {/* Read-only banner */}
      {readOnly && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="rounded-lg bg-[#F0F5FB] border border-[#1B6EB7]/20 p-3 text-sm font-medium text-[#0F4C81]">
            This is an official playbook and is read-only. Duplicate it to create your own version.
          </div>
        </div>
      )}

      {/* Two-Pane Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-6">
            {/* Section 1: Basics */}
            <FormSection title="Agent Basics" number={0}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Agent Name" required>
                  <input
                    value={metadata.realName}
                    onChange={(e) => updateMeta("realName", e.target.value)}
                    disabled={readOnly}
                    placeholder="e.g. Donna Marie"
                    className="input-field"
                  />
                </Field>
                <Field label="Designation" required>
                  <input
                    value={metadata.designation}
                    onChange={(e) => updateMeta("designation", e.target.value)}
                    disabled={readOnly}
                    placeholder="e.g. Director of Sales"
                    className="input-field"
                  />
                </Field>
                <Field label="Funnel">
                  <select
                    value={metadata.funnel}
                    onChange={(e) =>
                      updateMeta(
                        "funnel",
                        e.target.value as "calculated" | "hustle" | "custom"
                      )
                    }
                    disabled={readOnly}
                    className="input-field"
                  >
                    <option value="calculated">Calculated Funnel</option>
                    <option value="hustle">Hustle Funnel</option>
                    <option value="custom">Custom</option>
                  </select>
                </Field>
                <Field label="Voice">
                  <select
                    value={metadata.voice}
                    onChange={(e) => updateMeta("voice", e.target.value)}
                    disabled={readOnly}
                    className="input-field"
                  >
                    {VOICE_PRESETS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Photo URL">
                  <input
                    value={metadata.photo}
                    onChange={(e) => updateMeta("photo", e.target.value)}
                    disabled={readOnly}
                    placeholder="https://..."
                    className="input-field"
                  />
                </Field>
                <Field label="Agent ID">
                  <input
                    value={metadata.agentId}
                    onChange={(e) => updateMeta("agentId", e.target.value)}
                    disabled={readOnly || !isNew}
                    placeholder="e.g. spa_closer_v1"
                    className="input-field"
                  />
                </Field>
              </div>
            </FormSection>

            {/* Section 2: Problem */}
            <FormSection title="The Problem I Solve" number={1}>
              <textarea
                value={sections.problem}
                onChange={(e) => updateSection("problem", e.target.value)}
                disabled={readOnly}
                rows={4}
                placeholder="What user problem does this agent fix?"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 3: Capabilities */}
            <FormSection title="Capabilities" number={2}>
              <div className="flex flex-wrap gap-2 mb-3">
                {CAPABILITY_REGISTRY.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => !readOnly && toggleCapability(cap)}
                    disabled={readOnly}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all ${
                      (metadata.capabilities || []).includes(cap)
                        ? "bg-[#1B6EB7] text-white border-[#1B6EB7]"
                        : "bg-white text-[#6B7B8F] border-[#E2E8F0] hover:border-[#1B6EB7]/40"
                    }`}
                  >
                    {cap.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              {!readOnly && (
                <button
                  onClick={addCustomCapability}
                  className="text-xs font-semibold text-[#1B6EB7] hover:underline"
                >
                  + Add Custom Capability
                </button>
              )}
              <textarea
                value={sections.capabilities.join("\n")}
                onChange={(e) =>
                  updateSection(
                    "capabilities",
                    e.target.value.split("\n").filter(Boolean)
                  )
                }
                disabled={readOnly}
                rows={4}
                placeholder="One capability per line (human-readable descriptions)"
                className="input-field resize-y mt-3"
              />
            </FormSection>

            {/* Section 4: Knowledge */}
            <FormSection title="Specialized Knowledge" number={3}>
              <textarea
                value={sections.knowledge}
                onChange={(e) => updateSection("knowledge", e.target.value)}
                disabled={readOnly}
                rows={6}
                placeholder="What domain knowledge does this agent bring?"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 5: Team Work */}
            <FormSection title="How I Work with the Team" number={4}>
              <textarea
                value={sections.teamWork}
                onChange={(e) => updateSection("teamWork", e.target.value)}
                disabled={readOnly}
                rows={5}
                placeholder="How does this agent collaborate with teammates?"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 6: Response Format */}
            <FormSection title="Response Format" number={5}>
              <textarea
                value={sections.responseFormat}
                onChange={(e) => updateSection("responseFormat", e.target.value)}
                disabled={readOnly}
                rows={5}
                placeholder="How should this agent structure outputs?"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 7: Tone & Voice */}
            <FormSection title="Tone & Voice" number={6}>
              <textarea
                value={sections.toneVoice}
                onChange={(e) => updateSection("toneVoice", e.target.value)}
                disabled={readOnly}
                rows={4}
                placeholder="Describe the personality and communication style"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 8: Sample Conversations */}
            <FormSection title="Sample Conversations" number={7}>
              <textarea
                value={sections.sampleConversations}
                onChange={(e) =>
                  updateSection("sampleConversations", e.target.value)
                }
                disabled={readOnly}
                rows={8}
                placeholder="2-3 example User → Agent exchanges"
                className="input-field resize-y"
              />
            </FormSection>

            {/* Section 9: Hard Rules */}
            <FormSection title="Hard Rules" number={8}>
              <textarea
                value={sections.hardRules}
                onChange={(e) => updateSection("hardRules", e.target.value)}
                disabled={readOnly}
                rows={5}
                placeholder="What should this agent NEVER do? What must it ALWAYS do?"
                className="input-field resize-y"
              />
            </FormSection>
          </div>

          {/* RIGHT: Preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm">
              {/* Preview tabs */}
              <div className="flex items-center border-b border-[#E2E8F0] bg-[#FAFBFC]">
                <button
                  onClick={() => setPreviewTab("card")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors ${
                    previewTab === "card"
                      ? "text-[#0F4C81] border-b-2 border-[#1B6EB7]"
                      : "text-[#6B7B8F]"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Agent Card
                </button>
                <button
                  onClick={() => setPreviewTab("markdown")}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors ${
                    previewTab === "markdown"
                      ? "text-[#0F4C81] border-b-2 border-[#1B6EB7]"
                      : "text-[#6B7B8F]"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" /> Markdown
                </button>
              </div>

              <div className="p-5">
                {previewTab === "card" && (
                  <AgentCardPreview metadata={metadata} sections={sections} />
                )}
                {previewTab === "markdown" && (
                  <pre className="text-xs text-[#374151] font-mono whitespace-pre-wrap max-h-[70vh] overflow-y-auto leading-relaxed">
                    {generatePlaybookMarkdown(playbook)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #0f2547;
          background: white;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: #1b6eb7;
          box-shadow: 0 0 0 2px rgba(27, 110, 183, 0.1);
        }
        .input-field:disabled {
          opacity: 0.7;
          background: #f9fafb;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormSection({
  title,
  number,
  children,
}: {
  title: string;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] p-5">
      <div className="flex items-center gap-2 mb-4">
        {number > 0 && (
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#F0F5FB] text-[10px] font-bold text-[#1B6EB7]">
            {number}
          </span>
        )}
        <h3 className="text-sm font-bold text-[#0F2547]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B7B8F] mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function AgentCardPreview({
  metadata,
  sections,
}: {
  metadata: PlaybookMetadata;
  sections: PlaybookSections;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] p-5 bg-[#FAFBFC]">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C5D8EE] to-[#E2E8F0] flex items-center justify-center">
          <span className="text-lg font-bold text-[#0F4C81]/40">
            {metadata.realName?.[0] || "?"}
          </span>
        </div>
        <div>
          <p className="font-heading font-bold text-[#0F2547] text-lg leading-tight">
            {metadata.realName || "Agent Name"}
          </p>
          <p className="text-sm font-medium text-[#1B6EB7]">
            {metadata.designation || "Designation"}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#6B7B8F] mb-3">
        {sections.problem
          ? sections.problem.slice(0, 120) +
            (sections.problem.length > 120 ? "..." : "")
          : "No problem statement defined yet."}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(metadata.capabilities || []).slice(0, 4).map((cap) => (
          <span
            key={cap}
            className="text-[10px] font-medium bg-[#F0F5FB] text-[#0F4C81]/70 rounded-full px-2 py-0.5"
          >
            {cap.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[#6B7B8F]">
        <span className="font-semibold uppercase tracking-wider">
          {metadata.funnel} funnel
        </span>
        <span>·</span>
        <span>{metadata.status}</span>
        <span>·</span>
        <span>v{metadata.version}</span>
      </div>
    </div>
  );
}
