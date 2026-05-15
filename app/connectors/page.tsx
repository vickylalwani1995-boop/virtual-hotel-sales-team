"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Info, Plug, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import {
  CONNECTORS,
  type Connector,
  type ConnectorCategory,
  type ConnectorStatus,
  getEffectiveStatus,
  loadConnectorState,
  saveConnectorState,
} from "@/lib/connectors"
import { ConnectorCard } from "@/components/ConnectorCard"
import { ConnectorModal } from "@/components/ConnectorModal"
import { useDemoMode } from "@/lib/demo-mode"

type FilterTab = "All" | ConnectorCategory

const TABS: FilterTab[] = ["All", "Data Provider", "CRM & Outreach", "Calling & Telephony", "Intelligence"]

const TAB_COUNTS: Record<FilterTab, number> = {
  All: 15,
  "Data Provider": 6,
  "CRM & Outreach": 4,
  "Calling & Telephony": 3,
  Intelligence: 2,
}

export default function ConnectorsPage() {
  const [demo] = useDemoMode()
  const [overrides, setOverrides] = useState<Record<string, ConnectorStatus>>({})
  const [activeTab, setActiveTab] = useState<FilterTab>("All")
  const [modalConnector, setModalConnector] = useState<Connector | null>(null)

  useEffect(() => {
    setOverrides(loadConnectorState())
  }, [])

  const filtered = useMemo(() =>
    activeTab === "All"
      ? CONNECTORS
      : CONNECTORS.filter((c) => c.category === activeTab),
    [activeTab],
  )

  const connectedCount = useMemo(
    () => CONNECTORS.filter((c) => getEffectiveStatus(c, overrides, demo) === "connected").length,
    [overrides, demo],
  )

  function handleActivate(connectorId: string) {
    const next = { ...overrides, [connectorId]: "connected" as ConnectorStatus }
    setOverrides(next)
    saveConnectorState(next)
    toast.success("Connector activated", { description: `${CONNECTORS.find((c) => c.id === connectorId)?.name} is now connected.` })
  }

  const leadsThisWeek = demo ? 847 : 247
  const avgScore = demo ? 8.1 : 7.4

  return (
    <main className="min-h-screen bg-[#F4F8FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F4C81] tracking-tight">Connectors & Plugins</h1>
            <p className="mt-1 text-[#5A6B82] text-sm sm:text-base">
              Connect your data tools so the team has the best leads in market
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-sm font-bold px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {connectedCount} of 15 active
            </span>
          </div>
        </div>

        {/* ── INFO BANNER ── */}
        <div className="flex gap-3 bg-[#EAF2FA] border border-[#C9DAEB] rounded-xl px-4 py-3 mb-8 text-sm text-[#0F4C81]">
          <Info className="h-5 w-5 shrink-0 mt-0.5 text-[#1B6EB7]" />
          <p>
            <strong>How this works:</strong> The team&apos;s Lead Hunter (Marcus) pulls from connected sources.
            The Outbound Sales Manager (Sarah) runs sentiment qualification on every lead before outreach.
            The more sources you connect, the better the lead quality.
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#EAF2FA] flex items-center justify-center">
              <Plug className="h-5 w-5 text-[#1B6EB7]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F4C81]">{connectedCount}</p>
              <p className="text-xs text-[#5A6B82]">Active Connections</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#EAF2FA] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#1B6EB7]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F4C81]">{leadsThisWeek.toLocaleString()}</p>
              <p className="text-xs text-[#5A6B82]">Leads Scraped This Week</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#EAF2FA] flex items-center justify-center">
              <Target className="h-5 w-5 text-[#1B6EB7]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F4C81]">{avgScore} <span className="text-sm font-normal text-[#5A6B82]">/ 10</span></p>
              <p className="text-xs text-[#5A6B82]">Avg. Qualification Score</p>
            </div>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex gap-1 sm:gap-2 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all ${
                activeTab === tab
                  ? "bg-[#0F4C81] text-white border-[#0F4C81]"
                  : "bg-white text-[#5A6B82] border-[#DCE5EF] hover:border-[#0F4C81] hover:text-[#0F4C81]"
              }`}
            >
              {tab} ({TAB_COUNTS[tab]})
            </button>
          ))}
        </div>

        {/* ── CONNECTOR GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              effectiveStatus={getEffectiveStatus(connector, overrides, demo)}
              onConnect={setModalConnector}
              onConfigure={setModalConnector}
            />
          ))}
        </div>

        {/* ── FOOTER NOTE ── */}
        <p className="mt-10 text-center text-xs text-[#9CA3AF]">
          More integrations launching soon ·{" "}
          <Link href="/agents" className="text-[#1B6EB7] hover:underline">
            Talk to the Sales Team →
          </Link>
        </p>
      </div>

      {/* ── CONNECT MODAL ── */}
      {modalConnector && (
        <ConnectorModal
          connector={modalConnector}
          effectiveStatus={getEffectiveStatus(modalConnector, overrides, demo)}
          onClose={() => setModalConnector(null)}
          onActivate={handleActivate}
        />
      )}
    </main>
  )
}
