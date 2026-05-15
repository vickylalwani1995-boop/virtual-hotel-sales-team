"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  SlidersHorizontal,
  Search,
  ChevronRight,
  Star,
  Phone,
  Globe,
  Navigation,
  Flame,
  TrendingUp,
  Snowflake,
  Ban,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react"
import { toast } from "sonner"
import type { FeatureBusiness } from "@/lib/backyard-types"
import {
  CATEGORIES,
  HOTEL_NAME,
  TIER_CONFIG,
  filterByCategory,
  filterByRadius,
  getTier,
  loadScanResults,
  sortByScore,
  type Category,
  type Tier,
} from "@/lib/maps-scraper"
import { useDemoMode } from "@/lib/demo-mode"
import { postMessage } from "@/lib/team-chat"
import { createTask, loadTasks, saveTasks } from "@/lib/tasks"

// Dynamic import — Leaflet cannot run on server
const BackyardMap = dynamic(
  () => import("@/components/BackyardMap").then((m) => m.BackyardMap),
  { ssr: false, loading: () => <MapSkeleton /> },
)

const TIER_ICONS: Record<Tier, React.ReactNode> = {
  Hot:          <Flame className="h-3.5 w-3.5" />,
  Warm:         <TrendingUp className="h-3.5 w-3.5" />,
  Cold:         <Snowflake className="h-3.5 w-3.5" />,
  Disqualified: <Ban className="h-3.5 w-3.5" />,
}

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-[#E8EFF7] flex items-center justify-center">
      <div className="text-center space-y-3">
        <MapPin className="h-10 w-10 text-[#1B6EB7]/40 mx-auto" />
        <p className="text-sm text-[#64748B]">Loading map…</p>
      </div>
    </div>
  )
}

