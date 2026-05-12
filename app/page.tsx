import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  Crosshair,
  ShieldCheck,
  Clock,
  Lock,
  Target,
  Building2,
  Landmark,
  CreditCard,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import { HotelInput } from "@/components/HotelInput";
import { TrustBar } from "@/components/TrustBar";
import { TeamPreview } from "@/components/TeamPreview";
import { HowItWorks } from "@/components/HowItWorks";
import { AGENTS, type Agent } from "@/lib/agents";
import { iconForAgent } from "@/lib/agent-icons";

export default function Home() {
  // Pre-sort agents into the two funnels for the hero constellation visual
  const calculated = AGENTS.filter((a) => a.funnel === "calculated");
  const hustle = AGENTS.filter((a) => a.funnel === "hustle");

  return (
    <>
      {/* ============= HERO ============= */}
      <section className="relative overflow-hidden">
        {/* Background - soft cream wash + corner glows */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 600px at 12% 8%, rgba(47,143,204,0.10), transparent 60%), radial-gradient(800px 600px at 92% 102%, rgba(15,76,129,0.10), transparent 65%), linear-gradient(180deg, #FCFDFE 0%, #F1F5FA 100%)",
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,76,129,0.7) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
            {/* LEFT - copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white/70 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Introducing my Sales TEAM AI
              </span>

              <h1 className="font-heading mt-6 text-[40px] sm:text-[52px] lg:text-[64px] xl:text-[72px] leading-[1.02] font-bold tracking-tight text-mhsp-navy">
                Synergistic Selling.
                <br />
                <span className="gradient-italic bg-gradient-to-r from-[#1B6EB7] to-[#2F8FCC] bg-clip-text text-transparent italic">
                  On autopilot.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg lg:text-xl text-mhsp-muted leading-relaxed max-w-xl">
                The MHSP dual funnel - calculated{" "}
                <span className="text-mhsp-navy font-semibold">+</span> hustle -
                built into{" "}
                <span className="font-semibold text-mhsp-navy">
                  11 AI sales agents
                </span>
                . Working your big accounts{" "}
                <span className="italic">and</span> your backyard market, every
                single day.
              </p>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <StatPill
                  icon={<Sparkles className="h-4 w-4" />}
                  value="11"
                  label="AI Agents"
                />
                <StatPill
                  icon={<Target className="h-4 w-4" />}
                  value="2"
                  label="Funnels"
                />
                <StatPill
                  icon={<TrendingUp className="h-4 w-4" />}
                  value="1,200+"
                  label="Hotels"
                />
                <StatPill
                  icon={<Zap className="h-4 w-4" />}
                  value="60s"
                  label="Setup"
                />
              </div>

              {/* CTA row */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="#start"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6EB7] hover:bg-[#0F4C81] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_24px_-10px_rgba(27,110,183,0.5)] hover:shadow-[0_14px_32px_-10px_rgba(15,76,129,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  Start Free Setup
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/agents"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white hover:bg-[#F4F8FC] text-mhsp-navy px-7 py-3.5 text-sm font-semibold tracking-wide transition-all"
                >
                  Meet the Team
                </Link>
              </div>

              {/* Powered by */}
              <p className="mt-7 text-sm font-semibold tracking-[0.16em] uppercase text-mhsp-navy/60">
                Powered by My Hospitality Sales Pro &amp; Inntelligent CRM
              </p>
            </div>

            {/* RIGHT - agent constellation */}
            <div className="relative lg:pl-4 mt-2 lg:mt-0">
              <AgentConstellation
                calculated={calculated}
                hustle={hustle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============= GET STARTED (hotel input) ============= */}
      <section
        id="start"
        className="relative overflow-hidden border-t border-[#E5ECF4]"
      >
        {/* Soft section background - subtle warm cream so the form pops */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 500px at 50% -20%, rgba(47,143,204,0.06), transparent 65%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Heading block */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5ECF4] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-[#1B6EB7] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Get started
            </span>
            <h2 className="font-heading mt-5 text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-mhsp-navy">
              Tell us about your hotel.
            </h2>
            <p className="mt-5 text-base sm:text-lg lg:text-[19px] text-mhsp-muted leading-relaxed">
              Paste a quick profile. Eleven specialist agents read it once and
              start working - your big-revenue corporate accounts{" "}
              <span className="text-mhsp-navy font-semibold italic">and</span>{" "}
              your backyard market, immediately.
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center sm:justify-center gap-2.5 sm:gap-3">
              <TrustBadge
                icon={<Zap className="h-4 w-4" />}
                label="60-second setup"
              />
              <TrustBadge
                icon={<Lock className="h-4 w-4" />}
                label="Your data stays private"
              />
              <TrustBadge
                icon={<ShieldCheck className="h-4 w-4" />}
                label="No credit card"
              />
              <TrustBadge
                icon={<Clock className="h-4 w-4" />}
                label="Cancel anytime"
              />
            </div>
          </div>

          {/* The form */}
          <HotelInput />

          {/* Sub-copy line below form */}
          <p className="text-center mt-7 text-sm text-mhsp-muted/90">
            Used by independent &amp; boutique hotels in{" "}
            <span className="font-semibold text-mhsp-navy">all 50 states</span>
            . Built on the MHSP method,{" "}
            <span className="font-semibold text-mhsp-navy">
              trained by U.S. hospitality leaders
            </span>
            .
          </p>
        </div>
      </section>

      {/* ============= TRUST WALL (own section) ============= */}
      <TrustBar />

      {/* ============= HOW IT WORKS ============= */}
      <HowItWorks />

      {/* ============= ALL PROPERTY HISTORY ============= */}
      <section className="border-y border-[#E5ECF4] bg-[#F7FAFD]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE5EF] bg-white px-3 py-1.5 text-sm font-semibold tracking-[0.16em] uppercase text-[#1B6EB7] shadow-sm">
              <Building2 className="h-3.5 w-3.5" />
              All Property History
            </span>
            <h2 className="font-heading mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-mhsp-navy">
              Every property action in one timeline.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-mhsp-muted leading-relaxed">
              Track rate shifts, occupancy trends, campaign activity, and recent bookings across every managed property without jumping between tools.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <InfoCard
              icon={<Target className="h-5 w-5" />}
              title="Portfolio Snapshot"
              value="26 Properties"
              desc="Active across urban, airport, and resort segments."
            />
            <InfoCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="30-Day Performance"
              value="+11.8% Revenue"
              desc="Weekday pickup improved after dual-funnel execution."
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              title="Latest Updates"
              value="143 Events"
              desc="Bookings, outreach, and retention actions in one feed."
            />
          </div>
        </div>
      </section>

      {/* ============= BANK INTEGRATION ============= */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-10 items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE5EF] bg-[#F4F8FC] px-3 py-1.5 text-sm font-semibold tracking-[0.16em] uppercase text-[#0F4C81]">
                <Landmark className="h-3.5 w-3.5" />
                Bank Details Integration
              </span>
              <h2 className="font-heading mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-mhsp-navy">
                Built for finance-ready operations.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-mhsp-muted leading-relaxed">
                Connect banking rails securely to reconcile payouts, invoice settlements, and fee visibility alongside sales activity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BankCard
                icon={<CreditCard className="h-5 w-5" />}
                title="Account Linking"
                detail="Connect operating + escrow accounts with role-based access."
              />
              <BankCard
                icon={<BadgeCheck className="h-5 w-5" />}
                title="Verified Payouts"
                detail="Automated payout checks with daily reconciliation alerts."
              />
              <BankCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Security"
                detail="Encrypted tokens, audit logs, and permissioned workflows."
              />
              <BankCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Revenue Sync"
                detail="Map cash movement to each agent-generated opportunity."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============= TEAM PREVIEW ============= */}
      <TeamPreview />

      {/* ============= FINAL CTA ============= */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(800px 500px at 50% 0%, rgba(47,143,204,0.25), transparent 65%), linear-gradient(180deg, #0F4C81 0%, #07203B 100%)",
          }}
        />
        <div className="absolute inset-0 -z-10 opacity-[0.06] pointer-events-none">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-24 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-white/85">
            <Sparkles className="h-3.5 w-3.5" />
            Ready when you are
          </span>
          <h2 className="mt-6 font-heading text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            Deploy your AI sales department
            <br />
            <span className="bg-gradient-to-r from-white via-white to-[#7FB3DC] bg-clip-text text-transparent">
              in less than a minute.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            No sales team to hire. No CRM to wrangle. Eleven specialists, one
            Director, the entire MHSP method - already trained and ready to
            run.
          </p>

          {/* Bullets */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <Bullet text="Calculated funnel for big revenue" />
            <Bullet text="Hustle funnel for backyard wins" />
            <Bullet text="Live demos with one click" />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#start"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#F4F8FC] text-[#0F4C81] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.14em] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 transition-all"
            >
              Start Free Setup
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 text-sm font-semibold tracking-wide backdrop-blur-sm transition-all"
            >
              Browse Agents
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ----------------- helpers ----------------- */

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5ECF4] bg-white/70 backdrop-blur-sm px-3 py-2.5 flex items-center gap-2.5">
      <div className="shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white flex items-center justify-center shadow-[0_4px_10px_-4px_rgba(27,110,183,0.45)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-numeric font-bold text-mhsp-navy text-base leading-none">
          {value}
        </p>
        <p className="text-sm text-mhsp-muted leading-tight mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE5EF] bg-white px-3.5 py-2 text-sm font-semibold text-mhsp-navy shadow-[0_2px_8px_-4px_rgba(15,76,129,0.10)]">
      <span className="text-[#1B6EB7]">{icon}</span>
      {label}
    </span>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-[#7FB3DC] shrink-0 mt-0.5" />
      <span className="text-sm font-semibold text-white/95">{text}</span>
    </div>
  );
}

function AgentConstellation({
  calculated,
  hustle,
}: {
  calculated: readonly Agent[];
  hustle: readonly Agent[];
}) {
  return (
    <div className="relative">
      {/* Card frame */}
      <div className="relative bg-white/80 backdrop-blur-md rounded-[24px] border border-[#E5ECF4] shadow-[0_30px_80px_-30px_rgba(15,76,129,0.22),0_8px_24px_-8px_rgba(15,76,129,0.10)] overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2F8FCC] via-[#1B6EB7] to-[#0F4C81]" />

        <div className="p-5 sm:p-6">
          {/* Calculated funnel header */}
          <FunnelHeader
            icon={Crosshair}
            label="Calculated"
            sub="Big accounts. Long contracts."
            color="navy"
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {calculated.map((a) => (
              <AgentTile
                key={a.id}
                Icon={iconForAgent(a.id)}
                label={a.roleTitle}
                tone="navy"
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <span className="flex-1 h-px bg-[#E5ECF4]" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-mhsp-gold">
              Synergy
            </span>
            <span className="flex-1 h-px bg-[#E5ECF4]" />
          </div>

          {/* Hustle funnel header */}
          <FunnelHeader
            icon={Zap}
            label="Hustle"
            sub="Local. Grassroots. Fast."
            color="teal"
          />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hustle.map((a) => (
              <AgentTile
                key={a.id}
                Icon={iconForAgent(a.id)}
                label={a.roleTitle}
                tone="teal"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating "live" badge */}
      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 inline-flex items-center gap-1.5 rounded-full bg-mhsp-success text-white px-3 py-1.5 text-sm font-bold uppercase tracking-wider shadow-[0_8px_24px_-6px_rgba(21,128,61,0.5)]">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Live
      </div>
    </div>
  );
}

function FunnelHeader({
  icon: Icon,
  label,
  sub,
  color,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  color: "navy" | "teal";
}) {
  const tile =
    color === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-white shadow-[0_4px_10px_-4px_rgba(15,76,129,0.45)] ${tile}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <p className="font-bold text-sm tracking-[0.16em] uppercase text-mhsp-navy">
          {label}
        </p>
      </div>
      <p className="text-sm text-mhsp-muted truncate hidden sm:block">{sub}</p>
    </div>
  );
}

function AgentTile({
  Icon,
  label,
  tone,
}: {
  Icon: LucideIcon;
  label: string;
  tone: "navy" | "teal";
}) {
  const accentBorder =
    tone === "navy"
      ? "hover:border-mhsp-navy/40"
      : "hover:border-mhsp-teal/40";
  const tile =
    tone === "navy"
      ? "bg-gradient-to-br from-[#1E5896] to-[#0F4C81]"
      : "bg-gradient-to-br from-[#2F8FCC] to-[#1B6EB7]";
  return (
    <div
      className={`group flex flex-row sm:flex-col items-center gap-2.5 sm:gap-1.5 rounded-lg border border-[#E5ECF4] bg-white px-3 sm:px-2 py-2.5 sm:py-3 hover:-translate-y-0.5 transition-all ${accentBorder}`}
      title={label}
    >
      <span
        className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-[0_4px_10px_-4px_rgba(15,76,129,0.45)] ${tile}`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="text-sm font-semibold text-mhsp-navy/70 leading-tight text-left sm:text-center line-clamp-1 max-w-full flex-1 sm:flex-initial">
        {label}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5ECF4] bg-white p-5 shadow-[0_8px_24px_-14px_rgba(15,76,129,0.18)]">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2F8FCC] to-[#0F4C81] text-white flex items-center justify-center">
        {icon}
      </div>
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-mhsp-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold text-mhsp-navy">{value}</p>
      <p className="mt-2 text-sm text-mhsp-muted leading-relaxed">{desc}</p>
    </article>
  );
}

function BankCard({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5ECF4] bg-[#F9FBFE] p-5 hover:border-[#C7D9EC] transition-colors">
      <div className="h-10 w-10 rounded-lg bg-white border border-[#DCE5EF] text-[#1B6EB7] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-3 text-lg font-bold text-mhsp-navy">{title}</h3>
      <p className="mt-1.5 text-sm text-mhsp-muted leading-relaxed">{detail}</p>
    </article>
  );
}
