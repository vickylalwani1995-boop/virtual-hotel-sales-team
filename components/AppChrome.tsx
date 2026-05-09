"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Concierge } from "@/components/Concierge";
import { AuthGuard } from "@/components/AuthGuard";
import { ScrollToTop } from "@/components/ScrollToTop";

const CHROMELESS_ROUTES = ["/login"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isChromeless = CHROMELESS_ROUTES.includes(pathname);

  if (isChromeless) {
    return (
      <AuthGuard>
        <ScrollToTop />
        <div className="flex-1 flex flex-col">{children}</div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ScrollToTop />
      <Nav />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      <Suspense fallback={null}>
        <Concierge />
      </Suspense>
    </AuthGuard>
  );
}
