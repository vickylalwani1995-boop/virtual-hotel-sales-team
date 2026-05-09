"use client";

import { StreamingOutput } from "@/components/StreamingOutput";

export function AgentOutput({
  output,
  animate = true,
  bare = false,
}: {
  output: string;
  animate?: boolean;
  bare?: boolean;
}) {
  if (bare) {
    return <StreamingOutput output={output} animate={animate} />;
  }
  return (
    <div className="bg-white rounded-2xl border border-mhsp-line p-7 sm:p-9 shadow-[0_2px_10px_-4px_rgba(11,36,71,0.06)]">
      <StreamingOutput output={output} animate={animate} />
    </div>
  );
}
