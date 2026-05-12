"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  Search,
  Loader2,
  CheckCircle2,
  Users,
  MapPin,
  Building2,
  Download,
} from "lucide-react";
import { addLeads, type WorkspaceLead } from "@/lib/workspace";

interface PullLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  /** "apollo" or "vibe" */
  source: "apollo" | "vibe";
  onLeadsAdded?: (count: number) => void;
}

const SOURCE_CONFIG = {
  apollo: {
    name: "Apollo.io",
    color: "from-violet-500 to-purple-700",
    accent: "bg-violet-50 text-violet-700 border-violet-200",
    buttonColor: "bg-violet-600 hover:bg-violet-700",
    description: "Pull verified business contacts from Apollo's database of 275M+ professionals.",
  },
  vibe: {
    name: "Vibe Prospecting",
    color: "from-cyan-500 to-blue-600",
    accent: "bg-cyan-50 text-cyan-700 border-cyan-200",
    buttonColor: "bg-cyan-600 hover:bg-cyan-700",
    description: "Search the Vibe intent-signal database for prospects actively looking for hotel services.",
  },
};

type SearchState = "idle" | "searching" | "results";

export function PullLeadsDialog({
  open,
  onClose,
  source,
  onLeadsAdded,
}: PullLeadsDialogProps) {
  const config = SOURCE_CONFIG[source];
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [industry, setIndustry] = useState("Healthcare");
  const [location, setLocation] = useState("Dallas, TX");
  const [seniority, setSeniority] = useState("Director+");
  const [results, setResults] = useState<Partial<WorkspaceLead>[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      setSearchState("idle");
      setResults([]);
      setSelected(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSearch = useCallback(async () => {
    setSearchState("searching");

    try {
      const res = await fetch(`/api/${source}-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, location, seniority }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setResults(data.leads || []);
      setSelected(new Set(data.leads?.map((_: unknown, i: number) => i) || []));
      setSearchState("results");
    } catch {
      toast.error(`${config.name} search failed — using sample data.`);
      // Fallback to sample data
      const sample = generateSampleLeads(source, industry, location);
      setResults(sample);
      setSelected(new Set(sample.map((_, i) => i)));
      setSearchState("results");
    }
  }, [source, industry, location, seniority, config.name]);

  const toggleResult = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleImport = useCallback(() => {
    const toImport = results.filter((_, i) => selected.has(i));
    if (toImport.length === 0) {
      toast.error("Select at least one lead to import.");
      return;
    }

    const stamped = toImport.map((l) => ({
      ...l,
      source: source as "apollo" | "vibe",
    }));
    addLeads(stamped, `${config.name} Import`);
    toast.success(`Imported ${toImport.length} leads from ${config.name}.`);
    onLeadsAdded?.(toImport.length);
    onClose();
  }, [results, selected, source, config.name, onLeadsAdded, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F1B2D]/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-x-4 top-[6vh] z-50 mx-auto max-w-2xl"
          >
            <div className="rounded-2xl bg-white border border-[#E5ECF4] shadow-[0_30px_80px_-20px_rgba(15,76,129,0.30)] overflow-hidden flex flex-col max-h-[88vh]">
              <div className={`h-1.5 w-full bg-gradient-to-r ${config.color}`} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5ECF4]">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-sm`}>
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-mhsp-navy">
                      Pull from {config.name}
                    </h3>
                    <p className="text-[12px] text-mhsp-muted max-w-sm">
                      {config.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-[#F4F8FC] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search form */}
              <div className="px-5 py-4 border-b border-[#E5ECF4] bg-[#FBFCFE]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-mhsp-muted block mb-1">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full appearance-none px-3 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 transition-all"
                    >
                      <option>Healthcare</option>
                      <option>Technology</option>
                      <option>Construction</option>
                      <option>Finance</option>
                      <option>Defense</option>
                      <option>Education</option>
                      <option>Retail</option>
                      <option>Sports &amp; Events</option>
                      <option>Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-mhsp-muted block mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mhsp-muted" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm text-mhsp-text focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-mhsp-muted block mb-1">
                      Seniority
                    </label>
                    <select
                      value={seniority}
                      onChange={(e) => setSeniority(e.target.value)}
                      className="w-full appearance-none px-3 py-2 rounded-lg border border-[#DCE5EF] bg-white text-sm font-semibold text-mhsp-navy focus:outline-none focus:ring-4 focus:ring-[#1B6EB7]/15 transition-all"
                    >
                      <option>Any</option>
                      <option>Manager+</option>
                      <option>Director+</option>
                      <option>VP+</option>
                      <option>C-Suite</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchState === "searching"}
                  className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl text-white px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-sm disabled:opacity-60 transition-all ${config.buttonColor}`}
                >
                  {searchState === "searching" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {searchState === "searching" ? "Searching…" : `Search ${config.name}`}
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {searchState === "idle" && (
                  <div className="px-5 py-12 text-center">
                    <Users className="h-10 w-10 text-mhsp-muted/40 mx-auto mb-3" />
                    <p className="text-sm text-mhsp-muted">
                      Configure filters above and search to find leads.
                    </p>
                  </div>
                )}
                {searchState === "searching" && (
                  <div className="px-5 py-12 text-center">
                    <Loader2 className="h-8 w-8 text-[#1B6EB7] animate-spin mx-auto mb-3" />
                    <p className="text-sm font-semibold text-mhsp-navy">
                      Searching {config.name}…
                    </p>
                    <p className="text-[12px] text-mhsp-muted mt-1">
                      Finding verified contacts matching your criteria
                    </p>
                  </div>
                )}
                {searchState === "results" && (
                  <div>
                    <div className="px-5 py-2 bg-[#F4F8FC] border-b border-[#E5ECF4] flex items-center justify-between">
                      <p className="text-sm font-semibold text-mhsp-navy">
                        {results.length} results · {selected.size} selected
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(new Set(results.map((_, i) => i)))}
                          className="text-[11px] font-semibold text-[#1B6EB7] hover:underline"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(new Set())}
                          className="text-[11px] font-semibold text-mhsp-muted hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-[#F1F4F8]">
                      {results.map((lead, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(i)}
                            onChange={() => toggleResult(i)}
                            className="h-4 w-4 rounded border-[#DCE5EF] text-[#1B6EB7]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-mhsp-navy truncate">
                              {lead.fullName}
                            </p>
                            <p className="text-[11px] text-mhsp-muted truncate">
                              {lead.jobTitle} · {lead.companyName}
                              {lead.city ? ` · ${lead.city}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] text-mhsp-text font-mono truncate max-w-[160px]">
                              {lead.email || "—"}
                            </p>
                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                              lead.emailStatus === "verified"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}>
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {lead.emailStatus}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {searchState === "results" && (
                <div className="border-t border-[#E5ECF4] px-5 py-4 bg-[#FBFCFE] flex items-center justify-between gap-3">
                  <p className="text-[12px] text-mhsp-muted">
                    {selected.size} of {results.length} leads selected
                  </p>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={selected.size === 0}
                    className={`inline-flex items-center gap-2 rounded-xl text-white px-6 py-2.5 text-sm font-bold uppercase tracking-[0.1em] shadow-sm disabled:opacity-40 transition-all ${config.buttonColor}`}
                  >
                    <Download className="h-4 w-4" />
                    Import {selected.size} leads
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Generate sample leads for theatre mode */
function generateSampleLeads(
  source: "apollo" | "vibe",
  industry: string,
  location: string
): Partial<WorkspaceLead>[] {
  const baseLeads: Record<string, Partial<WorkspaceLead>[]> = {
    Healthcare: [
      { fullName: "Dr. Karen Mitchell", firstName: "Karen", lastName: "Mitchell", jobTitle: "Chief Medical Officer", jobSeniority: "C-Suite", companyName: "Baylor Scott & White", email: "k.mitchell@bswhealth.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Thomas Grant", firstName: "Thomas", lastName: "Grant", jobTitle: "VP of Hospital Operations", jobSeniority: "VP", companyName: "Medical City Healthcare", email: "t.grant@medcity.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Angela Peters", firstName: "Angela", lastName: "Peters", jobTitle: "Director of Nursing Education", jobSeniority: "Director", companyName: "Parkland Health", email: "a.peters@parkland.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Raymond Cruz", firstName: "Raymond", lastName: "Cruz", jobTitle: "Residency Program Director", jobSeniority: "Director", companyName: "UT Southwestern", email: "r.cruz@utsw.edu", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Michelle Foster", firstName: "Michelle", lastName: "Foster", jobTitle: "VP of Partnerships", jobSeniority: "VP", companyName: "Children's Health", email: "m.foster@childrens.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Eric Washington", firstName: "Eric", lastName: "Washington", jobTitle: "Regional Travel Coordinator", jobSeniority: "Manager", companyName: "HCA Healthcare North Texas", email: "e.washington@hca.com", emailStatus: "verified", city: "Irving", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Sandra Kim", firstName: "Sandra", lastName: "Kim", jobTitle: "Procurement Manager", jobSeniority: "Manager", companyName: "Texas Health Resources", email: "s.kim@txhealth.org", emailStatus: "verified", city: "Arlington", region: "TX", country: "US", industry: "Healthcare" },
      { fullName: "Carlos Gutierrez", firstName: "Carlos", lastName: "Gutierrez", jobTitle: "Director of CME Programs", jobSeniority: "Director", companyName: "Methodist Health System", email: "c.gutierrez@mhd.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Healthcare" },
    ],
    Technology: [
      { fullName: "Ryan Chen", firstName: "Ryan", lastName: "Chen", jobTitle: "VP of Engineering", jobSeniority: "VP", companyName: "AT&T", email: "r.chen@att.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
      { fullName: "Jessica Moore", firstName: "Jessica", lastName: "Moore", jobTitle: "Director of Talent Acquisition", jobSeniority: "Director", companyName: "Texas Instruments", email: "j.moore@ti.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
      { fullName: "David Park", firstName: "David", lastName: "Park", jobTitle: "CTO", jobSeniority: "C-Suite", companyName: "Match Group", email: "d.park@match.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
      { fullName: "Lauren Brooks", firstName: "Lauren", lastName: "Brooks", jobTitle: "Sr. Program Manager", jobSeniority: "Manager", companyName: "Salesforce DFW", email: "l.brooks@salesforce.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Technology" },
      { fullName: "Mark Anderson", firstName: "Mark", lastName: "Anderson", jobTitle: "VP Corporate Events", jobSeniority: "VP", companyName: "Cisco Systems", email: "m.anderson@cisco.com", emailStatus: "verified", city: "Richardson", region: "TX", country: "US", industry: "Technology" },
      { fullName: "Priya Nair", firstName: "Priya", lastName: "Nair", jobTitle: "Director of Sales Enablement", jobSeniority: "Director", companyName: "Oracle", email: "p.nair@oracle.com", emailStatus: "verified", city: "Austin", region: "TX", country: "US", industry: "Technology" },
    ],
    Construction: [
      { fullName: "Robert Wilson", firstName: "Robert", lastName: "Wilson", jobTitle: "VP of Field Operations", jobSeniority: "VP", companyName: "Balfour Beatty", email: "r.wilson@balfourbeatty.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
      { fullName: "Maria Lopez", firstName: "Maria", lastName: "Lopez", jobTitle: "Project Director", jobSeniority: "Director", companyName: "Austin Industries", email: "m.lopez@austin-ind.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
      { fullName: "James Turner", firstName: "James", lastName: "Turner", jobTitle: "Site Manager", jobSeniority: "Manager", companyName: "McCarthy Building", email: "j.turner@mccarthy.com", emailStatus: "guessed", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
      { fullName: "Sarah Campbell", firstName: "Sarah", lastName: "Campbell", jobTitle: "HR Director", jobSeniority: "Director", companyName: "Kiewit Corporation", email: "s.campbell@kiewit.com", emailStatus: "verified", city: "Fort Worth", region: "TX", country: "US", industry: "Construction" },
      { fullName: "Brian Harris", firstName: "Brian", lastName: "Harris", jobTitle: "Regional Manager", jobSeniority: "Manager", companyName: "Turner Construction", email: "b.harris@tcco.com", emailStatus: "verified", city: "Dallas", region: "TX", country: "US", industry: "Construction" },
    ],
  };

  // Return leads for the matching industry, or healthcare as default
  const leads = baseLeads[industry] || baseLeads.Healthcare || [];
  return leads.map((l) => ({
    ...l,
    source,
    funnel: "hustle" as const,
    status: "new" as const,
  }));
}
