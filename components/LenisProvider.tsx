"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { usePathname } from "next/navigation";

/**
 * Site-wide Lenis smooth-scroll wrapper.
 * - root: registers a global Lenis instance the rest of the app can use.
 * - duration / easing: tuned for a premium feel (not too slow, not snappy).
 * - syncTouch: true keeps the smooth feel on touch devices too.
 * - On every pathname change, jump to top instantly so each new page
 *   opens at the top (matches our ScrollToTop policy and beats Lenis's
 *   own inertia from the previous route).
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // Snap to top instantly on every route change, AFTER Lenis has set
  // itself up, so its inertia doesn't carry over.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    const snap = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    };
    snap();
    const raf = requestAnimationFrame(snap);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <ReactLenis
      root
      ref={(instance) => {
        // ReactLenis ref returns { lenis, ... } — we just want the instance.
        lenisRef.current = instance?.lenis ?? null;
      }}
      options={{
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // Return true = don't intercept; let the native scroll happen.
        // Without this, Lenis hijacks wheel events on inner containers
        // (modals, dropdowns, the Concierge sidebar, the leads table)
        // and the page appears "stuck" because Lenis is trying to scroll
        // a body that's locked, or scrolling the wrong axis.
        prevent: (node: Element) => {
          if (
            node.tagName === "TEXTAREA" ||
            node.tagName === "INPUT" ||
            node.tagName === "SELECT"
          ) {
            return true;
          }
          if (
            node instanceof HTMLElement &&
            node.hasAttribute("data-lenis-prevent")
          ) {
            return true;
          }
          // While a modal/drawer has locked body scroll, let wheel
          // events flow to inner overflow-auto containers natively.
          if (
            typeof document !== "undefined" &&
            document.body.style.overflow === "hidden"
          ) {
            return true;
          }
          return false;
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}
