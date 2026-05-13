"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Trash2,
  CheckSquare,
  Square,
  Mail,
  ArrowUpDown,
  Crosshair,
  Zap,
  Bot,
  PenLine,
} from "lucide-react";

function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import {
  ensureSeeded,
  filterLeads,
  getLeads,
  deleteLeads,
  type Lead,
  type LeadFilters,
  type LeadStatus,
  type LeadFunnel,
  type LeadSource,
  STATUS_LABEL,
  SOURCE_LABEL,
  FUNNEL_LABEL,
} from "@/lib/leads-vicky-v1";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";

type SortKey = "name" | "company" | "status" | "createdAt";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    funnel: "all",
    status: "all",
    source: "all",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Hydrate
  useEffect(() => {
    setLeads(ensureSeeded());
    setHydrated(true);
  }, []);

  // Refresh from storage (when other tabs/Phase 3 dialogs add leads)
  function refresh() {
    setLeads(getLeads());
    setSelected(new Set());
  }

  // Click outside Add menu
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!addMenuRef.current) return;
      if (!addMenuRef.current.contains(e.target as Node))
        setAddMenuOpen(false);
    }
    if (addMenuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [addMenuOpen]);

  const filtered = useMemo(() => {
    const out = filterLeads(leads, filters);
    const sorted = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.fullName.localeCompare(b.fullName);
      else if (sortBy === "company")
        cmp = (a.companyName || "").localeCompare(b.companyName || "");
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [leads, filters, sortBy, sortDir]);

  const stats = useMemo(() => {
    const calc = leads.filter((l) => l.funnel === "calculated").length;
    const hustle = leads.filter((l) => l.funnel === "hustle").length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const verified = leads.filter((l) => l.emailStatus === "verified").length;
    return { total: leads.length, calc, hustle, newCount, verified };
  }, [leads]);

  function toggleSelected(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  }

  function handleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    if (
      !confirm(`Delete ${selected.size} lead${selected.size === 1 ? "" : "s"}?`)
    )
      return;
    deleteLeads(Array.from(selected));
    refresh();
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Cross-version banner */}
      <div className="mb-6 rounded-xl border border-mhsp-line bg-mhsp-cream-warm/40 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-mhsp-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mhsp-gold/20 border border-mhsp-gold/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mhsp-navy mr-2">
            v1 prototype
          </span>
          Vicky&apos;s Phase 1 build — kept alongside the production Lead Manager
          for reference.
        </p>
        <Link
          href="/leads"
          className="text-xs font-semibold text-mhsp-navy hover:text-mhsp-gold transition-colors whitespace-nowrap"
        >
          → Open production Lead Manager
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Lead Manager · v1</p>
          <h1 className="font-display text-4xl text-mhsp-navy mt-2">
            Your prospects
          </h1>
          <p className="text-mhsp-muted mt-2">
            Pull live from Apollo or Vibe. Tag by funnel. Push to any CRM.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Leads dropdown */}
          <div ref={addMenuRef} className="relative">
            <button
              onClick={() => setAddMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-mhsp-navy hover:bg-mhsp-navy-soft px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(15,76,129,0.4)] transition-all"
            >
              <Plus className="h-4 w-4" /> Add leads
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  addMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {addMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-mhsp-line bg-white shadow-[0_12px_30px_-12px_rgba(15,76,129,0.25)] overflow-hidden z-30">
                <button
                  disabled
                  title="Wired in Phase 3"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-mhsp-cream-warm/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Crosshair className="h-5 w-5 text-mhsp-navy" />
                  <div>
                    <p className="text-sm font-semibold text-mhsp-navy">
                      Pull from Apollo
                    </p>
                    <p className="text-xs text-mhsp-muted">
                      Calculated funnel — big accounts
                    </p>
                  </div>
                </button>
                <button
                  disabled
                  title="Wired in Phase 3"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-mhsp-cream-warm/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-t border-mhsp-line/60"
                >
                  <Zap className="h-5 w-5 text-mhsp-teal" />
                  <div>
                    <p className="text-sm font-semibold text-mhsp-navy">
                      Pull from Vibe Prospecting
                    </p>
                    <p className="text-xs text-mhsp-muted">
                      Hustle funnel — backyard
                    </p>
                  </div>
                </button>
                <Link
                  href="/agent/02_lead_gen?profile=test"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-mhsp-cream-warm/40 transition-colors border-t border-mhsp-line/60"
                  onClick={() => setAddMenuOpen(false)}
                >
                  <Bot className="h-5 w-5 text-mhsp-navy" />
                  <div>
                    <p className="text-sm font-semibold text-mhsp-navy">
                      Generate via Agent
                    </p>
                    <p className="text-xs text-mhsp-muted">
                      Backyard Lead Hunter chat
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
          {/* Export */}
          <button
            disabled
            title="Wired in Phase 4"
            className="inline-flex items-center gap-2 rounded-lg border border-mhsp-line bg-white hover:border-mhsp-gold/60 hover:bg-mhsp-cream-warm/40 px-4 py-2.5 text-sm font-semibold text-mhsp-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> Export leads
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={stats.total} accent="navy" />
        <Stat label="Calculated" value={stats.calc} accent="navy" icon={Crosshair} />
        <Stat label="Hustle" value={stats.hustle} accent="teal" icon={Zap} />
        <Stat label="New" value={stats.newCount} accent="gold" />
        <Stat label="Verified emails" value={stats.verified} accent="success" />
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-mhsp-line p-4 mb-4 flex flex-wrap items-center gap-2 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.06)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            placeholder="Search name, title, company, email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-mhsp-line text-sm placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 focus:border-mhsp-gold/50"
          />
        </div>
        <FilterSelect
          value={filters.funnel ?? "all"}
          onChange={(v) =>
            setFilters({ ...filters, funnel: v as LeadFunnel | "all" })
          }
          options={[
            { value: "all", label: "All funnels" },
            { value: "calculated", label: "Calculated" },
            { value: "hustle", label: "Hustle" },
          ]}
        />
        <FilterSelect
          value={filters.status ?? "all"}
          onChange={(v) =>
            setFilters({ ...filters, status: v as LeadStatus | "all" })
          }
          options={[
            { value: "all", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "contacted", label: "Contacted" },
            { value: "replied", label: "Replied" },
            { value: "qualified", label: "Qualified" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <FilterSelect
          value={filters.source ?? "all"}
          onChange={(v) =>
            setFilters({ ...filters, source: v as LeadSource | "all" })
          }
          options={[
            { value: "all", label: "All sources" },
            { value: "apollo", label: "Apollo" },
            { value: "vibe", label: "Vibe" },
            { value: "agent", label: "Agent" },
            { value: "manual", label: "Manual" },
          ]}
        />
      </div>

      {/* Bulk action bar (only when something selected) */}
      {selected.size > 0 && (
        <div className="bg-mhsp-navy text-white rounded-2xl px-5 py-3 mb-4 flex items-center justify-between gap-3 shadow-[0_4px_14px_-4px_rgba(15,76,129,0.4)]">
          <p className="text-sm font-medium">
            <span className="font-numeric font-bold">{selected.size}</span>{" "}
            selected
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Phase 6"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-3.5 w-3.5" /> Schedule sequence
            </button>
            <button
              disabled
              title="Phase 4"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" /> Export selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-500/30 hover:bg-red-500/50 border border-red-300/40 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-white/70 hover:text-white text-xs font-medium ml-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!hydrated ? (
        <p className="text-mhsp-muted text-sm py-10 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState totalCount={leads.length} />
      ) : (
        <div className="bg-white rounded-2xl border border-mhsp-line overflow-hidden shadow-[0_2px_10px_-4px_rgba(15,76,129,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-mhsp-navy text-white">
                <tr>
                  <th className="text-left px-3 py-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-white/80 hover:text-white"
                      aria-label="Select all"
                    >
                      {selected.size === filtered.length &&
                      filtered.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <SortableTh
                    label="Lead"
                    active={sortBy === "name"}
                    dir={sortDir}
                    onClick={() => handleSort("name")}
                  />
                  <SortableTh
                    label="Company"
                    active={sortBy === "company"}
                    dir={sortDir}
                    onClick={() => handleSort("company")}
                  />
                  <th className="text-left px-3 py-3 font-semibold text-[11px] tracking-wider uppercase">
                    Funnel
                  </th>
                  <SortableTh
                    label="Status"
                    active={sortBy === "status"}
                    dir={sortDir}
                    onClick={() => handleSort("status")}
                  />
                  <th className="text-left px-3 py-3 font-semibold text-[11px] tracking-wider uppercase">
                    Source
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-[11px] tracking-wider uppercase">
                    Contact
                  </th>
                  <th className="text-right px-3 py-3 font-semibold text-[11px] tracking-wider uppercase">
                    Est. RNs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mhsp-line">
                {filtered.map((lead) => {
                  const isSel = selected.has(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`group cursor-pointer transition-colors ${
                        isSel ? "bg-mhsp-gold/5" : "hover:bg-mhsp-cream-warm/30"
                      }`}
                      onClick={() => setActiveLead(lead)}
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelected(lead.id);
                        }}
                      >
                        {isSel ? (
                          <CheckSquare className="h-4 w-4 text-mhsp-gold" />
                        ) : (
                          <Square className="h-4 w-4 text-mhsp-muted" />
                        )}
                      </td>
                      <td className="px-3 py-3 min-w-[200px]">
                        <div className="font-semibold text-mhsp-navy leading-tight">
                          {lead.fullName}
                        </div>
                        <div className="text-xs text-mhsp-muted truncate max-w-[260px]">
                          {lead.title}
                        </div>
                      </td>
                      <td className="px-3 py-3 min-w-[180px]">
                        <div className="text-mhsp-text leading-tight">
                          {lead.companyName}
                        </div>
                        {lead.location && (
                          <div className="text-xs text-mhsp-muted">
                            {lead.location}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5 ${
                            lead.funnel === "calculated"
                              ? "bg-mhsp-navy/8 text-mhsp-navy border-mhsp-navy/20"
                              : "bg-mhsp-teal/12 text-mhsp-teal border-mhsp-teal/30"
                          }`}
                        >
                          {FUNNEL_LABEL[lead.funnel]}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5 ${
                            STATUS_LABEL[lead.status].color
                          }`}
                        >
                          {STATUS_LABEL[lead.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-mhsp-muted">
                        {SOURCE_LABEL[lead.source]}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 text-mhsp-muted">
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-mhsp-navy"
                              title={lead.email}
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {lead.linkedinUrl && (
                            <a
                              href={lead.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-mhsp-navy"
                              title="LinkedIn"
                            >
                              <LinkedinIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-numeric text-sm text-mhsp-navy whitespace-nowrap">
                        {lead.estAnnualRoomNights
                          ? lead.estAnnualRoomNights.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-mhsp-line text-xs text-mhsp-muted bg-mhsp-cream-warm/30 flex items-center justify-between">
            <span>
              Showing {filtered.length} of {leads.length} leads
            </span>
            <span className="font-numeric">
              Sorted by {sortBy} ({sortDir})
            </span>
          </div>
        </div>
      )}

      {/* Side drawer */}
      <LeadDetailDrawer lead={activeLead} onClose={() => setActiveLead(null)} />
    </main>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className="text-left px-3 py-3 font-semibold text-[11px] tracking-wider uppercase cursor-pointer select-none hover:bg-white/5 transition-colors"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-3 w-3 transition-opacity ${
            active ? "opacity-100" : "opacity-30"
          } ${active && dir === "asc" ? "rotate-180" : ""}`}
        />
      </span>
    </th>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm font-medium rounded-lg px-3 py-2 border border-mhsp-line bg-white text-mhsp-navy hover:border-mhsp-gold/50 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 transition-all cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Stat({
  label,
  value,
  accent,
  icon: IconComp,
}: {
  label: string;
  value: number;
  accent: "navy" | "gold" | "teal" | "success";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const accentClass = {
    navy: "text-mhsp-navy",
    gold: "text-mhsp-gold",
    teal: "text-mhsp-teal",
    success: "text-mhsp-success",
  }[accent];
  return (
    <div className="bg-white rounded-2xl border border-mhsp-line p-3 shadow-[0_2px_10px_-4px_rgba(15,76,129,0.06)]">
      <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-mhsp-muted flex items-center gap-1">
        {IconComp && <IconComp className="h-3 w-3" />}
        {label}
      </p>
      <p className={`font-numeric text-2xl font-bold mt-0.5 ${accentClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function EmptyState({ totalCount }: { totalCount: number }) {
  return (
    <div className="bg-white border border-mhsp-line border-dashed rounded-2xl p-12 text-center">
      <Crosshair className="h-12 w-12 mb-3 opacity-40 text-mhsp-navy mx-auto" />
      <h3 className="font-display text-xl text-mhsp-navy">
        {totalCount === 0
          ? "No leads yet"
          : "No leads match these filters"}
      </h3>
      <p className="text-sm text-mhsp-muted mt-2 max-w-md mx-auto">
        {totalCount === 0
          ? "Pull live prospects from Apollo or Vibe Prospecting, or generate them via the Backyard Lead Hunter agent."
          : "Try clearing the search or changing a filter."}
      </p>
    </div>
  );
}
