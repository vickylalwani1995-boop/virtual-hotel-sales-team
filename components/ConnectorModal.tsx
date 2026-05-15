"use client"

import { useState } from "react"
import {
  X, CheckCircle2, Loader2, AlertCircle,
  Database, Zap, Search, Layers, PhoneCall, Send,
  Building2, Settings2, Cloud, Mail, Phone, GitBranch,
  Mic, MapPin, Briefcase, type LucideProps,
} from "lucide-react"
import { type Connector, type ConnectorStatus } from "@/lib/connectors"

type IconComponent = React.ComponentType<LucideProps>
const ICON_MAP: Record<string, IconComponent> = {
  Database, Zap, Search, Layers, PhoneCall, Send,
  Building2, Settings2, Cloud, Mail, Phone, GitBranch,
  Mic, MapPin, Briefcase,
}

interface ConnectorModalProps {
  connector: Connector
  effectiveStatus: ConnectorStatus
  onClose: () => void
  onActivate: (connectorId: string) => void
}

export function ConnectorModal({ connector, effectiveStatus, onClose, onActivate }: ConnectorModalProps) {
  const IconComp   = ICON_MAP[connector.icon] ?? Database
  const isAlreadyConnected = effectiveStatus === "connected"

  const [apiKey, setApiKey]       = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [interval, setInterval]   = useState("daily")
  const [testing, setTesting]     = useState(false)
  const [tested, setTested]       = useState(false)
  const [apiKeyError, setApiKeyError] = useState("")

  function handleTest() {
    // Already connected — skip validation, go straight to success
    if (isAlreadyConnected) {
      setTesting(true)
      setTimeout(() => { setTesting(false); setTested(true) }, 1500)
      return
    }

    // Not connected — require API key
    if (!apiKey.trim()) {
      setApiKeyError("API Key is required to test the connection.")
      return
    }

    setApiKeyError("")
    setTesting(true)
    setTimeout(() => { setTesting(false); setTested(true) }, 1500)
  }

  function handleActivate() {
    // Already connected — no validation needed
    if (isAlreadyConnected) {
      onActivate(connector.id)
      onClose()
      return
    }

    // Not connected — require API key before activating
    if (!apiKey.trim()) {
      setApiKeyError("Please enter your API Key before activating.")
      return
    }

    setApiKeyError("")
    onActivate(connector.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F1B2D]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: connector.color + "18" }}
            >
              <IconComp className="h-5 w-5" style={{ color: connector.color }} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-bold text-[#0F1B2D] text-base">{connector.name}</h2>
              <p className="text-xs text-[#5A6B82]">{connector.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#5A6B82] hover:bg-[#F4F8FC] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Already-connected notice */}
          {isAlreadyConnected && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <p className="text-xs font-semibold text-green-700">
                This connector is active. You can reconfigure or test the connection below.
              </p>
            </div>
          )}

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">
              API Key / Access Token
              {!isAlreadyConnected && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type="password"
              placeholder={isAlreadyConnected ? "••••••••••••••••••• (leave blank to keep existing)" : "sk-••••••••••••••••••••"}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setApiKeyError("") }}
              className={`w-full text-sm border rounded-lg px-3 py-2.5 text-[#0F1B2D] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition ${
                apiKeyError
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                  : "border-[#DCE5EF] focus:border-[#1B6EB7] focus:ring-[#1B6EB7]/20"
              }`}
            />
            {apiKeyError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {apiKeyError}
              </div>
            )}
          </div>

          {/* Subdomain */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">
              Subdomain <span className="text-[#9CA3AF] font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="yourcompany"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="w-full text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 text-[#0F1B2D] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/20 transition"
            />
          </div>

          {/* Refresh Interval */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide">
              Refresh Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full text-sm border border-[#DCE5EF] rounded-lg px-3 py-2.5 text-[#0F1B2D] focus:outline-none focus:border-[#1B6EB7] focus:ring-2 focus:ring-[#1B6EB7]/20 transition bg-white"
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* Test Connection */}
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#DCE5EF] text-sm font-semibold text-[#0F4C81] hover:bg-[#EAF2FA] transition-colors disabled:opacity-60"
          >
            {testing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Testing connection…</>
            ) : tested ? (
              <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700">Connected successfully</span></>
            ) : (
              "Test Connection"
            )}
          </button>

          {/* Save & Activate */}
          <button
            onClick={handleActivate}
            className="w-full py-2.5 rounded-lg bg-[#0F4C81] hover:bg-[#1B6EB7] text-white text-sm font-bold transition-colors"
          >
            {isAlreadyConnected ? "Save Changes" : "Save & Activate"}
          </button>

          <p className="text-center text-[11px] text-[#9CA3AF]">
            Demo mode — connection simulated. Production deployment uses real OAuth + API keys.
          </p>
        </div>
      </div>
    </div>
  )
}
