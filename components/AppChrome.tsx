"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Concierge } from "@/components/Concierge";
import { AuthGuard } from "@/components/AuthGuard";
import { WelcomeOverlay } from "@/components/WelcomeOverlay";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isLogin = pathname === "/login";

  if (isLogin) {
    return (
      <AuthGuard>
        <div className="flex-1 flex flex-col">{children}</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Nav />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      <Suspense fallback={null}>
        <Concierge />
      </Suspense>
      <WelcomeOverlay />
    </AuthGuard>
  );
}