function TierBadge({ tier, score }: { tier: Tier; score: number }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${cfg.badge}`}>
      {TIER_ICONS[tier]}
      {tier} · {score.toFixed(1)}
    </span>
  )
}

export default function BackyardHunterPage() {
  const [demo] = useDemoMode()
  const [allBusinesses, setAllBusinesses] = useState<FeatureBusiness[]>([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [radiusMiles, setRadiusMiles] = useState(10)
  const [selectedCats, setSelectedCats] = useState<Category[]>(["healthcare", "corporate", "universities", "event_venues"])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panel, setPanel] = useState<"controls" | "results">("controls")
  const resultsRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const byRadius = filterByRadius(allBusinesses, radiusMiles)
    const byCat = filterByCategory(byRadius, selectedCats)
    return sortByScore(byCat)
  }, [allBusinesses, radiusMiles, selectedCats])

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { Hot: 0, Warm: 0, Cold: 0, Disqualified: 0 }
    for (const b of filtered) counts[b.qualification.tier as Tier]++
    return counts
  }, [filtered])

  function toggleCat(cat: Category) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  async function runScan() {
    if (loading) return
    setLoading(true)
    setScanned(false)
    setSelectedId(null)

    const delay = demo ? 1200 : 2800
    await new Promise((r) => setTimeout(r, delay))

    try {
      const results = await loadScanResults()
      setAllBusinesses(results)
      setScanned(true)
      setPanel("results")

      // Toast summary
      const hot = results.filter((b) => filterByRadius([b], radiusMiles) && b.qualification.tier === "Hot").length
      toast.success(`Scan complete — ${results.length} businesses found, ${hot} hot leads`)

      // Post to Team Chat + auto-create tasks (Task 6)
      wireScanToTeamChat(results, radiusMiles)
    } catch {
      toast.error("Failed to load scan data")
    } finally {
      setLoading(false)
    }
  }

  function wireScanToTeamChat(results: FeatureBusiness[], radius: number) {
    try {
      const hot = results.filter((b) => b.qualification.tier === "Hot")
      const warm = results.filter((b) => b.qualification.tier === "Warm")
      const cold = results.filter((b) => b.qualification.tier === "Cold")
      const disq = results.filter((b) => b.qualification.tier === "Disqualified")
      const top3 = hot.slice(0, 3)

      const chatBody = [
        `📍 **Backyard Scan Complete** — ${HOTEL_NAME}`,
        `Radius: **${radius} miles** · **${results.length} businesses** found`,
        "",
        `🔴 Hot (${hot.length}) · 🟡 Warm (${warm.length}) · 🔵 Cold (${cold.length}) · ⚫ Disqualified (${disq.length})`,
        "",
        "**Top 3 targets:**",
        ...top3.map((b, i) => `${i + 1}. ${b.name} — Score ${b.qualification.score} (${b.distanceMiles}mi)`),
        "",
        "See full results on the Backyard Hunter page.",
      ].join("\n")

      postMessage({
        channelId: "sales-team",
        authorId: "02_lead_gen",
        authorName: "Marcus Reed",
        authorType: "agent",
        body: chatBody,
        mentions: [],
        reactions: {},
      })

      // Auto-create tasks
      const existingTasks = loadTasks()
      const marcusTask = createTask({
        title: `Outreach: ${hot.length} hot leads from Backyard scan`,
        description: `Backyard scan found ${hot.length} hot prospects within ${radius} miles.\nTop target: ${top3[0]?.name ?? "—"} (${top3[0]?.qualification.score ?? "—"}/10).\nCall or email decision-makers — see Backyard Hunter for full list.`,
        status: "todo",
        priority: "high",
        assigneeId: "02_lead_gen",
        dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0] })(),
        tags: ["backyard", "outreach"],
      })
      const sarahTask = createTask({
        title: `Qualify ${warm.length} warm leads from Backyard scan`,
        description: `Run sentiment qualification on ${warm.length} warm-tier prospects from today's backyard scan. Score and prioritize for next week's outreach.`,
        status: "todo",
        priority: "medium",
        assigneeId: "03_outbound",
        dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split("T")[0] })(),
        tags: ["backyard", "qualify"],
      })
      saveTasks([...existingTasks, marcusTask, sarahTask])

      window.dispatchEvent(new Event("storage"))
    } catch {
      // Non-fatal — scan still succeeded
    }
  }

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setPanel("results")
    setTimeout(() => {
      const el = document.getElementById(`biz-${id}`)
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }, 100)
  }, [])

  const selected = filtered.find((b) => b.id === selectedId)

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#F0F4F8]">
      {/* Hero band */}
      <div
        className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #0F2D4A 0%, #0F4C81 60%, #1B6EB7 100%)" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #D4A537, #B8922E)" }}>
          <MapPin className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-heading text-lg sm:text-xl font-bold leading-tight">Backyard Hunter</h1>
          <p className="text-[#93C5FD] text-xs sm:text-sm truncate">
            {HOTEL_NAME} · Find businesses within your drive radius
          </p>
        </div>
        {scanned && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            {(["Hot", "Warm", "Cold", "Disqualified"] as Tier[]).map((tier) => (
              <span key={tier} className={`flex items-center gap-1 px-2 py-1 rounded-full ${TIER_CONFIG[tier].badge}`}>
                {TIER_ICONS[tier]} {tierCounts[tier]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — controls + results */}
        <div className="w-full sm:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-r border-[#DCE5EF] bg-white overflow-hidden">
          {/* Mobile tab switcher */}
          <div className="sm:hidden flex border-b border-[#DCE5EF]">
            {(["controls", "results"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPanel(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  panel === tab
                    ? "text-[#1B6EB7] border-b-2 border-[#1B6EB7]"
                    : "text-[#64748B]"
                }`}
              >
                {tab === "controls" ? "Controls" : `Results${scanned ? ` (${filtered.length})` : ""}`}
              </button>
            ))}
          </div>

          {/* Controls panel */}
          <div className={`${panel === "results" ? "hidden sm:flex" : "flex"} flex-col gap-0 border-b border-[#DCE5EF]`}>
            <div className="px-4 py-4 space-y-4">
              {/* Radius slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1B2D]">
                    <Navigation className="h-4 w-4 text-[#D4A537]" />
                    Radius
                  </label>
                  <span className="text-sm font-bold text-[#1B6EB7]">{radiusMiles} miles</span>
                </div>
                <style>{`
                  .radius-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 9999px; outline: none; cursor: pointer; }
                  .radius-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #1B6EB7; border: 3px solid white; box-shadow: 0 1px 6px rgba(27,110,183,0.45); cursor: pointer; }
                  .radius-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #1B6EB7; border: 3px solid white; box-shadow: 0 1px 6px rgba(27,110,183,0.45); cursor: pointer; }
                `}</style>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  className="radius-slider"
                  style={{
                    background: `linear-gradient(to right, #1B6EB7 0%, #1B6EB7 ${((radiusMiles - 1) / 24) * 100}%, #DCE5EF ${((radiusMiles - 1) / 24) * 100}%, #DCE5EF 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
                  <span>1 mi</span><span>25 mi</span>
                </div>
              </div>

              {/* Category checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-[#0F1B2D]">
                    <SlidersHorizontal className="h-4 w-4 text-[#D4A537]" />
                    Categories
                  </label>
                  <button
                    onClick={() => setSelectedCats(selectedCats.length === CATEGORIES.length ? [] : CATEGORIES.map((c) => c.id))}
                    className="text-[11px] text-[#1B6EB7] hover:underline font-medium"
                  >
                    {selectedCats.length === CATEGORIES.length ? "None" : "All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const checked = selectedCats.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCat(cat.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all text-left ${
                          checked
                            ? "bg-[#EAF2FA] text-[#1B6EB7] border border-[#1B6EB7]/30"
                            : "bg-[#F8FAFC] text-[#64748B] border border-[#E5ECF4] hover:border-[#1B6EB7]/20"
                        }`}
                      >
                        {checked ? <CheckSquare className="h-3.5 w-3.5 shrink-0" /> : <Square className="h-3.5 w-3.5 shrink-0" />}
                        <span className="truncate">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scrape button */}
              <button
                onClick={runScan}
                disabled={loading || selectedCats.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? "#64748B" : "linear-gradient(135deg, #0F4C81, #1B6EB7)",
                  boxShadow: loading ? "none" : "0 4px 16px -4px rgba(27,110,183,0.5)",
                }}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Scanning…</>
                ) : (
                  <><Search className="h-4 w-4" /> Scrape Leads</>
                )}
              </button>
            </div>
          </div>

          {/* Results list */}
          <div
            ref={resultsRef}
            className={`${panel === "controls" ? "hidden sm:flex" : "flex"} flex-col flex-1 overflow-y-auto`}
          >
            {!scanned ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF2FA] flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-[#1B6EB7]" />
                </div>
                <p className="text-sm font-semibold text-[#0F1B2D]">No scan yet</p>
                <p className="text-xs text-[#64748B]">Set your radius and categories, then hit Scrape Leads</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                <p className="text-sm text-[#64748B]">No businesses match your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {filtered.map((biz, i) => {
                  const tier = biz.qualification.tier as Tier
                  const cfg = TIER_CONFIG[tier]
                  const isSelected = biz.id === selectedId
                  return (
                    <motion.div
                      key={biz.id}
                      id={`biz-${biz.id}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.6) }}
                      onClick={() => setSelectedId(isSelected ? null : biz.id)}
                      className={`px-4 py-3 cursor-pointer transition-all ${
                        isSelected ? "bg-[#EAF2FA] border-l-2 border-[#1B6EB7]" : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: cfg.color }}
                        >
                          {biz.qualification.score.toFixed(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-semibold text-[#0F1B2D] leading-tight truncate">{biz.name}</p>
                            <ChevronRight className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform ${isSelected ? "rotate-90" : ""}`} />
                          </div>
                          <p className="text-xs text-[#64748B] truncate">{biz.address}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <TierBadge tier={tier} score={biz.qualification.score} />
                            <span className="text-[11px] text-[#94A3B8]">{biz.distanceMiles}mi</span>
                            {biz.googleRating > 0 && (
                              <span className="flex items-center gap-0.5 text-[11px] text-[#94A3B8]">
                                <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                                {biz.googleRating}
                              </span>
                            )}
                          </div>

                          {/* Expanded detail */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 space-y-1.5 border-t border-[#E5ECF4] mt-2">
                                  <p className="text-[11px] text-[#475569] italic">{biz.qualification.reasonForScore}</p>
                                  <p className="text-[11px] font-semibold text-[#0F4C81]">
                                    Next: {biz.qualification.nextAction}
                                  </p>
                                  <p className="text-[11px] text-[#64748B]">
                                    Decision-maker: <span className="font-medium text-[#0F1B2D]">{biz.qualification.decisionMakerTitle}</span>
                                  </p>
                                  <p className="text-[11px] text-[#64748B]">
                                    Est. room nights: <span className="font-medium text-[#0F1B2D]">{biz.qualification.annualRoomNights}/yr · {biz.qualification.estimatedRevenue}</span>
                                  </p>
                                  <div className="flex gap-2 pt-1">
                                    {biz.phone && (
                                      <a href={`tel:${biz.phone}`} className="flex items-center gap-1 text-[11px] text-[#1B6EB7] hover:underline font-medium">
                                        <Phone className="h-3 w-3" /> Call
                                      </a>
                                    )}
                                    {biz.website && (
                                      <a href={`https://${biz.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-[#1B6EB7] hover:underline font-medium">
                                        <Globe className="h-3 w-3" /> Website
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Map (hidden on mobile until results panel) */}
        <div className="hidden sm:block flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
          <BackyardMap
            businesses={scanned ? filtered : []}
            radiusMiles={radiusMiles}
            selectedId={selectedId}
            onSelect={handleSelect}
          />

          {/* Tier legend overlay */}
          {scanned && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-[#DCE5EF] px-3 py-2.5 flex flex-col gap-1.5">
              {(["Hot", "Warm", "Cold", "Disqualified"] as Tier[]).map((tier) => (
                <div key={tier} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: TIER_CONFIG[tier].color }} />
                  <span className="text-[11px] font-semibold text-[#0F1B2D]">{tier}</span>
                  <span className="text-[11px] text-[#64748B] ml-auto pl-3">{tierCounts[tier]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
