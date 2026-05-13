"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PlaybookEditor } from "@/components/PlaybookEditor";
import {
  type Playbook,
  createBlankPlaybook,
  getCustomPlaybooks,
  parsePlaybook,
} from "@/lib/playbooks";

function EditPlaybookContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isTemplate = searchParams?.get("template") === "true";
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id === "new") {
        setPlaybook(createBlankPlaybook());
        setLoading(false);
        return;
      }

      // Check custom playbooks first
      const custom = getCustomPlaybooks().find(
        (p) => p.metadata.agentId === id
      );
      if (custom) {
        setPlaybook(custom);
        setLoading(false);
        return;
      }

      // Try loading from server (default playbooks)
      try {
        const res = await fetch(`/api/playbooks?id=${id}&raw=true`);
        const data = await res.json();
        if (data.success && data.content) {
          const pb = parsePlaybook(data.content);
          if (isTemplate) {
            // Fork template: make it custom with new ID
            pb.metadata.agentId = `${id}_fork_${Date.now()}`;
            pb.metadata.isCustom = true;
            pb.metadata.status = "draft";
            pb.metadata.createdBy = "user";
            pb.metadata.createdAt = new Date().toISOString().split("T")[0];
          }
          setPlaybook(pb);
        }
      } catch {
        // Not found - create blank
        setPlaybook(createBlankPlaybook());
      }
      setLoading(false);
    }
    load();
  }, [id, isTemplate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <p className="text-[#6B7B8F]">Playbook not found.</p>
      </div>
    );
  }

  return (
    <PlaybookEditor playbook={playbook} isNew={id === "new" || isTemplate} />
  );
}

export default function EditPlaybookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
          <div className="h-8 w-8 rounded-full border-2 border-[#1B6EB7] border-t-transparent animate-spin" />
        </div>
      }
    >
      <EditPlaybookContent />
    </Suspense>
  );
}
