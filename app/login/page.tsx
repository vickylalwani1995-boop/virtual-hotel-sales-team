"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { isLoggedIn, signIn } from "@/lib/auth";
import { MhspLogo } from "@/components/MhspLogo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-redirect if already signed in
  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter a username and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    // Brief delay for the "real auth" feel
    setTimeout(() => {
      signIn(username);
      router.push("/");
    }, 600);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-hero relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_-20px_rgba(11,36,71,0.25)] border border-mhsp-line/60 overflow-hidden">
          {/* Logo */}
          <div className="px-8 pt-9 pb-6 text-center border-b border-mhsp-line/60">
            <div className="inline-flex">
              <MhspLogo height={52} />
            </div>
            <p className="eyebrow mt-5">my Sales TEAM AI</p>
            <h1 className="font-display text-[34px] leading-tight text-mhsp-navy mt-2">
              Welcome back
            </h1>
            <p className="text-[15px] text-mhsp-muted mt-1.5">
              Sign in to access your AI sales team
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-mhsp-muted">
                Username
              </label>
              <div className="mt-1.5 relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-mhsp-line text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 focus:border-mhsp-gold/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-mhsp-muted">
                Password
              </label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mhsp-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-mhsp-line text-mhsp-text placeholder:text-mhsp-muted/70 focus:outline-none focus:ring-2 focus:ring-mhsp-gold/30 focus:border-mhsp-gold/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}

            <p className="text-xs text-mhsp-muted bg-mhsp-cream-warm/60 border border-mhsp-line/60 rounded-lg px-3 py-2 leading-relaxed">
              <span className="font-semibold text-mhsp-navy">Demo credentials:</span>{" "}
              <span className="font-mono">test</span> /{" "}
              <span className="font-mono">test</span>
              <br />
              <span className="text-mhsp-muted/80">
                Any username and password works.
              </span>
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-mhsp-gold hover:bg-mhsp-gold-soft disabled:opacity-50 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-mhsp-navy shadow-[0_4px_14px_-4px_rgba(212,165,55,0.6)] transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-mhsp-muted pt-1">
              Powered by{" "}
              <span className="font-semibold text-mhsp-navy">
                My Hospitality Sales Pro
              </span>{" "}
              ×{" "}
              <span className="font-display italic text-mhsp-navy">
                Inntelligent CRM
              </span>
            </p>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-mhsp-cream-warm/40 border-t border-mhsp-line/60 text-[11px] text-mhsp-muted flex items-center justify-between">
            <span>© 2026 MHSP</span>
            <a
              href="tel:8889091678"
              className="inline-flex items-center gap-1 text-mhsp-navy font-medium hover:text-mhsp-gold transition-colors"
            >
              <Phone className="h-3 w-3" />
              888-909-1678
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
