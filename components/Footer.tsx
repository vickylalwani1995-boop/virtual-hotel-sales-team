import Link from "next/link";
import { Phone } from "lucide-react";
import { MhspLogo } from "@/components/MhspLogo";

const SERVICES = [
  { name: "my Sales LEADER" },
  { name: "my Sales PRO" },
  { name: "my Sales TRAINING" },
  { name: "my Sales BLITZ" },
  { name: "my Social Media" },
  { name: "my Sales TEAM AI", highlight: true },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-mhsp-line bg-white">
      {/* Service family strip */}
      <div className="border-b border-mhsp-line bg-gradient-to-r from-mhsp-cream-warm/40 via-white to-mhsp-cream-warm/40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-mhsp-gold mb-3">
            The my Sales family of services
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm">
            {SERVICES.map((s, i) => (
              <span key={s.name} className="inline-flex items-center">
                <span
                  className={
                    s.highlight
                      ? "font-display font-semibold text-mhsp-navy bg-mhsp-gold/15 border border-mhsp-gold/40 rounded-full px-3 py-1"
                      : "font-medium text-mhsp-muted"
                  }
                >
                  {s.name}
                  {s.highlight && <span className="ml-1">✨</span>}
                </span>
                {i < SERVICES.length - 1 && (
                  <span className="text-mhsp-muted/40 mx-2 select-none">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3">
          <MhspLogo height={36} />
          <p className="text-sm text-mhsp-muted leading-relaxed max-w-xs">
            AI-powered hotel sales, built on the MHSP method.{" "}
            <span className="text-mhsp-navy font-semibold italic">
              Synergistic Selling. No Fear. Explosive Revenues.
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-display text-sm font-semibold text-mhsp-navy mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-mhsp-muted hover:text-mhsp-navy transition-colors">
                Home
              </Link>
            </li>
            <li>
              <a
                href="https://myhospitalitysalespro.com/services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mhsp-muted hover:text-mhsp-navy transition-colors"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="https://myhospitalitysalespro.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mhsp-muted hover:text-mhsp-navy transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="https://myhospitalitysalespro.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mhsp-muted hover:text-mhsp-navy transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-display text-sm font-semibold text-mhsp-navy mb-3">
            Get In Touch
          </h4>
          <a
            href="tel:8889091678"
            className="flex items-center gap-2 text-sm text-mhsp-navy font-semibold hover:text-mhsp-gold transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            888-909-1678
          </a>
          <a
            href="https://inntelligentcrm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-mhsp-muted hover:text-mhsp-navy transition-colors"
          >
            Partner: <span className="font-display italic">Inntelligent CRM →</span>
          </a>
        </div>
      </div>
      <div className="border-t border-mhsp-line">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-mhsp-muted">
          <span>
            © 2026 My Hospitality Sales Pro × Softqube Heckathon — Built by{" "}
            <span className="font-semibold text-mhsp-navy">Vicky Lalwani</span>
          </span>
          <span className="font-numeric">
            my Sales TEAM AI · v1.1
          </span>
        </div>
      </div>
    </footer>
  );
}
