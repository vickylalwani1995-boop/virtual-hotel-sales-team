import Image from "next/image";

const PARTNERS = [
  { src: "/partners/1.png", alt: "Hospitality partner" },
  { src: "/partners/2-1-1.png", alt: "Hospitality partner" },
  { src: "/partners/3.png", alt: "Hospitality partner" },
  { src: "/partners/hyatt.png", alt: "Hyatt" },
  { src: "/partners/4.png", alt: "Hospitality partner" },
  { src: "/partners/5.png", alt: "Hospitality partner" },
  { src: "/partners/6.png", alt: "Hospitality partner" },
];

export function TrustBar() {
  return (
    <section className="relative overflow-hidden">
      {/* Dark navy gradient - white logos read crisply against this */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 400px at 50% 0%, rgba(47,143,204,0.22), transparent 65%), linear-gradient(180deg, #0F4C81 0%, #07203B 100%)",
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="text-center mb-9 sm:mb-11">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm px-3 py-1.5 text-sm font-semibold tracking-[0.18em] uppercase text-white/85">
            Trusted by hospitality leaders
          </span>
          <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Independent and boutique hotels{" "}
            <span className="font-semibold text-white">
              across all 50 states
            </span>{" "}
            run on the MHSP method.
          </p>
        </div>

        <div className="trust-logo-row flex flex-nowrap items-center justify-start sm:justify-center gap-x-7 sm:gap-x-10 lg:gap-x-12 overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0 pb-1">
          {PARTNERS.map((p) => (
            <Image
              key={p.src}
              src={p.src}
              alt={p.alt}
              width={120}
              height={32}
              unoptimized
              className="shrink-0 h-6 sm:h-7 lg:h-8 w-auto opacity-90 hover:opacity-100 transition-opacity"
              style={{ imageRendering: "auto" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
