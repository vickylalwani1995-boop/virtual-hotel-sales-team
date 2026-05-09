const PARTNERS = [
  { name: "ASCENT", style: "tracking-[0.35em]" },
  { name: "Marquise", style: "italic font-display" },
  { name: "REGENT HOUSE", style: "tracking-[0.25em]" },
  { name: "Silvercrest", style: "italic font-display" },
  { name: "HARBOR &CO", style: "tracking-[0.3em]" },
];

export function TrustBar() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-6">
      <p className="text-center text-xs text-mhsp-muted/80 mb-6 font-medium tracking-wide">
        Trusted by independent and boutique hotels across America
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
        {PARTNERS.map((p) => (
          <span
            key={p.name}
            className={`text-mhsp-navy text-sm font-semibold ${p.style}`}
          >
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
