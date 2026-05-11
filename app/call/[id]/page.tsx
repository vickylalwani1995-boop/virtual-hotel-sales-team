"use client";

import { Suspense, use } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { getAgent } from "@/lib/agents";
import { CallSimulator } from "@/components/CallSimulator";

function CallPageInner({ id }: { id: string }) {
  const agent = getAgent(id);
  const searchParams = useSearchParams();
  const profileParam = searchParams.get("profile") ?? "";
  const profile =
    profileParam ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("vhst-hotel-profile") ?? ""
      : "");

  if (!agent) return notFound();

  return <CallSimulator agent={agent} hotelProfile={profile} />;
}

export default function CallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07203B] text-white">
          <div className="h-7 w-7 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CallPageInner id={id} />
    </Suspense>
  );
}
