import Link from "next/link";
import { Phone } from "lucide-react";
import { MhspLogo } from "@/components/MhspLogo";

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-mhsp-line bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <MhspLogo height={36} />
          <p className="text-sm text-mhsp-muted leading-relaxed max-w-xs">
            AI-powered hotel sales, built on the MHSP method. Realize Your Hotel
            Sales Revenue Goals.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-medium text-mhsp-muted">
              Follow us:
            </span>
            <a
              href="https://www.facebook.com/MyHospitalitySalesPro/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="My Hospitality Sales Pro on Facebook"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-mhsp-line bg-white text-mhsp-navy hover:bg-mhsp-navy hover:text-white hover:border-mhsp-navy transition-colors"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
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
        </div>
      </div>
      <div className="border-t border-mhsp-line">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-2 text-sm text-mhsp-muted">
          <span>© 2026 My Hospitality Sales Pro</span>
          <a
            href="https://inntelligentcrm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mhsp-muted hover:text-mhsp-navy transition-colors"
          >
            Partner:{" "}
            <span className="font-semibold text-mhsp-navy">Inntelligent CRM</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
