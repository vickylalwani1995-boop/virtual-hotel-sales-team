import { HotelInput } from "@/components/HotelInput";
import { TrustBar } from "@/components/TrustBar";
import { TeamPreview } from "@/components/TeamPreview";

export default function Home() {
  return (
    <>
      <section className="bg-hero relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-700">
            <p className="eyebrow">Introducing my Sales TEAM AI</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[64px] leading-[1.05] text-mhsp-navy mt-5">
              Your virtual hotel sales department,
              <br />
              <span className="italic text-mhsp-gold">powered by AI.</span>
            </h1>
            <p className="text-lg sm:text-xl text-mhsp-muted mt-6 max-w-2xl mx-auto leading-relaxed">
              11 specialist agents. One Director of Sales. Built on the MHSP
              method. Trusted by independent and boutique hotels across America.
            </p>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-mhsp-navy/60 mt-6">
              Powered by My Hospitality Sales Pro × Inntelligent CRM
            </p>
          </div>

          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <HotelInput />
          </div>

          <TrustBar />
        </div>
      </section>

      <TeamPreview />
    </>
  );
}
