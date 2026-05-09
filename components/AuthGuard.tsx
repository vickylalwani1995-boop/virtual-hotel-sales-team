"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [status, setStatus] = useState<"checking" | "ok" | "redirecting">(
    "checking"
  );

  useEffect(() => {
    const authed = isLoggedIn();
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) {
      if (authed && pathname === "/login") {
        setStatus("redirecting");
        router.replace("/");
        return;
      }
      setStatus("ok");
      return;
    }

    if (!authed) {
      setStatus("redirecting");
      router.replace("/login");
      return;
    }
    setStatus("ok");
  }, [pathname, router]);

  if (status !== "ok") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mhsp-cream">
        <div className="h-8 w-8 rounded-full border-2 border-mhsp-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
