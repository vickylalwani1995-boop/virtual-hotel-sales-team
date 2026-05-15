"use client"

import {
  Database, Zap, Search, Layers, PhoneCall, Send,
  Building2, Settings2, Cloud, Mail, Phone, GitBranch,
  Mic, MapPin, Briefcase, type LucideProps,
} from "lucide-react"
import { type Connector, type ConnectorStatus } from "@/lib/connectors"

type IconName = string
type IconComponent = React.ComponentType<LucideProps>

const ICON_MAP: Record<string, IconComponent> = {
  Database, Zap, Search, Layers, PhoneCall, Send,
  Building2, Settings2, Cloud, Mail, Phone, GitBranch,
  Mic, MapPin, Briefcase,
}

const CATEGORY_BADGE: Record<string, string> = {
  "Data Provider":        "bg-blue-50 text-blue-700 border-blue-200",
  "CRM & Outreach":       "bg-orange-50 text-orange-700 border-orange-200",
  "Calling & Telephony":  "bg-red-50 text-red-700 border-red-200",
  "Intelligence":         "bg-purple-50 text-purple-700 border-purple-200",
}

interface ConnectorCardProps {
  connector: Connector
  effectiveStatus: ConnectorStatus
  onConnect: (connector: Connector) => void
  onConfigure: (connector: Connector) => void
}

export function ConnectorCard({ connector, effectiveStatus, onConnect, onConfigure }: ConnectorCardProps) {
  const isConnected = effectiveStatus === "connected"
  const isFeatured  = connector.featured
  const IconComp    = ICON_MAP[connector.icon as IconName] ?? Database

  const leftBorder = isFeatured
    ? "border-l-[#D4A537]"
    : isConnected
      ? "border-l-green-500"
      : "border-l-[#DCE5EF]"

  return (
    <div
      className={`relative bg-white rounded-xl border border-[#E2E8F0] border-l-4 ${leftBorder} shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-3`}
    >
      {/* Status badge — top right */}
      <div className="absolute top-4 right-4">
        {isConnected ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium bg-[#F8FAFC] text-[#5A6B82] border border-[#DCE5EF] px-2 py-0.5 rounded-full">
            Available
          </span>
        )}
      </div>

      {/* Icon + name */}
      <div className="flex items-center gap-3 pr-24">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: connector.color + "18" }}
        >
          <IconComp className="h-5 w-5" style={{ color: connector.color }} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#0F1B2D] text-sm leading-tight truncate">{connector.name}</p>
          {isFeatured && (
            <span className="text-[10px] font-bold text-[#D4A537] uppercase tracking-wide">Featured Partner</span>
          )}
        </div>
      </div>

      {/* Category badge */}
      <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_BADGE[connector.category] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
        {connector.category}
      </span>

      {/* Description */}
      <p className="text-sm text-[#5A6B82] leading-snug">{connector.description}</p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1">
        {connector.capabilities.map((cap) => (
          <span key={cap} className="text-[11px] bg-[#EAF2FA] text-[#0F4C81] px-2 py-0.5 rounded-md">
            {cap}
          </span>
        ))}
      </div>

      {/* Pricing + action */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
        <span className="text-[11px] text-[#5A6B82] truncate">{connector.pricing}</span>
        {isConnected ? (
          <button
            onClick={() => onConfigure(connector)}
            className="shrink-0 text-xs font-semibold text-[#0F4C81] hover:text-[#1B6EB7] border border-[#DCE5EF] hover:border-[#1B6EB7] px-3 py-1.5 rounded-lg transition-colors"
          >
            Configure
          </button>
        ) : (
          <button
            onClick={() => onConnect(connector)}
            className="shrink-0 text-xs font-semibold text-white bg-[#D4A537] hover:bg-[#B8922E] px-3 py-1.5 rounded-lg transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  )
}
