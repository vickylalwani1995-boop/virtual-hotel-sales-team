import { HotelInput } from "@/components/HotelInput";
import { TrustBar } from "@/components/TrustBar";
import { TeamPreview } from "@/components/TeamPreview";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <>
      <section className="bg-hero relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="eyebrow">Introducing my Sales TEAM AI</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[64px] leading-[1.05] text-mhsp-navy mt-5">
              Synergistic Selling.
              <br />
              <span className="italic text-mhsp-gold">On autopilot.</span>
            </h1>
            <p className="text-lg sm:text-xl text-mhsp-muted mt-6 max-w-3xl mx-auto leading-relaxed">
              The MHSP dual funnel — calculated + hustle — built into{" "}
              <span className="font-semibold text-mhsp-navy">11 AI sales agents</span>.
              They work your big accounts <span className="italic">and</span> your
              backyard market, every single day.{" "}
              <span className="font-semibold text-mhsp-navy">Explosive revenues. No fear.</span>
            </p>
            <p className="text-sm font-semibold tracking-[0.16em] uppercase text-mhsp-navy/60 mt-6">
              Powered by My Hospitality Sales Pro &amp; Inntelligent CRM
            </p>
          </div>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <HotelInput />
          </div>

          <p className="text-center text-xs text-mhsp-muted/80 mt-6 max-w-3xl mx-auto px-6 leading-relaxed">
            Built on the MHSP method. The 6th service in the my Sales family — joining{" "}
            <span className="font-semibold text-mhsp-navy">my Sales LEADER</span>,{" "}
            <span className="font-semibold text-mhsp-navy">PRO</span>,{" "}
            <span className="font-semibold text-mhsp-navy">TRAINING</span>,{" "}
            <span className="font-semibold text-mhsp-navy">BLITZ</span>, and{" "}
            <span className="font-semibold text-mhsp-navy">Social Media</span>.
          </p>

          <TrustBar />
        </div>
      </section>

      <HowItWorks />

      <TeamPreview />
    </>
  );
}
