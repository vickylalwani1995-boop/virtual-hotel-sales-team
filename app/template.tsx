"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Next.js App Router re-mounts template.tsx on every route change
 * (unlike layout.tsx which is preserved), so this is the right place
 * for page-transition animations.
 *
 * 200ms fade-in + slight slide-up. Key off pathname so framer-motion
 * sees a fresh tree on each navigation and animates accordingly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
