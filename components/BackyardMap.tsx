"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { FeatureBusiness } from "@/lib/backyard-types"
import { HOTEL_LAT, HOTEL_LNG, HOTEL_NAME, getTierColor, type Tier } from "@/lib/maps-scraper"

interface BackyardMapProps {
  businesses: FeatureBusiness[]
  radiusMiles: number
  selectedId: string | null
  onSelect: (id: string) => void
}

// Miles → meters for Leaflet circle
const MILES_TO_METERS = 1609.344

export function BackyardMap({ businesses, radiusMiles, selectedId, onSelect }: BackyardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map())
  const circleRef = useRef<import("leaflet").Circle | null>(null)
  const hotelMarkerRef = useRef<import("leaflet").Marker | null>(null)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      const L = (await import("leaflet")).default

      const map = L.map(containerRef.current!, {
        center: [HOTEL_LAT, HOTEL_LNG],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Hotel pin
      const hotelIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:linear-gradient(135deg,#0F4C81,#1B6EB7);
          border:3px solid #D4A537;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px rgba(15,76,129,0.5);
          color:white;font-size:16px;cursor:default;
        ">🏨</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const hotelMarker = L.marker([HOTEL_LAT, HOTEL_LNG], { icon: hotelIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`<strong>${HOTEL_NAME}</strong><br/>Your property`, { offset: [0, -18] })

      hotelMarkerRef.current = hotelMarker

      // Radius circle
      const circle = L.circle([HOTEL_LAT, HOTEL_LNG], {
        radius: radiusMiles * MILES_TO_METERS,
        color: "#D4A537",
        weight: 2,
        opacity: 0.8,
        fillColor: "#D4A537",
        fillOpacity: 0.08,
      }).addTo(map)

      circleRef.current = circle
      mapRef.current = map
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
      circleRef.current = null
      hotelMarkerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update radius circle
  useEffect(() => {
    circleRef.current?.setRadius(radiusMiles * MILES_TO_METERS)
  }, [radiusMiles])

  // Sync business markers
  useEffect(() => {
    if (!mapRef.current) return

    async function syncMarkers() {
      const L = (await import("leaflet")).default
      const map = mapRef.current!
      const existing = markersRef.current

      const incomingIds = new Set(businesses.map((b) => b.id))

      // Remove stale
      for (const [id, marker] of existing) {
        if (!incomingIds.has(id)) {
          marker.remove()
          existing.delete(id)
        }
      }

      // Add / update
      for (const biz of businesses) {
        const color = getTierColor(biz.qualification.tier as Tier)
        const isSelected = biz.id === selectedId
        const score = biz.qualification.score.toFixed(1)

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${isSelected ? 36 : 28}px;
            height:${isSelected ? 36 : 28}px;
            border-radius:50%;
            background:${color};
            border:${isSelected ? "3px solid white" : "2px solid white"};
            display:flex;align-items:center;justify-content:center;
            box-shadow:${isSelected ? `0 0 0 3px ${color}` : "0 2px 6px rgba(0,0,0,0.3)"};
            color:white;font-size:${isSelected ? 11 : 9}px;font-weight:700;
            cursor:pointer;transition:all 0.15s;
          ">${score}</div>`,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [(isSelected ? 36 : 28) / 2, (isSelected ? 36 : 28) / 2],
        })

        if (existing.has(biz.id)) {
          const m = existing.get(biz.id)!
          m.setIcon(icon)
        } else {
          const marker = L.marker([biz.lat, biz.lng], { icon })
            .addTo(map)
            .bindPopup(
              `<div style="min-width:180px;">
                <p style="font-weight:700;font-size:13px;margin:0 0 4px">${biz.name}</p>
                <p style="font-size:11px;color:#64748B;margin:0 0 6px">${biz.address}</p>
                <div style="display:flex;gap:6px;align-items:center">
                  <span style="background:${color};color:white;border-radius:12px;padding:1px 8px;font-size:11px;font-weight:700">
                    ${biz.qualification.tier} · ${score}
                  </span>
                  <span style="font-size:11px;color:#64748B">${biz.distanceMiles}mi</span>
                </div>
                <p style="font-size:11px;color:#0F4C81;margin:6px 0 0;font-style:italic">${biz.qualification.nextAction}</p>
              </div>`,
              { offset: [0, -(isSelected ? 18 : 14)] },
            )

          marker.on("click", () => onSelect(biz.id))
          existing.set(biz.id, marker)
        }
      }
    }

    syncMarkers()
  }, [businesses, selectedId, onSelect])

  // Pan to selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const biz = businesses.find((b) => b.id === selectedId)
    if (!biz) return
    mapRef.current.panTo([biz.lat, biz.lng], { animate: true, duration: 0.5 })
    markersRef.current.get(selectedId)?.openPopup()
  }, [selectedId, businesses])

  return <div ref={containerRef} className="w-full h-full" />
}
