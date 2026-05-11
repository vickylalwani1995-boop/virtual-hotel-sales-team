"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  X,
  Sparkles,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Cloud,
  Users,
  Filter as FilterIcon,
  AlertTriangle,
  StickyNote,
  Send,
} from "lucide-react";
import {
  addLeads,
  deleteLeads,
  downloadBlob,
  exportLeadsAsCSV,
  exportLeadsAsExcel,
  getAllLeads,
  updateLead,
  type Lead,
  type LeadEmailStatus,
  type LeadFunnel,
  type LeadSource,
  type LeadStatus,
} from "@/lib/leads";
import { AGENTS } from "@/lib/agents";

/** Inline LinkedIn glyph — lucide-react removed brand icons. */
function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const PAGE_SIZE = 50;

type SortKey =
  | "createdAt"
  | "prospectFullName"
  | "prospectJobTitle"
  | "prospectCompanyName"
  | "contactProfessionalEmail"
  | "status";
type SortDir = "asc" | "desc";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  qualified: "Qualified",
  closed: "Closed",
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-[#EAF2FA] text-[#0F4C81] border-[#C9DAEB]",
  contacted: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
  replied: "bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]",
  qualified: "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30",
  closed: "bg-[#F3F4F6] text-mhsp-muted border-[#E5E7EB]",
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  apollo: "Apollo",
  vibe: "Vibe",
  agent_generated: "Lead Gen Agent",
  manual: "Manual",
};

