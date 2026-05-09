"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDemoMode, resetDemo } from "@/lib/demo-mode";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";

export function NavControls() {
  const [demo, setDemo] = useDemoMode();
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  function toggle() {
    const next = !demo;
    setDemo(next);
    toast.success(next ? "Demo Mode on - instant cached outputs" : "Demo Mode off");
  }

  function handleReset() {
    setResetting(true);
    resetDemo();
    toast.success("Demo reset - local data cleared");
    setTimeout(() => {
      setResetting(false);
      router.push("/");
      router.refresh();
    }, 200);
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/agents" className="text-muted-foreground hover:text-foreground">
        Team
      </Link>
      <Link href="/activity" className="text-muted-foreground hover:text-foreground">
        Activity
      </Link>
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium transition-colors ${
          demo
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Toggle Demo Mode (instant cached responses)"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            demo ? "bg-emerald-500" : "bg-muted-foreground/40"
          }`}
        />
        <Sparkles className="h-3 w-3" />
        Demo Mode
      </button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        disabled={resetting}
        title="Clear localStorage and return home"
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        Reset
      </Button>
    </div>
  );
}
