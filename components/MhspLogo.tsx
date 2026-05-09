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
          color: variant === "white" ? "#FFFFFF" : "#0F4C81",
        }}
      >
        my <span className="italic">Hospitality</span>{" "}
        <span style={{ color: variant === "white" ? "#FFFFFF" : "#1B6EB7" }}>
          Sales Pro
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/mhsp-logo.png"
      alt="My Hospitality Sales Pro"
      width={Math.round(height * 3.62)}
      height={height}
      className={className}
      style={{ height, width: "auto", objectFit: "contain" }}
      onError={() => setErrored(true)}
      priority
      quality={95}
    />
  );
}

export function InntelligentBadge({
  className = "",
  height = 22,
}: {
  className?: string;
  height?: number;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[14px] font-medium tracking-wide text-mhsp-muted ${className}`}
      >
        <span className="text-mhsp-gold">&amp;</span>
        <span className="font-display italic text-mhsp-navy">Inntelligent CRM</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-mhsp-gold text-[14px]">&amp;</span>
      <Image
        src="/inntelligent-crm-logo.png"
        alt="Inntelligent CRM"
        width={Math.round(height * 4.365)}
        height={height}
        style={{ height, width: "auto", objectFit: "contain" }}
        onError={() => setErrored(true)}
        quality={95}
      />
    </span>
  );
}