const FUNNEL_LABELS: Record<LeadFunnel, string> = {
  calculated: "🎯 Calculated",
  hustle: "⚡ Hustle",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | LeadSource>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [funnelFilter, setFunnelFilter] = useState<"all" | LeadFunnel>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  // load + subscribe to leads changes
  useEffect(() => {
    const sync = () => setLeads(getAllLeads());
    sync();
    setHydrated(true);
    window.addEventListener("vhst-leads-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vhst-leads-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /* --------- KPIs --------- */
  const stats = useMemo(() => {
    const total = leads.length;
    const oneWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newWeek = leads.filter(
      (l) => new Date(l.createdAt).getTime() >= oneWeek,
    ).length;
    const verified = leads.filter(
      (l) => l.contactProfessionalEmailStatus === "verified",
    ).length;
    const calc = leads.filter((l) => l.funnel === "calculated").length;
    const hustle = leads.filter((l) => l.funnel === "hustle").length;
    return { total, newWeek, verified, calc, hustle };
  }, [leads]);

  /* --------- filtering + sorting --------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (funnelFilter !== "all" && l.funnel !== funnelFilter) return false;
      if (agentFilter !== "all" && l.agentId !== agentFilter) return false;
      if (q) {
        const hay = (
          l.prospectFullName +
          " " +
          l.prospectJobTitle +
          " " +
          l.prospectCompanyName +
          " " +
          l.contactProfessionalEmail +
          " " +
          l.prospectCity +
          " " +
          l.prospectRegionName +
          " " +
          l.prospectCountryName +
          " " +
          l.notes
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      const av = (a[sortKey] as string) ?? "";
      const bv = (b[sortKey] as string) ?? "";
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [
    leads,
    search,
    sourceFilter,
    statusFilter,
    funnelFilter,
    agentFilter,
    sortKey,
    sortDir,
  ]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, sourceFilter, statusFilter, funnelFilter, agentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* --------- selection --------- */
  const allOnPageSelected =
    paged.length > 0 && paged.every((l) => selected.has(l.id));
  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const l of paged) next.delete(l.id);
      } else {
        for (const l of paged) next.add(l.id);
      }
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* --------- actions --------- */
  function handleResetFilters() {
    setSearch("");
    setSourceFilter("all");
    setStatusFilter("all");
    setFunnelFilter("all");
    setAgentFilter("all");
    setPage(1);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleExportCSV(scope: "selected" | "all") {
    const items =
      scope === "selected"
        ? leads.filter((l) => selected.has(l.id))
        : filtered;
    if (items.length === 0) {
      toast.error("No leads to export.");
      return;
    }
    const csv = exportLeadsAsCSV(items);
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `leads-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    toast.success(`Exported ${items.length} leads as CSV.`);
  }

  function handleExportExcel(scope: "selected" | "all") {
    const items =
      scope === "selected"
        ? leads.filter((l) => selected.has(l.id))
        : filtered;
    if (items.length === 0) {
      toast.error("No leads to export.");
      return;
    }
    const blob = exportLeadsAsExcel(items);
    downloadBlob(blob, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${items.length} leads as Excel.`);
  }

  function handleBulkMarkContacted() {
    if (selected.size === 0) return;
    for (const id of selected) updateLead(id, { status: "contacted" });
    setLeads(getAllLeads());
    setSelected(new Set());
    toast.success(`Marked ${selected.size} leads as contacted.`);
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    const n = selected.size;
    deleteLeads([...selected]);
    setLeads(getAllLeads());
    setSelected(new Set());
    toast.success(`Deleted ${n} leads.`);
  }

  function handleAddDemoLeads() {
    const demo: Partial<Lead>[] = [
      {
        prospectFullName: "Jordan Reyes",
        prospectFirstName: "Jordan",
        prospectLastName: "Reyes",
        prospectJobTitle: "Director of Corporate Travel",
        prospectJobSeniorityLevel: "Director",
        prospectJobDepartment: "Travel & Procurement",
        prospectCompanyName: "Texas Health Resources",
        prospectCompanyWebsite: "texashealth.org",
        prospectCity: "Dallas",
        prospectRegionName: "Texas",
        prospectCountryName: "USA",
        contactProfessionalEmail: "jordan.reyes@texashealth.org",
        contactProfessionalEmailStatus: "verified",
        contactMobilePhone: "+1 469 555 0142",
        funnel: "calculated",
        source: "manual",
      },
      {
        prospectFullName: "Priya Shah",
        prospectFirstName: "Priya",
        prospectLastName: "Shah",
        prospectJobTitle: "Events Manager",
        prospectJobSeniorityLevel: "Manager",
        prospectJobDepartment: "Marketing",
        prospectCompanyName: "Lone Star Construction Group",
        prospectCity: "Fort Worth",
        prospectRegionName: "Texas",
        prospectCountryName: "USA",
        contactProfessionalEmail: "p.shah@lonestarcg.com",
        contactProfessionalEmailStatus: "guessed",
        funnel: "hustle",
        source: "manual",
      },
      {
        prospectFullName: "Marcus Bell",
        prospectFirstName: "Marcus",
        prospectLastName: "Bell",
        prospectJobTitle: "VP, Sales",
        prospectJobSeniorityLevel: "VP",
        prospectCompanyName: "Northwind Healthcare",
        prospectCompanyWebsite: "northwindhealthcare.com",
        prospectCity: "Plano",
        prospectRegionName: "Texas",
        prospectCountryName: "USA",
        contactProfessionalEmail: "marcus@northwindhealthcare.com",
        contactProfessionalEmailStatus: "verified",
        contactMobilePhone: "+1 214 555 0190",
        funnel: "calculated",
        source: "manual",
      },
    ];
    addLeads(demo);
    setLeads(getAllLeads());
    toast.success(`Added ${demo.length} demo leads.`);
  }

  /* ============================ RENDER ============================ */
  return (
    <main>
      {/* Cross-version banner — Vicky's Phase 1 also live */}
      <div className="border-b border-[#E5ECF4] bg-mhsp-gold/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-2 text-center text-xs sm:text-sm">
          <span className="text-mhsp-navy/80">
            👀 Also live:{" "}
            <Link
              href="/leads-vicky-v1"
              className="font-semibold text-mhsp-navy underline underline-offset-2 hover:text-mhsp-gold transition-colors"
            >
              Vicky&apos;s Phase 1 prototype at /leads-vicky-v1
            </Link>
          </span>
        </div>
      </div>
      {/* HERO BAND */}
      <section className="relative overflow-hidden border-b border-[#E5ECF4]">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 480px at 14% 0%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 480px at 92% 100%, rgba(15,76,129,0.08), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Lead Manager
              </span>
              <h1 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
                Lead Manager.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-mhsp-muted leading-relaxed max-w-2xl">
                Every prospect your AI sales team has surfaced — searchable,
                exportable, ready to work.
              </p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Kpi
              Icon={Users}
              label="Total leads"
              value={stats.total.toString()}
              tone="navy"
            />
            <Kpi
              Icon={Sparkles}
              label="New this week"
              value={stats.newWeek.toString()}
              tone="teal"
            />
            <Kpi
              Icon={CheckCircle2}
              label="Verified emails"
              value={stats.verified.toString()}
              tone="teal"
            />
            <Kpi
              Icon={Briefcase}
              label="Calc / Hustle"
              value={`${stats.calc} / ${stats.hustle}`}
              tone="navy"
              highlight
            />
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!hydrated ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState onAddDemo={handleAddDemoLeads} />
        ) : (
          <>
            {/* ACTION BAR */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
              <AddLeadsButton onAddDemo={handleAddDemoLeads} />
              <ExportButton
                onCSV={(s) => handleExportCSV(s)}
                onExcel={(s) => handleExportExcel(s)}
                selectedCount={selected.size}
              />
              <BulkActionsButton
                disabled={selected.size === 0}
                count={selected.size}
                onMarkContacted={handleBulkMarkContacted}
                onDelete={handleBulkDelete}
              />
              <div className="lg:ml-auto text-sm text-mhsp-muted font-numeric">
                Showing{" "}
                <span className="font-bold text-mhsp-navy">
                  {paged.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-mhsp-navy">
                  {filtered.length}
                </span>{" "}
                · Total{" "}
                <span className="font-bold text-mhsp-navy">{leads.length}</span>
              </div>
            </div>

            {/* FILTER ROW */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#E5ECF4] bg-white p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2 relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, company, email, city…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 focus:border-[#1B6EB7]/50 transition-all"
                  />
                </div>
                <Select
                  value={sourceFilter}
                  onChange={(v) => setSourceFilter(v as "all" | LeadSource)}
                  options={[
                    { value: "all", label: "Source: All" },
                    { value: "apollo", label: "Apollo" },
                    { value: "vibe", label: "Vibe" },
                    { value: "agent_generated", label: "Lead Gen Agent" },
                    { value: "manual", label: "Manual" },
                  ]}
                />
                <Select
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as "all" | LeadStatus)}
                  options={[
                    { value: "all", label: "Status: All" },
                    { value: "new", label: "New" },
                    { value: "contacted", label: "Contacted" },
                    { value: "replied", label: "Replied" },
                    { value: "qualified", label: "Qualified" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
                <Select
                  value={funnelFilter}
                  onChange={(v) => setFunnelFilter(v as "all" | LeadFunnel)}
                  options={[
                    { value: "all", label: "Funnel: All" },
                    { value: "calculated", label: "🎯 Calculated" },
                    { value: "hustle", label: "⚡ Hustle" },
                  ]}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted">
                  <FilterIcon className="h-3.5 w-3.5" /> By agent
                </div>
                <div className="flex-1">
                  <Select
                    value={agentFilter}
                    onChange={(v) => setAgentFilter(v)}
                    options={[
                      { value: "all", label: "All agents" },
                      ...AGENTS.map((a) => ({
                        value: a.id,
                        label: a.name,
                      })),
                    ]}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-3 py-2 text-sm font-semibold transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* TABLE */}
            {paged.length === 0 ? (
              <div className="rounded-2xl border border-[#E5ECF4] border-dashed p-12 text-center bg-white">
                <p className="text-mhsp-muted">
                  No leads match these filters.{" "}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[#1B6EB7] font-semibold hover:underline"
                  >
                    Reset
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E5ECF4] bg-white overflow-hidden shadow-[0_2px_10px_-4px_rgba(15,76,129,0.06)]">
                <div className="overflow-x-auto max-h-[68vh]">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-[#F4F8FC] border-b border-[#DCE5EF]">
                      <tr>
                        <Th sticky className="w-10 pl-4">
                          <input
                            type="checkbox"
                            checked={allOnPageSelected}
                            onChange={toggleAllOnPage}
                            aria-label="Select all on page"
                            className="h-4 w-4 rounded border-[#DCE5EF] text-[#1B6EB7]"
                          />
                        </Th>
                        <ThSort
                          label="Name"
                          col="prospectFullName"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                          sticky
                        />
                        <ThSort
                          label="Title"
                          col="prospectJobTitle"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                        />
                        <ThSort
                          label="Company"
                          col="prospectCompanyName"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                        />
                        <ThSort
                          label="Email"
                          col="contactProfessionalEmail"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                        />
                        <Th>Phone</Th>
                        <Th>City</Th>
                        <Th>Region</Th>
                        <Th>Country</Th>
                        <Th>Seniority</Th>
                        <Th>Department</Th>
                        <Th>LinkedIn</Th>
                        <Th>Funnel</Th>
                        <ThSort
                          label="Status"
                          col="status"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                        />
                        <Th>Source</Th>
                        <ThSort
                          label="Added"
                          col="createdAt"
                          sortKey={sortKey}
                          sortDir={sortDir}
                          onSort={handleSort}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((l) => (
                        <Row
                          key={l.id}
                          lead={l}
                          checked={selected.has(l.id)}
                          onToggle={() => toggleOne(l.id)}
                          onOpen={() => setDrawerLead(l)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#E5ECF4] bg-[#FBFCFE]">
                    <p className="text-sm text-mhsp-muted">
                      Page{" "}
                      <span className="font-bold text-mhsp-navy font-numeric">
                        {page}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-mhsp-navy font-numeric">
                        {totalPages}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F8FC] transition-colors"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="px-3 py-1.5 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F8FC] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* DETAIL DRAWER */}
      <LeadDrawer
        lead={drawerLead}
        onClose={() => setDrawerLead(null)}
        onChange={() => setLeads(getAllLeads())}
      />
    </main>
  );
}

/* ============================== sub-components ============================== */

function Kpi({
  Icon,
  label,
  value,
  tone,
  highlight = false,
}: {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  tone: "navy" | "teal";
  highlight?: boolean;
}) {
  const tile =
    tone === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_8px_28px_-12px_rgba(15,76,129,0.14),0_2px_8px_-4px_rgba(15,76,129,0.06)] ${
        highlight
          ? "border-[#DCE5EF] bg-gradient-to-br from-[#F4F8FC] via-white to-white"
          : "border-[#E5ECF4] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-[0_6px_18px_-8px_rgba(15,76,129,0.5)] ${tile}`}
        >
          <Icon className="h-[20px] w-[20px]" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted leading-tight">
            {label}
          </p>
          <p className="mt-1.5 font-numeric text-2xl sm:text-[28px] font-bold text-mhsp-navy leading-none">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-9 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy hover:border-[#1B6EB7]/40 focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 focus:border-[#1B6EB7]/50 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mhsp-muted" />
    </div>
  );
}

function Th({
  children,
  sticky = false,
  className = "",
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`text-left text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted px-3 py-3 whitespace-nowrap ${
        sticky ? "sticky left-0 bg-[#F4F8FC] z-10" : ""
      } ${className}`}
    >
      {children}
    </th>
  );
}

function ThSort({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  sticky = false,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  sticky?: boolean;
}) {
  const active = sortKey === col;
  return (
    <th
      scope="col"
      className={`text-left text-sm font-bold tracking-[0.12em] uppercase text-mhsp-muted px-3 py-3 whitespace-nowrap ${
        sticky ? "sticky left-10 bg-[#F4F8FC] z-10" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className="inline-flex items-center gap-1 hover:text-mhsp-navy transition-colors"
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </th>
  );
}

function Td({
  children,
  sticky = false,
  className = "",
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-3 whitespace-nowrap text-mhsp-text ${
        sticky ? "sticky left-0 bg-white group-hover:bg-[#F8FAFC] z-10" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

function EmailStatusBadge({ status }: { status: LeadEmailStatus }) {
  const cfg = {
    verified: {
      Icon: CheckCircle2,
      cls: "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30",
    },
    guessed: {
      Icon: HelpCircle,
      cls: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
    },
    unverified: {
      Icon: AlertCircle,
      cls: "bg-[#F3F4F6] text-mhsp-muted border-[#E5E7EB]",
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-sm font-semibold ${cfg.cls}`}
    >
      <cfg.Icon className="h-3 w-3" strokeWidth={2.5} />
    </span>
  );
}

function Row({
  lead,
  checked,
  onToggle,
  onOpen,
}: {
  lead: Lead;
  checked: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <tr
      className="group border-b border-[#F1F4F8] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <Td sticky className="w-10 pl-4">
        <input
          type="checkbox"
          checked={checked}
          onClick={(e) => e.stopPropagation()}
          onChange={onToggle}
          aria-label={`Select ${lead.prospectFullName}`}
          className="h-4 w-4 rounded border-[#DCE5EF] text-[#1B6EB7]"
        />
      </Td>
      <Td sticky className="left-10">
        <span className="font-bold text-mhsp-navy">{lead.prospectFullName || "—"}</span>
      </Td>
      <Td>{lead.prospectJobTitle || "—"}</Td>
      <Td>
        <span className="font-semibold text-mhsp-navy">
          {lead.prospectCompanyName || "—"}
        </span>
      </Td>
      <Td>
        {lead.contactProfessionalEmail ? (
          <span className="inline-flex items-center gap-1.5">
            <EmailStatusBadge status={lead.contactProfessionalEmailStatus} />
            <span className="text-mhsp-text">
              {lead.contactProfessionalEmail}
            </span>
          </span>
        ) : (
          "—"
        )}
      </Td>
      <Td>{lead.contactMobilePhone || "—"}</Td>
      <Td>{lead.prospectCity || "—"}</Td>
      <Td>{lead.prospectRegionName || "—"}</Td>
      <Td>{lead.prospectCountryName || "—"}</Td>
      <Td>{lead.prospectJobSeniorityLevel || "—"}</Td>
      <Td>{lead.prospectJobDepartment || "—"}</Td>
      <Td>
        {lead.prospectLinkedin ? (
          <a
            href={lead.prospectLinkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[#1B6EB7] hover:underline"
          >
            <LinkedinIcon className="h-3 w-3" /> Profile
          </a>
        ) : (
          "—"
        )}
      </Td>
      <Td>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-sm font-bold ${
            lead.funnel === "calculated"
              ? "bg-[#EAF2FA] text-[#0F4C81] border-[#C9DAEB]"
              : "bg-[#E3F1FA] text-[#1B6EB7] border-[#C7DFEE]"
          }`}
        >
          {FUNNEL_LABELS[lead.funnel]}
        </span>
      </Td>
      <Td>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-sm font-bold uppercase tracking-wider ${STATUS_TONE[lead.status]}`}
        >
          {STATUS_LABELS[lead.status]}
        </span>
      </Td>
      <Td>{SOURCE_LABELS[lead.source]}</Td>
      <Td className="text-mhsp-muted font-numeric">
        {new Date(lead.createdAt).toLocaleDateString()}
      </Td>
    </tr>
  );
}

/* -------------------- Action-bar dropdowns -------------------- */

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

function Menu({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute left-0 top-full mt-2 z-30 min-w-[240px] rounded-xl border border-[#E5ECF4] bg-white shadow-[0_20px_50px_-20px_rgba(15,76,129,0.25),0_4px_14px_-4px_rgba(15,76,129,0.08)] overflow-hidden p-1.5">
      {children}
    </div>
  );
}

function MenuItem({
  Icon,
  label,
  onClick,
  disabled = false,
  destructive = false,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        destructive
          ? "text-[#B91C1C] hover:bg-[#FEF2F2]"
          : "text-mhsp-navy hover:bg-[#F4F8FC]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function AddLeadsButton({ onAddDemo }: { onAddDemo: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-[0_8px_18px_-8px_rgba(27,110,183,0.5)] transition-all"
      >
        <Plus className="h-4 w-4" /> Add leads
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Menu open={open}>
        <MenuItem
          Icon={Cloud}
          label="Pull from Apollo (coming soon)"
          onClick={() => {
            setOpen(false);
            toast.info("Apollo integration is coming — Vicky's wiring it.");
          }}
        />
        <MenuItem
          Icon={Cloud}
          label="Pull from Vibe (coming soon)"
          onClick={() => {
            setOpen(false);
            toast.info("Vibe Prospecting is coming — Vicky's wiring it.");
          }}
        />
        <Link
          href="/agent/01_lead_generation"
          onClick={() => setOpen(false)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg text-left text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Generate via Lead Gen Agent
        </Link>
        <div className="my-1 border-t border-[#E5ECF4]" />
        <MenuItem
          Icon={Plus}
          label="Add 3 demo leads"
          onClick={() => {
            setOpen(false);
            onAddDemo();
          }}
        />
      </Menu>
    </div>
  );
}

function ExportButton({
  onCSV,
  onExcel,
  selectedCount,
}: {
  onCSV: (scope: "selected" | "all") => void;
  onExcel: (scope: "selected" | "all") => void;
  selectedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-2.5 text-sm font-bold transition-colors"
      >
        <Download className="h-4 w-4" /> Export
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Menu open={open}>
        <MenuItem
          Icon={FileText}
          label={`Export CSV (${selectedCount > 0 ? "selected" : "all visible"})`}
          onClick={() => {
            setOpen(false);
            onCSV(selectedCount > 0 ? "selected" : "all");
          }}
        />
        <MenuItem
          Icon={FileSpreadsheet}
          label={`Export Excel (${selectedCount > 0 ? "selected" : "all visible"})`}
          onClick={() => {
            setOpen(false);
            onExcel(selectedCount > 0 ? "selected" : "all");
          }}
        />
        <MenuItem
          Icon={Cloud}
          label="Push to Google Sheet (coming soon)"
          onClick={() => {
            setOpen(false);
            toast.info("Google Sheets push is coming — Vicky's wiring it.");
          }}
        />
      </Menu>
    </div>
  );
}

function BulkActionsButton({
  disabled,
  count,
  onMarkContacted,
  onDelete,
}: {
  disabled: boolean;
  count: number;
  onMarkContacted: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-4 py-2.5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Bulk actions
        {count > 0 && (
          <span className="font-numeric text-sm bg-[#1B6EB7] text-white rounded-full px-2 py-0.5">
            {count}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Menu open={open}>
        <MenuItem
          Icon={Send}
          label="Send email sequence (coming soon)"
          onClick={() => {
            setOpen(false);
            toast.info("Sequence builder is coming — Vicky's wiring it.");
          }}
        />
        <MenuItem
          Icon={CheckCircle2}
          label="Mark as contacted"
          onClick={() => {
            setOpen(false);
            onMarkContacted();
          }}
        />
        <div className="my-1 border-t border-[#E5ECF4]" />
        <MenuItem
          Icon={Trash2}
          label="Delete selected"
          destructive
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
        />
      </Menu>
    </div>
  );
}

/* -------------------- EmptyState -------------------- */

function EmptyState({ onAddDemo }: { onAddDemo: () => void }) {
  return (
    <div className="relative bg-white rounded-2xl border border-[#E5ECF4] border-dashed px-6 py-14 text-center max-w-3xl mx-auto">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white shadow-[0_8px_24px_-8px_rgba(27,110,183,0.5)] mb-4">
        <Users className="h-6 w-6" strokeWidth={2.25} />
      </div>
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-mhsp-navy">
        No leads yet.
      </h3>
      <p className="mt-2 text-mhsp-muted text-base leading-relaxed max-w-md mx-auto">
        Generate leads with the Lead Gen Agent, pull them from a CRM, or drop
        in a sample set to see the table in action.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/agent/01_lead_generation"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:-translate-y-0.5 transition-all"
        >
          Generate via Lead Gen Agent
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <button
          type="button"
          onClick={onAddDemo}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3 text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Add 3 demo leads
        </button>
        <Link
          href="/agents"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-6 py-3 text-sm font-semibold transition-colors"
        >
          Browse agents
        </Link>
      </div>
    </div>
  );
}

/* -------------------- Lead detail drawer -------------------- */

function LeadDrawer({
  lead,
  onClose,
  onChange,
}: {
  lead: Lead | null;
  onClose: () => void;
  onChange: () => void;
}) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Sync local state to lead when it changes
  useEffect(() => {
    if (lead) {
      setNote(lead.notes);
      setStatus(lead.status);
    }
  }, [lead]);

  // Esc to close
  useEffect(() => {
    if (!lead) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  const persistStatus = useCallback(
    (newStatus: LeadStatus) => {
      if (!lead) return;
      setStatus(newStatus);
      updateLead(lead.id, { status: newStatus });
      onChange();
      toast.success(`Status: ${STATUS_LABELS[newStatus]}`);
    },
    [lead, onChange],
  );

  const persistNote = useCallback(() => {
    if (!lead) return;
    updateLead(lead.id, { notes: note });
    onChange();
    toast.success("Note saved.");
  }, [lead, note, onChange]);

  const handleDelete = useCallback(() => {
    if (!lead) return;
    deleteLeads([lead.id]);
    onChange();
    setConfirmDeleteOpen(false);
    onClose();
    toast.success(`Deleted ${lead.prospectFullName || "lead"}.`);
  }, [lead, onChange, onClose]);

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0F1B2D]/40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Lead detail for ${lead.prospectFullName}`}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-white shadow-[-20px_0_60px_-20px_rgba(15,76,129,0.25)] flex flex-col"
          >
            {/* Header */}
            <header className="px-5 sm:px-6 py-5 border-b border-[#E5ECF4] flex items-start gap-3">
              <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-[#1E5896] to-[#0F4C81] text-white flex items-center justify-center shadow-[0_8px_22px_-8px_rgba(15,76,129,0.55)]">
                <Briefcase className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl font-bold text-mhsp-navy leading-tight truncate">
                  {lead.prospectFullName || "Unnamed lead"}
                </h2>
                <p className="text-sm text-mhsp-muted mt-0.5 truncate">
                  {lead.prospectJobTitle || "—"} ·{" "}
                  {lead.prospectCompanyName || "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 h-9 w-9 rounded-lg hover:bg-[#F4F8FC] flex items-center justify-center text-mhsp-muted hover:text-mhsp-navy transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              <Section title="Personal">
                <Field label="Full name" value={lead.prospectFullName} />
                <Field
                  label="First / Last"
                  value={`${lead.prospectFirstName || "—"} / ${lead.prospectLastName || "—"}`}
                />
                <Field label="Title" value={lead.prospectJobTitle} />
                <Field
                  label="Seniority"
                  value={lead.prospectJobSeniorityLevel}
                />
                <Field
                  label="Department"
                  value={lead.prospectJobDepartment}
                />
              </Section>

              <Section title="Company">
                <Field label="Name" value={lead.prospectCompanyName} />
                <FieldLink
                  label="Website"
                  href={lead.prospectCompanyWebsite}
                />
                <FieldLink
                  label="LinkedIn"
                  href={lead.prospectCompanyLinkedin}
                  Icon={LinkedinIcon}
                />
              </Section>

              <Section title="Contact">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-[#1B6EB7] mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-mhsp-muted">Email</p>
                    {lead.contactProfessionalEmail ? (
                      <p className="text-sm text-mhsp-text font-semibold flex items-center gap-2 flex-wrap break-all">
                        {lead.contactProfessionalEmail}
                        <EmailStatusBadge
                          status={lead.contactProfessionalEmailStatus}
                        />
                      </p>
                    ) : (
                      <p className="text-sm text-mhsp-muted">—</p>
                    )}
                  </div>
                </div>
                {lead.contactEmails.length > 0 && (
                  <Field
                    label="Other emails"
                    value={lead.contactEmails.join(", ")}
                  />
                )}
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-[#1B6EB7] mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-mhsp-muted">Mobile</p>
                    <p className="text-sm text-mhsp-text font-semibold">
                      {lead.contactMobilePhone || "—"}
                    </p>
                  </div>
                </div>
                {lead.contactPhoneNumbers.length > 0 && (
                  <Field
                    label="Other phones"
                    value={lead.contactPhoneNumbers.join(", ")}
                  />
                )}
                <FieldLink
                  label="LinkedIn (prospect)"
                  href={lead.prospectLinkedin}
                  Icon={LinkedinIcon}
                />
              </Section>

              <Section title="Background">
                <Field label="Experience" value={lead.prospectExperience} />
                <Field
                  label="Skills"
                  value={
                    lead.prospectSkills.length
                      ? lead.prospectSkills.join(", ")
                      : "—"
                  }
                />
                <Field
                  label="Interests"
                  value={
                    lead.prospectInterests.length
                      ? lead.prospectInterests.join(", ")
                      : "—"
                  }
                />
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#1B6EB7] mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-mhsp-muted">Location</p>
                    <p className="text-sm text-mhsp-text font-semibold">
                      {[
                        lead.prospectCity,
                        lead.prospectRegionName,
                        lead.prospectCountryName,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </Section>

              <Section title="Activity">
                <Field
                  label="Source"
                  value={SOURCE_LABELS[lead.source]}
                />
                <Field
                  label="Funnel"
                  value={FUNNEL_LABELS[lead.funnel]}
                />
                <Field
                  label="Captured by"
                  value={lead.agentId || "—"}
                />
                <Field
                  label="Added"
                  value={new Date(lead.createdAt).toLocaleString()}
                />
              </Section>

              <Section title="Notes">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={persistNote}
                  placeholder="Add a note about this lead…"
                  className="w-full min-h-[80px] resize-none rounded-lg border border-[#DCE5EF] bg-[#FAFCFE] text-sm leading-relaxed text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 focus:border-[#1B6EB7]/50 transition-all px-3 py-2"
                />
                <p className="text-sm text-mhsp-muted mt-1.5 flex items-center gap-1.5">
                  <StickyNote className="h-3 w-3" /> Saved automatically on
                  blur.
                </p>
              </Section>
            </div>

            {/* Footer actions */}
            <footer className="border-t border-[#E5ECF4] px-5 sm:px-6 py-4 bg-[#FBFCFE] space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tracking-[0.14em] uppercase text-mhsp-muted">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => persistStatus(e.target.value as LeadStatus)}
                  className="flex-1 appearance-none pl-3 pr-9 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 focus:border-[#1B6EB7]/50 transition-all"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A6B82' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "14px",
                  }}
                >
                  {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/agent/02_outbound_sales?lead=${encodeURIComponent(lead.id)}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-all"
                >
                  <Sparkles className="h-4 w-4" /> Generate outreach
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-[#B91C1C] px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete lead
                </button>
              </div>
            </footer>
          </motion.aside>

          {/* Delete confirm */}
          {confirmDeleteOpen && (
            <DeleteLeadModal
              leadName={lead.prospectFullName || "this lead"}
              onCancel={() => setConfirmDeleteOpen(false)}
              onConfirm={handleDelete}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold tracking-[0.16em] uppercase text-mhsp-gold">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-mhsp-muted">{label}</p>
      <p className="text-sm text-mhsp-text font-semibold break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function FieldLink({
  label,
  href,
  Icon = Building2,
}: {
  label: string;
  href: string;
  Icon?: ComponentType<{ className?: string }>;
}) {
  if (!href) return <Field label={label} value="—" />;
  const isUrl = /^https?:\/\//i.test(href);
  const target = isUrl ? href : `https://${href}`;
  return (
    <div>
      <p className="text-sm text-mhsp-muted">{label}</p>
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[#1B6EB7] font-semibold hover:underline inline-flex items-center gap-1.5 break-all"
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {href}
      </a>
    </div>
  );
}

function DeleteLeadModal({
  leadName,
  onCancel,
  onConfirm,
}: {
  leadName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[60] bg-[#0F1B2D]/55 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30),0_8px_24px_-8px_rgba(15,76,129,0.12)] overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#B91C1C]" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-11 w-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#B91C1C]">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-bold text-mhsp-navy leading-tight">
                Delete lead?
              </h2>
              <p className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">
                This permanently removes{" "}
                <span className="font-semibold text-mhsp-navy">
                  {leadName}
                </span>{" "}
                from the Lead Manager. This action can&apos;t be undone.
              </p>
            </div>
          </div>
          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              autoFocus
              className="inline-flex items-center justify-center rounded-lg border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              No, keep it
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B91C1C] hover:bg-[#991B1B] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Yes, delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
