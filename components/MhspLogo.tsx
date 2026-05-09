"use client";

import { useState } from "react";
import Image from "next/image";

export function MhspLogo({
  height = 40,
  className = "",
  variant = "color",
}: {
  height?: number;
  className?: string;
  variant?: "color" | "white";
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <span
        className={`font-display leading-none ${className}`}
        style={{
          fontSize: height * 0.45,
          color: variant === "white" ? "#FFFFFF" : "#0B2447",
        }}
      >
        my <span className="italic">Hospitality</span>{" "}
        <span style={{ color: variant === "white" ? "#FFFFFF" : "#D4A537" }}>
          Sales Pro
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/mhsp-logo.png"
      alt="My Hospitality Sales Pro"
      width={height * 3.5}
      height={height}
      className={className}
      style={{ height, width: "auto", objectFit: "contain" }}
      onError={() => setErrored(true)}
      priority
    />
  );
}

export function InntelligentBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-mhsp-muted ${className}`}
    >
      <span className="text-mhsp-gold">×</span>
      <span className="font-display italic text-mhsp-navy">Inntelligent CRM</span>
    </span>
  );
}
