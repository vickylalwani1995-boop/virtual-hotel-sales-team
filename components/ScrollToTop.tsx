"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Forces every route change to render scrolled to the top.
 *
 * Why this is more aggressive than a simple effect:
 *  - Disables the browser's automatic scroll restoration (which
 *    otherwise overrides any window.scrollTo we run).
 *  - Defers the scroll into the next animation frame so it lands
 *    AFTER React commits AND AFTER the browser has had a chance
 *    to apply its own restore (we win because we run last).
 *  - Hits both window AND document.documentElement / body to cover
 *    different scroll containers across browsers.
 *  - Skipped only when the URL has a real hash so #anchor links
 *    still work.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  // One-time on mount: take ownership of scroll restoration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Snap to top on every pathname change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    const snap = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    // Run twice: once immediately, once on the next frame, so we
    // beat any late browser restore.
    snap();
    const raf = requestAnimationFrame(snap);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
