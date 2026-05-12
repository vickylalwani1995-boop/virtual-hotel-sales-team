"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * WHY this component exists separately:
 *
 * useLenis() must be called inside a child of <ReactLenis> — it reads
 * from the LenisContext that ReactLenis provides. We can't call it in
 * LenisProvider itself because that's the component that renders
 * <ReactLenis>, so the context isn't available yet at that level.
 *
 * WHY stop() before scrollTo():
 *
 * Lenis runs a continuous requestAnimationFrame loop (managed by
 * ReactLenis). Between the moment the URL changes and when our
 * useEffect fires (after React renders), Lenis fires 2-5 RAF frames
 * and re-animates toward targetScroll from the previous page. Calling
 * lenis.stop() synchronously sets isStopped=true so the next RAF
 * returns immediately — Lenis can't fight our reset. We then set
 * every scroll position to 0 and call lenis.start() in the following
 * frame to re-enable smooth scroll on the new page.
 */
function ScrollResetter() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    // scrollTo({ immediate: true }) resets all Lenis internal state
    // (targetScroll, animatedScroll, actualScroll → 0, isScrolling → false)
    // without ever calling stop(), so Lenis stays running and can't get
    // permanently stuck blocking wheel events via onVirtualScroll.
    lenis?.scrollTo(0, { immediate: true });

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, lenis]);

  return null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        // Belt-and-suspenders: on link click Lenis calls this.reset()
        // which clears isScrolling and velocity before navigation fires.
        stopInertiaOnNavigate: true,
        // Return true = let native scroll happen (don't intercept).
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
      <ScrollResetter />
      {children}
    </ReactLenis>
  );
}
