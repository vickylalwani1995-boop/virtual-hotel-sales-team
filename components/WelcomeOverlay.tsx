"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { consumeWelcomeFlag, getUser } from "@/lib/auth";
import { AGENTS } from "@/lib/agents";
import { MhspLogo } from "@/components/MhspLogo";

export function WelcomeOverlay() {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (consumeWelcomeFlag()) {
      const u = getUser();
      setUsername(u?.username ?? "");
      setShow(true);
      const t = setTimeout(() => setShow(false), 2800);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] bg-mhsp-navy text-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle gold pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_30%,rgba(212,165,55,0.18),transparent_55%)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[80%] bg-[radial-gradient(circle_at_50%_80%,rgba(25,167,206,0.12),transparent_55%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <MhspLogo height={48} variant="white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl text-white text-center"
          >
            Welcome
            {username ? (
              <>
                ,{" "}
                <span className="italic text-mhsp-gold">
                  {username}
                </span>
              </>
            ) : null}
            !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-4 text-mhsp-gold text-lg font-medium"
          >
            Your AI sales team is ready
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-3xl px-6"
          >
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.5, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 1.3 + i * 0.08,
                  ease: "backOut",
                }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-2xl sm:text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                  {a.icon}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold hidden sm:block">
                  {a.name.replace(/\s+Agent$/i, "").split(" ").slice(0, 2).join(" ")}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 2.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/40 tracking-widest uppercase"
          >
            Powered by My Hospitality Sales Pro × Inntelligent CRM
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
